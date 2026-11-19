import { useMemo, useRef, useState, useSyncExternalStore } from 'react';
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
import { EditDescriptionDialog } from '../components/EditDescriptionDialog';
import { NewPillarDialog, type NewPillar } from '../components/NewPillarDialog';

interface Element {
  id: string;
  kind: string;
  name: string;
  summary?: string;
  /** How many assessments already rated it. */
  assessments?: number;
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

interface ItemsProps {
  elements: Element[];
  chosen: string | null;
  chosenRef: React.Ref<HTMLLIElement>;
  summaries: Summaries;
}

function Items({ elements, chosenRef, chosen, summaries }: ItemsProps) {
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
        </TreeViewItemLabel>
        {summary && <TreeViewItemDescription>{summary}</TreeViewItemDescription>}
        {element.children && (
          <TreeViewGroup>
            <Items
              elements={element.children}
              chosen={chosen}
              chosenRef={chosenRef}
              summaries={summaries}
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
  onSummaryChange: (summary: string) => void;
}

function Detail({ element, path, summary, onSummaryChange }: DetailProps) {
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
      <EditDescriptionDialog
        key={element.id}
        name={element.name}
        description={summary ?? ''}
        assessments={element.assessments ?? 0}
        onSave={onSummaryChange}
      />
    </div>
  );
}

/**
 * A five-level taxonomy shown as a TreeView. Choosing an element shows its
 * detail: beside the tree in a SidePanel from the panel breakpoint up, and
 * below it as a view of its own with «Back», which gives focus back to the
 * element chosen — the list-detail layout. The open branches and the chosen
 * element live here, so the tree comes back as it was. «New pillar» opens the
 * form that creates one in a Dialog, full screen on a phone, and the pillar
 * created joins the tree. «Edit description», in the detail, opens a form in a
 * Dialog with an Alert warning before saving when the element was assessed.
 */
export function TaxonomyPage() {
  const isWide = useSyncExternalStore(subscribeToWidth, isWideNow, () => true);
  const [expanded, setExpanded] = useState<string[]>(['people']);
  const [chosen, setChosen] = useState<string | null>(null);
  const [showingDetail, setShowingDetail] = useState(false);
  const [roots, setRoots] = useState<Element[]>(TAXONOMY);
  const createdCount = useRef(0);
  const returning = useRef(false);
  /** For each element, its chain from the root down to itself. */
  const paths = useMemo(() => index(roots), [roots]);
  const path = chosen === null ? [] : (paths.get(chosen) ?? []);
  const element = path.at(-1);
  const [summaries, setSummaries] = useState<Summaries>({});
  const detail = element && (
    <Detail
      element={element}
      path={path}
      summary={summaries[element.id] ?? element.summary}
      onSummaryChange={function keepTheSummary(summary) {
        setSummaries((previous) => ({ ...previous, [element.id]: summary }));
      }}
    />
  );

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
        {detail}
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
            <h1>Competency taxonomy</h1>
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
            />
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
              {detail}
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
