import { useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { tokens } from '@code-sherpas/pharos-tokens';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
  Button,
  SidePanel,
  SidePanelClose,
  SidePanelContent,
  SidePanelDescription,
  SidePanelFooter,
  SidePanelHeader,
  SidePanelTitle,
  TreeView,
  TreeViewGroup,
  TreeViewItem,
  TreeViewItemDescription,
  TreeViewItemLabel,
  useToast,
} from '@code-sherpas/pharos-react';
import { EditDescriptionDialog } from '../components/EditDescriptionDialog';
import { ItemActions, type SecondaryAction } from '../components/ItemActions';
import { NewPillarDialog, type NewPillar } from '../components/NewPillarDialog';

interface Element {
  id: string;
  kind: string;
  name: string;
  summary?: string;
  /** How many assessments already rated it. */
  assessments?: number;
  /** Comes from the organisation's template: it cannot be changed here. */
  fromTemplate?: boolean;
  children?: Element[];
}

/** Five levels: pillar → category → competency → skill → behaviour. */
const TAXONOMY: Element[] = [
  {
    id: 'people',
    kind: 'Pillar',
    name: 'People',
    fromTemplate: true,
    children: [
      {
        id: 'collaboration',
        kind: 'Category',
        name: 'Collaboration across teams and disciplines in a distributed organisation',
        children: [
          {
            id: 'feedback',
            kind: 'Competency',
            name: 'Feedback',
            children: [
              {
                id: 'listening',
                kind: 'Skill',
                name: 'Active listening',
                children: [
                  {
                    id: 'paraphrases',
                    kind: 'Behaviour',
                    name: 'Paraphrases',
                    summary:
                      'Paraphrases what was said and asks open questions before proposing a solution of their own',
                    assessments: 7,
                  },
                  {
                    id: 'silence',
                    kind: 'Behaviour',
                    name: 'Leaves silence',
                    summary: 'Leaves room for the other person to finish their thought',
                  },
                ],
              },
            ],
          },
          { id: 'facilitation', kind: 'Competency', name: 'Facilitation' },
        ],
      },
    ],
  },
  {
    id: 'delivery',
    kind: 'Pillar',
    name: 'Delivery',
    fromTemplate: true,
    children: [{ id: 'planning', kind: 'Category', name: 'Planning' }],
  },
];

function index(elements: Element[], parents: Element[] = [], into = new Map<string, Element[]>()) {
  for (const element of elements) {
    into.set(element.id, [...parents, element]);
    if (element.children) index(element.children, [...parents, element], into);
  }
  return into;
}

/** The elements without the one deleted, wherever it was. */
function withoutElement(elements: Element[], id: string): Element[] {
  return elements
    .filter((element) => element.id !== id)
    .map(function withoutItInside(element) {
      return element.children
        ? { ...element, children: withoutElement(element.children, id) }
        : element;
    });
}

function insertAt(elements: Element[], position: number, inserted: Element): Element[] {
  return [...elements.slice(0, position), inserted, ...elements.slice(position)];
}

/** The elements with `restored` back at `position` under `parentId` (null: a root). */
function withElementAt(
  elements: Element[],
  parentId: string | null,
  position: number,
  restored: Element,
): Element[] {
  if (parentId === null) return insertAt(elements, position, restored);
  return elements.map(function withItInside(element) {
    if (element.id === parentId) {
      return { ...element, children: insertAt(element.children ?? [], position, restored) };
    }
    return element.children
      ? { ...element, children: withElementAt(element.children, parentId, position, restored) }
      : element;
  });
}

/**
 * Focuses the title of the detail when its own view appears. At module level so
 * its identity is stable: React calls it when the heading mounts, not again on
 * every render, which would take focus away from the action just used.
 */
function focusOnArrival(heading: HTMLHeadingElement | null) {
  heading?.focus();
}

const WIDE = `(min-width: ${tokens.breakpoint.panel})`;

function subscribeToWidth(onChange: () => void) {
  const query = window.matchMedia(WIDE);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function isWideNow() {
  return window.matchMedia(WIDE).matches;
}

/** Descriptions edited in this session, by element id, over the ones above. */
type Summaries = Record<string, string>;

/** The elements retired in this session, by id. */
type Retired = Record<string, boolean>;

interface ItemsProps {
  elements: Element[];
  chosen: string | null;
  chosenRef: React.Ref<HTMLLIElement>;
  summaries: Summaries;
  retired: Retired;
}

function Items({ elements, chosenRef, chosen, summaries, retired }: ItemsProps) {
  return elements.map(function anItem(element) {
    const summary = summaries[element.id] ?? element.summary;
    return (
      <TreeViewItem
        key={element.id}
        value={element.id}
        // Typing matches the name; the level badge stays in the label, so it
        // is still part of the accessible name (WCAG 2.5.3).
        textValue={element.name}
        ref={element.id === chosen ? chosenRef : undefined}
      >
        <TreeViewItemLabel>
          <Badge variant="accent-soft">{element.kind}</Badge> {element.name}
          {retired[element.id] && (
            <>
              {' '}
              <Badge variant="outline">Retired</Badge>
            </>
          )}
        </TreeViewItemLabel>
        {summary && <TreeViewItemDescription>{summary}</TreeViewItemDescription>}
        {element.children && (
          <TreeViewGroup>
            <Items
              elements={element.children}
              chosen={chosen}
              chosenRef={chosenRef}
              summaries={summaries}
              retired={retired}
            />
          </TreeViewGroup>
        )}
      </TreeViewItem>
    );
  });
}

interface DetailProps {
  element: Element;
  path: Element[];
  summary: string | undefined;
}

/**
 * The body of the detail. Its actions are not here but beside its title (see
 * `ItemActions`); here, what explains the ones it does not offer.
 */
function Detail({ element, path, summary }: DetailProps) {
  return (
    <div className="taxonomy-detail">
      <p>{summary ?? `A ${element.kind.toLowerCase()} of the taxonomy.`}</p>
      {path.length > 1 && (
        <p>
          Inside:{' '}
          {path
            .slice(0, -1)
            .map((parent) => parent.name)
            .join(' › ')}
        </p>
      )}
      {element.fromTemplate && (
        <p className="hint-text">
          It comes from the organisation’s template, so it cannot be changed here. An administrator
          changes it in the template.
        </p>
      )}
      {(element.assessments ?? 0) > 0 && (
        <p className="hint-text">
          It cannot be moved or deleted: assessments already rated it, and that would change what
          they mean. Retire it instead.
        </p>
      )}
      {!element.fromTemplate &&
        (element.assessments ?? 0) === 0 &&
        (element.children?.length ?? 0) > 0 && (
          <p className="hint-text">
            It cannot be deleted while it has elements inside. Delete or move them first.
          </p>
        )}
    </div>
  );
}

/** Where a deleted element was, to put it back if the deletion is undone. */
interface Deletion {
  element: Element;
  parentId: string | null;
  position: number;
}

/**
 * A five-level taxonomy shown as a TreeView. Choosing an element shows its
 * detail: beside the tree in a SidePanel from the panel breakpoint up, and
 * below it as a view of its own with «Back», which gives focus back to the
 * element chosen — the list-detail layout. The open branches and the chosen
 * element live here, so the tree comes back as it was. «New pillar» opens the
 * form that creates one in a Dialog, full screen on a phone, and the pillar
 * created joins the tree.
 *
 * Beside the detail's title go its actions, the «Actions on an item» pattern
 * (`ItemActions`): from none to four, by element. The pillars of the template
 * have none; an element already assessed can be edited and retired, not moved
 * or deleted; the rest can also be moved, and deleted when nothing hangs below
 * them. «Edit description», the principal one, opens a form in a Dialog with an
 * Alert warning before saving when the element was assessed; «Retire» marks it
 * retired and «Reinstate» takes that back; «Delete» asks first in an
 * AlertDialog and can be undone from the toast; «Move» is not part of this demo
 * and says so.
 */
export function TaxonomyPage() {
  const isWide = useSyncExternalStore(subscribeToWidth, isWideNow, () => true);
  const [expanded, setExpanded] = useState<string[]>(['people']);
  const [chosen, setChosen] = useState<string | null>(null);
  const [showingDetail, setShowingDetail] = useState(false);
  const [roots, setRoots] = useState<Element[]>(TAXONOMY);
  const [summaries, setSummaries] = useState<Summaries>({});
  const [retired, setRetired] = useState<Retired>({});
  // Kept after closing so the title does not empty out during the exit motion.
  const [deletion, setDeletion] = useState<Deletion | null>(null);
  const [confirmingDeletion, setConfirmingDeletion] = useState(false);
  const createdCount = useRef(0);
  const returning = useRef(false);
  const chosenItem = useRef<HTMLLIElement | null>(null);
  const treeHeading = useRef<HTMLHeadingElement>(null);
  const actions = useRef<HTMLDivElement>(null);
  const deleted = useRef(false);
  const toast = useToast();
  /** For each element, its chain from the root down to itself. */
  const paths = useMemo(() => index(roots), [roots]);
  const path = chosen === null ? [] : (paths.get(chosen) ?? []);
  const element = path.at(-1);

  function addPillar(pillar: NewPillar) {
    createdCount.current += 1;
    const created: Element = {
      id: `new-pillar-${createdCount.current}`,
      kind: 'Pillar',
      name: pillar.name,
      summary: pillar.description === '' ? undefined : pillar.description,
    };
    setRoots((current) => [...current, created]);
  }

  function choose(value: string) {
    setChosen(value);
    setShowingDetail(true);
  }

  function closeDetail() {
    setShowingDetail(false);
    returning.current = true;
  }

  function focusTheChosenItem(node: HTMLLIElement | null) {
    chosenItem.current = node;
    if (node !== null && returning.current) {
      returning.current = false;
      node.focus();
    }
  }

  function retireOrReinstate(target: Element) {
    const retiring = retired[target.id] !== true;
    setRetired((current) => ({ ...current, [target.id]: retiring }));
    toast.add({ title: `${target.name} ${retiring ? 'retired' : 'reinstated'}.` });
  }

  function sayMovingIsOutOfTheDemo() {
    toast.add({ title: 'Moving an element is not part of this demo.' });
  }

  function askToDelete(target: Element, targetPath: Element[]) {
    const parent = targetPath.at(-2);
    const siblings = parent ? (parent.children ?? []) : roots;
    deleted.current = false;
    setDeletion({
      element: target,
      parentId: parent?.id ?? null,
      position: siblings.findIndex((sibling) => sibling.id === target.id),
    });
    setConfirmingDeletion(true);
  }

  /**
   * Takes the element out of the tree and closes its detail; focus goes to its
   * parent in the tree, or to the page's title for a pillar. The toast can put
   * it back where it was.
   */
  function confirmDeletion() {
    if (deletion === null) return;
    const { element: gone, parentId, position } = deletion;
    deleted.current = true;
    setRoots((current) => withoutElement(current, gone.id));
    setChosen(parentId);
    setShowingDetail(false);
    returning.current = parentId !== null;
    toast.add({
      title: `${gone.name} deleted.`,
      action: {
        children: 'Undo',
        onClick: function putItBack() {
          setRoots((current) => withElementAt(current, parentId, position, gone));
        },
      },
    });
  }

  /** After deleting, the parent (or the title); after cancelling, the action that asked. */
  function focusAfterConfirmation(): HTMLElement | null {
    if (deleted.current) return chosenItem.current ?? treeHeading.current;
    return (
      actions.current?.querySelector<HTMLElement>(
        '[data-item-action="more"], [data-item-action="delete"]',
      ) ?? null
    );
  }

  /** What the element allows besides editing, in the order they are shown. */
  function secondaryActionsFor(target: Element, targetPath: Element[]): SecondaryAction[] {
    if (target.fromTemplate) return [];
    const isRetired = retired[target.id] === true;
    const retire: SecondaryAction = {
      id: isRetired ? 'reinstate' : 'retire',
      label: isRetired ? 'Reinstate' : 'Retire',
      onSelect: () => retireOrReinstate(target),
    };
    if ((target.assessments ?? 0) > 0) return [retire];
    const move: SecondaryAction = { id: 'move', label: 'Move', onSelect: sayMovingIsOutOfTheDemo };
    const remove: SecondaryAction = {
      id: 'delete',
      label: 'Delete',
      destructive: true,
      onSelect: () => askToDelete(target, targetPath),
    };
    const hasChildren = (target.children?.length ?? 0) > 0;
    if (target.kind === 'Pillar') return hasChildren ? [] : [remove];
    return hasChildren ? [move, retire] : [move, retire, remove];
  }

  const summary = element && (summaries[element.id] ?? element.summary);
  const badges = element && (
    <div className="item-badges">
      <Badge variant="accent-soft">{element.kind}</Badge>
      {retired[element.id] && <Badge variant="outline">Retired</Badge>}
    </div>
  );
  const itemActions = element && (
    <ItemActions
      ref={actions}
      primary={
        element.fromTemplate ? undefined : (
          <EditDescriptionDialog
            key={element.id}
            name={element.name}
            description={summary ?? ''}
            assessments={element.assessments ?? 0}
            onSave={function keepTheSummary(next) {
              setSummaries((previous) => ({ ...previous, [element.id]: next }));
            }}
          />
        )
      }
      secondary={secondaryActionsFor(element, path)}
    />
  );
  const detail = element && <Detail element={element} path={path} summary={summary} />;

  const deleteConfirmation = (
    <AlertDialog open={confirmingDeletion} onOpenChange={setConfirmingDeletion}>
      <AlertDialogContent finalFocus={focusAfterConfirmation}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {deletion?.element.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            It leaves the taxonomy. No assessment has rated it yet.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep {deletion?.element.name}</AlertDialogCancel>
          <AlertDialogAction intent="destructive" onClick={confirmDeletion}>
            Delete {deletion?.element.name}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  if (!isWide && showingDetail && element !== undefined) {
    return (
      <main className="shell-main taxonomy-own-view">
        <Button intent="ghost" size="sm" onClick={closeDetail}>
          Back to the taxonomy
        </Button>
        <div className="item-head">
          {badges}
          <h1 tabIndex={-1} ref={focusOnArrival}>
            {element.name}
          </h1>
          {itemActions}
        </div>
        {detail}
        {deleteConfirmation}
      </main>
    );
  }

  return (
    <div className="report">
      <SidePanel
        open={isWide && showingDetail}
        onOpenChange={function closeWhenAsked(open) {
          if (!open) setShowingDetail(false);
        }}
      >
        <main className="shell-main report-body">
          <div className="page-head">
            <h1 ref={treeHeading} tabIndex={-1}>
              Competency taxonomy
            </h1>
            <NewPillarDialog onCreate={addPillar} />
          </div>
          <TreeView
            aria-label="Competency taxonomy"
            className="taxonomy-tree"
            expanded={expanded}
            onExpandedChange={setExpanded}
            value={chosen}
            onValueChange={choose}
          >
            <Items
              elements={roots}
              chosen={chosen}
              chosenRef={focusTheChosenItem}
              summaries={summaries}
              retired={retired}
            />
          </TreeView>
        </main>
        <SidePanelContent>
          {element && (
            <>
              <SidePanelHeader>
                {badges}
                <SidePanelTitle>{element.name}</SidePanelTitle>
                <SidePanelDescription>Detail of the element chosen.</SidePanelDescription>
                {itemActions}
              </SidePanelHeader>
              {detail}
              <SidePanelFooter>
                <SidePanelClose render={<Button intent="ghost">Close</Button>} />
              </SidePanelFooter>
            </>
          )}
        </SidePanelContent>
      </SidePanel>
      {deleteConfirmation}
    </div>
  );
}
