'use client';

import {
  Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cn } from '../lib/cn';
import styles from './TreeView.module.css';

/**
 * A hierarchy a person opens, walks and chooses from: the ARIA APG **Tree
 * View** pattern (the name Primer, Carbon and Spectrum use; shadcn and Base UI
 * have no tree). Composed by parts:
 *
 * - `TreeView` — the `role="tree"`, named with `aria-label` or
 *   `aria-labelledby` (required).
 * - `TreeViewItem` — one `role="treeitem"`, identified by its `value`.
 * - `TreeViewItemLabel` — what names the item (its accessible name).
 * - `TreeViewItemDescription` — optional secondary text, read after the name:
 *   a summary, or why a `disabled` item cannot be chosen.
 * - `TreeViewGroup` — the item's children, a direct child of the item. An item
 *   with a group is a branch; one without is a leaf. A closed group is not
 *   mounted.
 *
 * Two states, each controlled or not: which branches are open (`expanded`,
 * `defaultExpanded`, `onExpandedChange`) and which item is chosen (`value`,
 * `defaultValue`, `onValueChange`; `aria-selected`). Choosing does **not**
 * follow focus: walking the tree never opens anything, a person chooses with
 * Enter, Space or a click. `onValueChange` is called on every choice, also of
 * the item already chosen, so choosing it again can show its detail again.
 *
 * Keyboard (APG): ↓ ↑ move between visible items; → opens a closed branch, or
 * moves into an open one; ← closes an open branch, or moves to the parent (both
 * mirrored right-to-left); Home and End go to the ends; Enter and Space choose;
 * `*` opens every sibling branch; typing a name's first letters moves to it.
 * One item takes Tab: the chosen one when it is visible, otherwise the one
 * focused last, otherwise the first.
 *
 * A `disabled` item (`aria-disabled`) is still visible, focusable and
 * openable — it is context — but it cannot be chosen.
 *
 * Every part forwards `ref` and `className`. To give focus back to the chosen
 * item after the tree was unmounted (a detail shown as a view of its own on a
 * narrow screen), keep `expanded` and `value`, and focus the chosen item
 * through its `ref`: it is the one that takes Tab.
 *
 * @example
 * <TreeView aria-label="Competency taxonomy" value={chosen} onValueChange={setChosen}>
 *   <TreeViewItem value="people">
 *     <TreeViewItemLabel>People</TreeViewItemLabel>
 *     <TreeViewGroup>
 *       <TreeViewItem value="feedback">
 *         <TreeViewItemLabel>Feedback</TreeViewItemLabel>
 *       </TreeViewItem>
 *     </TreeViewGroup>
 *   </TreeViewItem>
 * </TreeView>
 */
type TreeViewName =
  | { 'aria-label': string; 'aria-labelledby'?: string }
  | { 'aria-label'?: string; 'aria-labelledby': string };

export type TreeViewProps = Omit<
  ComponentPropsWithoutRef<'ul'>,
  'defaultValue' | 'onChange' | 'role' | 'aria-label' | 'aria-labelledby'
> &
  TreeViewName & {
    /** The open branches, by `value` (controlled). */
    expanded?: readonly string[];
    /** The branches open at first (uncontrolled). */
    defaultExpanded?: readonly string[];
    /** Called with every branch open after a branch opens or closes. */
    onExpandedChange?: (expanded: string[]) => void;
    /** The chosen item, or `null` for none (controlled). */
    value?: string | null;
    /** The item chosen at first (uncontrolled). */
    defaultValue?: string | null;
    /** Called each time an item is chosen, also the one already chosen. */
    onValueChange?: (value: string) => void;
    ref?: Ref<HTMLUListElement>;
  };

interface TreeContextValue {
  isExpanded: (value: string) => boolean;
  setExpanded: (value: string, open: boolean) => void;
  expandSiblings: (values: readonly string[]) => void;
  chosen: string | null;
  choose: (value: string) => void;
  tabStop: string | null;
  setActive: (value: string) => void;
  register: (element: HTMLElement, item: RegisteredItem) => void;
  unregister: (element: HTMLElement) => void;
}

interface RegisteredItem {
  value: string;
  isBranch: boolean;
  disabled: boolean;
}

interface ItemContextValue {
  labelId: string;
  descriptionId: string;
}

const TreeContext = createContext<TreeContextValue | null>(null);
const ItemContext = createContext<ItemContextValue | null>(null);
const LevelContext = createContext(1);

/** Typing within this time continues the same search; after it, starts anew. */
const TYPEAHEAD_RESET_MS = 500;

const ITEM_SELECTOR = '[role="treeitem"]';

function useTreeContext(part: string): TreeContextValue {
  const context = useContext(TreeContext);
  if (context === null) throw new Error(`<${part}> must be used inside <TreeView>.`);
  return context;
}

function useItemContext(part: string): ItemContextValue {
  const context = useContext(ItemContext);
  if (context === null) throw new Error(`<${part}> must be used inside <TreeViewItem>.`);
  return context;
}

/** The items a person can reach now, top to bottom: closed groups are not mounted. */
function visibleItemsOf(tree: HTMLElement): HTMLElement[] {
  return Array.from(tree.querySelectorAll<HTMLElement>(ITEM_SELECTOR));
}

/** The item that holds this one in its group, or `null` for a root item. */
function parentItemOf(item: HTMLElement, tree: HTMLElement): HTMLElement | null {
  const parent = item.parentElement?.closest<HTMLElement>(ITEM_SELECTOR) ?? null;
  return parent !== null && tree.contains(parent) ? parent : null;
}

/** The text a person reads as the item's name, for typeahead. */
function nameOf(item: HTMLElement): string {
  const labelId = item.getAttribute('aria-labelledby');
  const label = labelId === null ? null : item.ownerDocument.getElementById(labelId);
  return (label?.textContent ?? '').trim();
}

function isRightToLeft(element: HTMLElement): boolean {
  return getComputedStyle(element).direction === 'rtl';
}

function isPrintableKey(event: KeyboardEvent): boolean {
  return event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
}

export function TreeView({
  expanded: expandedProp,
  defaultExpanded,
  onExpandedChange,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  className,
  onKeyDown,
  onBlur,
  ref,
  children,
  ...rest
}: TreeViewProps) {
  const treeRef = useRef<HTMLUListElement | null>(null);
  const items = useRef(new Map<HTMLElement, RegisteredItem>());
  const typeahead = useRef({ text: '', at: 0 });

  const [uncontrolledExpanded, setUncontrolledExpanded] = useState<readonly string[]>(
    defaultExpanded ?? [],
  );
  const expanded = expandedProp ?? uncontrolledExpanded;
  const expandedSet = useMemo(() => new Set(expanded), [expanded]);

  const [uncontrolledValue, setUncontrolledValue] = useState<string | null>(defaultValue);
  const chosen = valueProp === undefined ? uncontrolledValue : valueProp;

  // The item focused now, while focus is inside the tree; `null` once it leaves,
  // so that coming back with Tab lands on the chosen item, as APG asks.
  const [active, setActiveState] = useState<string | null>(null);
  const [tabStop, setTabStop] = useState<string | null>(chosen);

  const expandedRef = useRef(expanded);
  expandedRef.current = expanded;

  const changeExpanded = useCallback(
    function changeExpanded(next: string[]) {
      if (expandedProp === undefined) setUncontrolledExpanded(next);
      onExpandedChange?.(next);
    },
    [expandedProp, onExpandedChange],
  );

  const setExpanded = useCallback(
    function setExpanded(value: string, open: boolean) {
      const current = expandedRef.current;
      if (open === current.includes(value)) return;
      changeExpanded(
        open ? [...current, value] : current.filter((openValue) => openValue !== value),
      );
    },
    [changeExpanded],
  );

  const expandSiblings = useCallback(
    function expandSiblings(values: readonly string[]) {
      const current = expandedRef.current;
      const closed = values.filter((value) => !current.includes(value));
      if (closed.length > 0) changeExpanded([...current, ...closed]);
    },
    [changeExpanded],
  );

  const choose = useCallback(
    function choose(value: string) {
      if (valueProp === undefined) setUncontrolledValue(value);
      onValueChange?.(value);
    },
    [valueProp, onValueChange],
  );

  const register = useCallback(function register(element: HTMLElement, item: RegisteredItem) {
    items.current.set(element, item);
  }, []);
  const unregister = useCallback(function unregister(element: HTMLElement) {
    items.current.delete(element);
  }, []);

  // After every render, make sure exactly the right visible item takes Tab:
  // the focused one, else the chosen one, else the one that had it, else the
  // first. An item can disappear (its branch closed, the consumer filtered it
  // out), so this is checked against what is mounted, not assumed — on every
  // render, because what is mounted depends on the children, not on a prop.
  // It sets state only when the answer changes, so it settles in one pass.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(function keepOneTabStop() {
    const tree = treeRef.current;
    if (tree === null) return;
    const visible = visibleItemsOf(tree)
      .map((element) => items.current.get(element)?.value)
      .filter((value): value is string => value !== undefined);
    const wanted = active ?? chosen;
    const candidates = [wanted, tabStop, visible.at(0) ?? null];
    const next =
      candidates.find((value): value is string => value !== null && visible.includes(value)) ??
      null;
    if (next !== tabStop) setTabStop(next);
  });

  const setActive = useCallback(function setActive(value: string) {
    setActiveState(value);
  }, []);

  function forgetActiveWhenFocusLeaves(event: FocusEvent<HTMLUListElement>) {
    onBlur?.(event);
    const next = event.relatedTarget as Node | null;
    if (next === null || !event.currentTarget.contains(next)) setActiveState(null);
  }

  function moveFocusTo(item: HTMLElement | null | undefined) {
    item?.focus();
  }

  function moveToTypedName(tree: HTMLElement, current: HTMLElement, key: string) {
    const now = Date.now();
    const continues = now - typeahead.current.at < TYPEAHEAD_RESET_MS;
    const text = continues ? typeahead.current.text + key : key;
    typeahead.current = { text, at: now };

    const visible = visibleItemsOf(tree);
    const start = visible.indexOf(current);
    // A new search starts after the current item, so pressing the same letter
    // again walks the items that start with it; a continued one includes it.
    const offset = continues && text.length > 1 ? 0 : 1;
    const collator = new Intl.Collator(undefined, { sensitivity: 'base', usage: 'search' });
    for (let step = 0; step < visible.length; step += 1) {
      const candidate = visible[(start + offset + step) % visible.length]!;
      const name = nameOf(candidate);
      if (collator.compare(name.slice(0, text.length), text) === 0) {
        moveFocusTo(candidate);
        return;
      }
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const tree = treeRef.current;
    const current = (event.target as HTMLElement).closest<HTMLElement>(ITEM_SELECTOR);
    // Only keys pressed on an item itself: never on a control a consumer put
    // inside one, nor on an item of a tree nested in this one.
    if (tree === null || current === null || current !== event.target) return;
    if (current.closest('[role="tree"]') !== tree) return;
    const item = items.current.get(current);
    if (item === undefined) return;

    const visible = visibleItemsOf(tree);
    const index = visible.indexOf(current);
    const isOpen = item.isBranch && expandedSet.has(item.value);
    const rtl = isRightToLeft(tree);
    const inward = rtl ? 'ArrowLeft' : 'ArrowRight';
    const outward = rtl ? 'ArrowRight' : 'ArrowLeft';

    function handled() {
      event.preventDefault();
      event.stopPropagation();
    }

    switch (event.key) {
      case 'ArrowDown':
        handled();
        moveFocusTo(visible.at(index + 1));
        return;
      case 'ArrowUp':
        handled();
        if (index > 0) moveFocusTo(visible.at(index - 1));
        return;
      case 'Home':
        handled();
        moveFocusTo(visible.at(0));
        return;
      case 'End':
        handled();
        moveFocusTo(visible.at(-1));
        return;
      case inward: {
        handled();
        if (!item.isBranch) return;
        if (!isOpen) {
          setExpanded(item.value, true);
          return;
        }
        const next = visible.at(index + 1);
        if (next !== undefined && parentItemOf(next, tree) === current) moveFocusTo(next);
        return;
      }
      case outward:
        handled();
        if (isOpen) setExpanded(item.value, false);
        else moveFocusTo(parentItemOf(current, tree));
        return;
      case 'Enter':
      case ' ':
        handled();
        if (!item.disabled) choose(item.value);
        return;
      case '*': {
        handled();
        const parent = parentItemOf(current, tree);
        const siblings = visible
          .filter((candidate) => parentItemOf(candidate, tree) === parent)
          .map((candidate) => items.current.get(candidate))
          .filter((sibling): sibling is RegisteredItem => sibling?.isBranch === true)
          .map((sibling) => sibling.value);
        expandSiblings(siblings);
        return;
      }
      default:
        if (isPrintableKey(event)) {
          handled();
          moveToTypedName(tree, current, event.key);
        }
    }
  }

  const context = useMemo<TreeContextValue>(
    () => ({
      isExpanded: (value) => expandedSet.has(value),
      setExpanded,
      expandSiblings,
      chosen,
      choose,
      tabStop,
      setActive,
      register,
      unregister,
    }),
    [
      expandedSet,
      setExpanded,
      expandSiblings,
      chosen,
      choose,
      tabStop,
      setActive,
      register,
      unregister,
    ],
  );

  const setRefs = useCallback(
    function setRefs(element: HTMLUListElement | null) {
      treeRef.current = element;
      if (typeof ref === 'function') return ref(element);
      if (ref) ref.current = element;
    },
    [ref],
  );

  return (
    <TreeContext.Provider value={context}>
      <LevelContext.Provider value={1}>
        <ul
          role="tree"
          data-pharos-slot="tree-view"
          className={cn(styles.tree, className)}
          onKeyDown={handleKeyDown}
          onBlur={forgetActiveWhenFocusLeaves}
          {...rest}
          ref={setRefs}
        >
          {children}
        </ul>
      </LevelContext.Provider>
    </TreeContext.Provider>
  );
}

TreeView.displayName = 'TreeView';

export interface TreeViewItemProps extends Omit<
  ComponentPropsWithoutRef<'li'>,
  'role' | 'value' | 'onSelect'
> {
  /** Identifies the item in `expanded` and `value`; unique in the tree. */
  value: string;
  /**
   * Shown, focusable and openable, but it cannot be chosen
   * (`aria-disabled`). Say why in a `TreeViewItemDescription`.
   */
  disabled?: boolean;
  ref?: Ref<HTMLLIElement>;
}

function isGroup(node: ReactNode): node is ReactElement {
  return isValidElement(node) && node.type === TreeViewGroup;
}

function isDescription(node: ReactNode): boolean {
  return isValidElement(node) && node.type === TreeViewItemDescription;
}

export function TreeViewItem({
  value,
  disabled = false,
  className,
  onFocus,
  ref,
  children,
  ...rest
}: TreeViewItemProps) {
  const tree = useTreeContext('TreeViewItem');
  const level = useContext(LevelContext);
  const id = useId();
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;
  const element = useRef<HTMLLIElement | null>(null);

  const parts = Children.toArray(children);
  const group = parts.find(isGroup);
  const rowParts = parts.filter((part) => !isGroup(part));
  const hasDescription = rowParts.some(isDescription);
  const isBranch = group !== undefined;
  const isOpen = isBranch && tree.isExpanded(value);
  const isChosen = tree.chosen === value;

  const { register, unregister } = tree;
  useLayoutEffect(
    function registerTheItem() {
      const node = element.current;
      if (node === null) return;
      register(node, { value, isBranch, disabled });
      return () => unregister(node);
    },
    [register, unregister, value, isBranch, disabled],
  );

  const setRefs = useCallback(
    function setRefs(node: HTMLLIElement | null) {
      element.current = node;
      if (typeof ref === 'function') return ref(node);
      if (ref) ref.current = node;
    },
    [ref],
  );

  function toggle(event: MouseEvent<HTMLSpanElement>) {
    // The chevron opens and closes; it does not choose the item.
    event.stopPropagation();
    const node = element.current;
    // Closing a branch while focus is on one of its children would drop focus
    // on <body>: it goes to the branch instead.
    const focused = node?.ownerDocument.activeElement ?? null;
    if (isOpen && node !== null && focused !== node && node.contains(focused)) node.focus();
    tree.setExpanded(value, !isOpen);
  }

  function chooseOnClick() {
    if (!disabled) tree.choose(value);
    element.current?.focus();
  }

  const itemContext = useMemo(() => ({ labelId, descriptionId }), [labelId, descriptionId]);

  return (
    <ItemContext.Provider value={itemContext}>
      <li
        role="treeitem"
        data-pharos-slot="tree-view-item"
        data-pharos-level={level}
        data-pharos-expanded={isBranch ? String(isOpen) : undefined}
        data-pharos-selected={String(isChosen)}
        data-pharos-disabled={disabled ? 'true' : undefined}
        aria-level={level}
        aria-expanded={isBranch ? isOpen : undefined}
        aria-selected={isChosen}
        aria-disabled={disabled ? true : undefined}
        aria-labelledby={labelId}
        aria-describedby={hasDescription ? descriptionId : undefined}
        tabIndex={tree.tabStop === value ? 0 : -1}
        className={cn(styles.item, className)}
        onFocus={function rememberFocus(event) {
          onFocus?.(event);
          if (event.target === event.currentTarget) tree.setActive(value);
        }}
        {...rest}
        ref={setRefs}
      >
        <div className={styles.row} data-pharos-slot="tree-view-item-row" onClick={chooseOnClick}>
          {Array.from({ length: level - 1 }, (_, guide) => (
            <span key={guide} aria-hidden="true" className={styles.guide} />
          ))}
          <span
            aria-hidden="true"
            data-pharos-slot="tree-view-item-toggle"
            className={styles.toggle}
            onClick={isBranch ? toggle : undefined}
          >
            {isBranch && (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={styles.chevron}
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            )}
          </span>
          <span className={styles.content}>{rowParts}</span>
        </div>
        {isOpen && <LevelContext.Provider value={level + 1}>{group}</LevelContext.Provider>}
      </li>
    </ItemContext.Provider>
  );
}

TreeViewItem.displayName = 'TreeViewItem';

export interface TreeViewItemLabelProps extends ComponentPropsWithoutRef<'span'> {
  ref?: Ref<HTMLSpanElement>;
}

/** The item's name: what a screen reader announces and typeahead matches. */
export function TreeViewItemLabel({ className, ...rest }: TreeViewItemLabelProps) {
  const { labelId } = useItemContext('TreeViewItemLabel');
  return (
    <span
      id={labelId}
      data-pharos-slot="tree-view-item-label"
      className={cn(styles.label, className)}
      {...rest}
    />
  );
}

TreeViewItemLabel.displayName = 'TreeViewItemLabel';

export interface TreeViewItemDescriptionProps extends ComponentPropsWithoutRef<'span'> {
  ref?: Ref<HTMLSpanElement>;
}

/** Secondary text read after the name — a summary, or why it cannot be chosen. */
export function TreeViewItemDescription({ className, ...rest }: TreeViewItemDescriptionProps) {
  const { descriptionId } = useItemContext('TreeViewItemDescription');
  return (
    <span
      id={descriptionId}
      data-pharos-slot="tree-view-item-description"
      className={cn(styles.description, className)}
      {...rest}
    />
  );
}

TreeViewItemDescription.displayName = 'TreeViewItemDescription';

export interface TreeViewGroupProps extends Omit<ComponentPropsWithoutRef<'ul'>, 'role'> {
  ref?: Ref<HTMLUListElement>;
}

/** The children of a `TreeViewItem`; place it directly inside the item. */
export function TreeViewGroup({ className, ...rest }: TreeViewGroupProps) {
  useItemContext('TreeViewGroup');
  return (
    <ul
      role="group"
      data-pharos-slot="tree-view-group"
      className={cn(styles.group, className)}
      {...rest}
    />
  );
}

TreeViewGroup.displayName = 'TreeViewGroup';
