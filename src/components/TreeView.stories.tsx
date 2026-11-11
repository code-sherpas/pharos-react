import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import {
  TreeView,
  TreeViewGroup,
  TreeViewItem,
  TreeViewItemDescription,
  TreeViewItemLabel,
} from './TreeView';
import { Badge } from './Badge';

/**
 * `TreeView` shows a hierarchy a person opens, walks and chooses from — the
 * ARIA APG Tree View. Use it for a hierarchy of several levels where the
 * structure itself is what the person reads (a taxonomy, an org chart, a
 * folder tree). For one level of options use a `Select`, `RadioGroup` or a
 * list; for navigation between pages use links.
 *
 * Keyboard: ↓ ↑ move, → opens or goes in, ← closes or goes up, Home / End,
 * Enter or Space choose, `*` opens the siblings, typing jumps to a name. One
 * tab stop. Choosing never follows focus. A `disabled` item stays visible,
 * focusable and openable, and cannot be chosen.
 *
 * To show the chosen item's detail, put the tree beside a `SidePanel` on a
 * wide screen, and on a narrow one show the detail as a view of its own with a
 * way back that focuses the chosen item again (see `TreeViewItem`'s `ref`).
 */
const meta: Meta<typeof TreeView> = {
  title: 'Components/TreeView',
  component: TreeView,
};

export default meta;
type Story = StoryObj<typeof meta>;

interface Node {
  id: string;
  kind: string;
  name: string;
  description?: string;
  children?: Node[];
}

const LEVELS = ['Pillar', 'Category', 'Competency', 'Skill', 'Behaviour'];

/** A five-level taxonomy: 3 pillars, 6 categories, 12 competencies, 24 skills, 96 behaviours = 141 items. */
function taxonomy(): Node[] {
  function level(depth: number, prefix: string, count: number): Node[] {
    return Array.from({ length: count }, (_, index) => {
      const id = `${prefix}${index + 1}`;
      const kind = LEVELS[depth]!;
      const isLeaf = depth === LEVELS.length - 1;
      return {
        id,
        kind,
        name: isLeaf
          ? `Asks open questions and paraphrases what was said before proposing a solution (${id})`
          : `${kind} ${id}`,
        ...(isLeaf
          ? {}
          : { children: level(depth + 1, `${id}.`, depth + 1 === LEVELS.length - 1 ? 4 : 2) }),
      };
    });
  }
  return level(0, '', 3);
}

const TAXONOMY = taxonomy();

function Items({ nodes }: { nodes: Node[] }) {
  return nodes.map((node) => (
    <TreeViewItem key={node.id} value={node.id}>
      <TreeViewItemLabel>
        <Badge variant="accent-soft">{node.kind}</Badge> {node.name}
      </TreeViewItemLabel>
      {node.children && (
        <TreeViewGroup>
          <Items nodes={node.children} />
        </TreeViewGroup>
      )}
    </TreeViewItem>
  ));
}

function Frame({ children, width }: { children: React.ReactNode; width?: string }) {
  return (
    <div
      style={{
        width: width ?? '100%',
        maxWidth: '40rem',
        padding: 'var(--pharos-spacing-2)',
        border: '1px solid var(--pharos-color-border-subtle)',
        borderRadius: 'var(--pharos-radius-2xl)',
        background: 'var(--pharos-color-surface-card)',
        boxSizing: 'border-box',
      }}
    >
      {children}
    </div>
  );
}

function ChooseAndShow() {
  const [chosen, setChosen] = useState<string | null>(null);
  return (
    <div style={{ display: 'grid', gap: 'var(--pharos-spacing-3)' }}>
      <Frame>
        <TreeView
          aria-label="Competency taxonomy"
          defaultExpanded={['1', '1.1']}
          value={chosen}
          onValueChange={setChosen}
        >
          <Items nodes={TAXONOMY} />
        </TreeView>
      </Frame>
      <p role="status" style={{ margin: 0 }}>
        {chosen === null ? 'Nothing chosen' : `Chosen: ${chosen}`}
      </p>
    </div>
  );
}

/** 141 items over five levels, the size it is built for. */
export const Default: Story = {
  render: () => <ChooseAndShow />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('treeitem', { name: 'Pillar Pillar 1' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(canvas.getByRole('treeitem', { name: 'Category Category 1.1' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(canvas.getByRole('status')).toHaveTextContent('Chosen: 1.1');
  },
};

/** Every branch open: long names wrap, never truncated. Try it at 320px and at 200% zoom. */
export const LongNamesAllOpen: Story = {
  render: () => {
    const every: string[] = [];
    function collect(nodes: Node[]) {
      for (const node of nodes) {
        if (node.children) {
          every.push(node.id);
          collect(node.children);
        }
      }
    }
    collect(TAXONOMY.slice(0, 1));
    return (
      <Frame width="320px">
        <TreeView aria-label="Competency taxonomy" defaultExpanded={every}>
          <Items nodes={TAXONOMY.slice(0, 1)} />
        </TreeView>
      </Frame>
    );
  },
};

/**
 * Choosing a destination: what cannot be chosen stays as context, with the
 * reason read after its name.
 */
export const DisabledItems: Story = {
  render: () => (
    <Frame>
      <TreeView aria-label="Move «Feedback» to" defaultExpanded={['people', 'feedback']}>
        <TreeViewItem value="people">
          <TreeViewItemLabel>People</TreeViewItemLabel>
          <TreeViewGroup>
            <TreeViewItem value="feedback" disabled>
              <TreeViewItemLabel>Feedback</TreeViewItemLabel>
              <TreeViewItemDescription>It is the element being moved</TreeViewItemDescription>
              <TreeViewGroup>
                <TreeViewItem value="listening" disabled>
                  <TreeViewItemLabel>Active listening</TreeViewItemLabel>
                  <TreeViewItemDescription>
                    It is inside the element being moved
                  </TreeViewItemDescription>
                </TreeViewItem>
              </TreeViewGroup>
            </TreeViewItem>
            <TreeViewItem value="facilitation">
              <TreeViewItemLabel>Facilitation</TreeViewItemLabel>
            </TreeViewItem>
          </TreeViewGroup>
        </TreeViewItem>
        <TreeViewItem value="delivery">
          <TreeViewItemLabel>Delivery</TreeViewItemLabel>
        </TreeViewItem>
      </TreeView>
    </Frame>
  ),
};

/** A chosen item, with its bar and tint. */
export const Chosen: Story = {
  render: () => (
    <Frame>
      <TreeView aria-label="Competency taxonomy" defaultExpanded={['1']} defaultValue="1.2">
        <Items nodes={TAXONOMY.slice(0, 1)} />
      </TreeView>
    </Frame>
  ),
};

/** Right to left: → and ← swap, the chevron and the bar mirror. */
export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl">
      <Frame>
        <TreeView aria-label="Competency taxonomy" defaultExpanded={['1']} defaultValue="1.1">
          <Items nodes={TAXONOMY.slice(0, 1)} />
        </TreeView>
      </Frame>
    </div>
  ),
};
