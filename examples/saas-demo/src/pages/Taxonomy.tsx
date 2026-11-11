import { useRef, useState, useSyncExternalStore } from 'react';
import { tokens } from '@code-sherpas/pharos-tokens';
import {
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
} from '@code-sherpas/pharos-react';

interface Element {
  id: string;
  kind: string;
  name: string;
  summary?: string;
  children?: Element[];
}

/** Five levels: pillar → category → competency → skill → behaviour. */
const TAXONOMY: Element[] = [
  {
    id: 'people',
    kind: 'Pillar',
    name: 'People',
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

/** For each element, its chain from the root down to itself. */
const PATHS = index(TAXONOMY);

const WIDE = `(min-width: ${tokens.breakpoint.panel})`;

function subscribeToWidth(onChange: () => void) {
  const query = window.matchMedia(WIDE);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function isWideNow() {
  return window.matchMedia(WIDE).matches;
}

interface ItemsProps {
  elements: Element[];
  chosen: string | null;
  chosenRef: React.Ref<HTMLLIElement>;
}

function Items({ elements, chosenRef, chosen }: ItemsProps) {
  return elements.map(function anItem(element) {
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
        </TreeViewItemLabel>
        {element.summary && <TreeViewItemDescription>{element.summary}</TreeViewItemDescription>}
        {element.children && (
          <TreeViewGroup>
            <Items elements={element.children} chosen={chosen} chosenRef={chosenRef} />
          </TreeViewGroup>
        )}
      </TreeViewItem>
    );
  });
}

function Detail({ element }: { element: Element }) {
  const path = PATHS.get(element.id) ?? [];
  return (
    <div className="taxonomy-detail">
      <p>{element.summary ?? `A ${element.kind.toLowerCase()} of the taxonomy.`}</p>
      {path.length > 1 && (
        <p>
          Inside:{' '}
          {path
            .slice(0, -1)
            .map((parent) => parent.name)
            .join(' › ')}
        </p>
      )}
    </div>
  );
}

/**
 * A five-level taxonomy shown as a TreeView. Choosing an element shows its
 * detail: beside the tree in a SidePanel from the panel breakpoint up, and
 * below it as a view of its own with «Back», which gives focus back to the
 * element chosen — the list-detail layout. The open branches and the chosen
 * element live here, so the tree comes back as it was.
 */
export function TaxonomyPage() {
  const isWide = useSyncExternalStore(subscribeToWidth, isWideNow, () => true);
  const [expanded, setExpanded] = useState<string[]>(['people']);
  const [chosen, setChosen] = useState<string | null>(null);
  const [showingDetail, setShowingDetail] = useState(false);
  const returning = useRef(false);
  const element = chosen === null ? undefined : PATHS.get(chosen)?.at(-1);

  function choose(value: string) {
    setChosen(value);
    setShowingDetail(true);
  }

  function closeDetail() {
    setShowingDetail(false);
    returning.current = true;
  }

  function focusTheChosenItem(node: HTMLLIElement | null) {
    if (node !== null && returning.current) {
      returning.current = false;
      node.focus();
    }
  }

  function focusTheHeading(heading: HTMLHeadingElement | null) {
    heading?.focus();
  }

  if (!isWide && showingDetail && element !== undefined) {
    return (
      <main className="shell-main taxonomy-own-view">
        <Button intent="ghost" size="sm" onClick={closeDetail}>
          Back to the taxonomy
        </Button>
        <Badge variant="accent-soft">{element.kind}</Badge>
        <h1 tabIndex={-1} ref={focusTheHeading}>
          {element.name}
        </h1>
        <Detail element={element} />
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
          <h1>Competency taxonomy</h1>
          <TreeView
            aria-label="Competency taxonomy"
            className="taxonomy-tree"
            expanded={expanded}
            onExpandedChange={setExpanded}
            value={chosen}
            onValueChange={choose}
          >
            <Items elements={TAXONOMY} chosen={chosen} chosenRef={focusTheChosenItem} />
          </TreeView>
        </main>
        <SidePanelContent>
          {element && (
            <>
              <SidePanelHeader>
                <Badge variant="accent-soft">{element.kind}</Badge>
                <SidePanelTitle>{element.name}</SidePanelTitle>
                <SidePanelDescription>Detail of the element chosen.</SidePanelDescription>
              </SidePanelHeader>
              <Detail element={element} />
              <SidePanelFooter>
                <SidePanelClose render={<Button intent="ghost">Close</Button>} />
              </SidePanelFooter>
            </>
          )}
        </SidePanelContent>
      </SidePanel>
    </div>
  );
}
