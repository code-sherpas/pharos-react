import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  TreeView,
  TreeViewGroup,
  TreeViewItem,
  TreeViewItemDescription,
  TreeViewItemLabel,
  type TreeViewProps,
} from '../src/components/TreeView';

type TaxonomyProps = Partial<Omit<TreeViewProps, 'aria-label' | 'aria-labelledby'>> & {
  feedbackDisabled?: boolean;
};

/** Two pillars; «People» holds two competencies, «Feedback» one skill. */
function Taxonomy({ feedbackDisabled = false, ...props }: TaxonomyProps) {
  return (
    <TreeView aria-label="Competency taxonomy" {...props}>
      <TreeViewItem value="people">
        <TreeViewItemLabel>People</TreeViewItemLabel>
        <TreeViewGroup>
          <TreeViewItem value="feedback" disabled={feedbackDisabled}>
            <TreeViewItemLabel>Feedback</TreeViewItemLabel>
            {feedbackDisabled && (
              <TreeViewItemDescription>It is the element being moved</TreeViewItemDescription>
            )}
            <TreeViewGroup>
              <TreeViewItem value="listening">
                <TreeViewItemLabel>Active listening</TreeViewItemLabel>
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
        <TreeViewGroup>
          <TreeViewItem value="planning">
            <TreeViewItemLabel>Planning</TreeViewItemLabel>
          </TreeViewItem>
        </TreeViewGroup>
      </TreeViewItem>
    </TreeView>
  );
}

const item = (name: string) => screen.getByRole('treeitem', { name });

describe('TreeView', () => {
  it('renders a named tree whose items carry their level and open state', () => {
    render(<Taxonomy defaultExpanded={['people']} />);

    expect(screen.getByRole('tree', { name: 'Competency taxonomy' })).toBeInTheDocument();
    expect(item('People')).toHaveAttribute('aria-level', '1');
    expect(item('People')).toHaveAttribute('aria-expanded', 'true');
    expect(item('Feedback')).toHaveAttribute('aria-level', '2');
    expect(item('Feedback')).toHaveAttribute('aria-expanded', 'false');
    expect(item('Facilitation')).not.toHaveAttribute('aria-expanded');
    expect(item('Delivery')).toHaveAttribute('aria-expanded', 'false');
  });

  it('names each item by its label alone, not by its children', () => {
    render(<Taxonomy defaultExpanded={['people', 'feedback']} />);
    expect(screen.getByRole('treeitem', { name: 'People' })).toBeInTheDocument();
    expect(screen.getByRole('treeitem', { name: 'Active listening' })).toBeInTheDocument();
  });

  it('does not mount the children of a closed branch', () => {
    render(<Taxonomy />);
    expect(screen.queryByRole('treeitem', { name: 'Feedback' })).toBeNull();
    expect(screen.queryByRole('group')).toBeNull();
  });

  it('gives Tab to the first item when nothing is chosen, and to no other', async () => {
    const user = userEvent.setup();
    render(<Taxonomy defaultExpanded={['people']} />);

    await user.tab();

    expect(item('People')).toHaveFocus();
    const tabbable = screen.getAllByRole('treeitem').filter((node) => node.tabIndex === 0);
    expect(tabbable).toEqual([item('People')]);
  });

  it('gives Tab to the chosen item when it is visible', async () => {
    const user = userEvent.setup();
    render(<Taxonomy defaultExpanded={['people']} defaultValue="facilitation" />);
    await user.tab();
    expect(item('Facilitation')).toHaveFocus();
  });

  it('gives Tab to the first item when the chosen one is inside a closed branch', async () => {
    const user = userEvent.setup();
    render(<Taxonomy defaultValue="planning" />);
    await user.tab();
    expect(item('People')).toHaveFocus();
  });

  it('moves with the arrows, Home and End through the visible items only', async () => {
    const user = userEvent.setup();
    render(<Taxonomy defaultExpanded={['people']} />);
    await user.tab();

    await user.keyboard('{ArrowDown}');
    expect(item('Feedback')).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(item('Facilitation')).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(item('Delivery')).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(item('Delivery')).toHaveFocus();
    await user.keyboard('{Home}');
    expect(item('People')).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(item('People')).toHaveFocus();
    await user.keyboard('{End}');
    expect(item('Delivery')).toHaveFocus();
  });

  it('opens a closed branch with →, then moves into it', async () => {
    const user = userEvent.setup();
    const onExpandedChange = vi.fn();
    render(<Taxonomy onExpandedChange={onExpandedChange} />);
    await user.tab();

    await user.keyboard('{ArrowRight}');
    expect(item('People')).toHaveAttribute('aria-expanded', 'true');
    expect(item('People')).toHaveFocus();
    expect(onExpandedChange).toHaveBeenLastCalledWith(['people']);

    await user.keyboard('{ArrowRight}');
    expect(item('Feedback')).toHaveFocus();
  });

  it('does nothing with → on a leaf', async () => {
    const user = userEvent.setup();
    const onExpandedChange = vi.fn();
    render(<Taxonomy defaultExpanded={['people']} onExpandedChange={onExpandedChange} />);
    item('Facilitation').focus();

    await user.keyboard('{ArrowRight}');

    expect(item('Facilitation')).toHaveFocus();
    expect(onExpandedChange).not.toHaveBeenCalled();
  });

  it('goes up to the parent with ← from a child, and closes an open branch with ←', async () => {
    const user = userEvent.setup();
    render(<Taxonomy defaultExpanded={['people']} />);
    item('Facilitation').focus();

    await user.keyboard('{ArrowLeft}');
    expect(item('People')).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(item('People')).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('treeitem', { name: 'Facilitation' })).toBeNull();
    await user.keyboard('{ArrowLeft}');
    expect(item('People')).toHaveFocus();
  });

  it('mirrors → and ← right to left', async () => {
    const user = userEvent.setup();
    render(
      <div dir="rtl" style={{ direction: 'rtl' }}>
        <Taxonomy />
      </div>,
    );
    await user.tab();

    await user.keyboard('{ArrowLeft}');
    expect(item('People')).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{ArrowRight}');
    expect(item('People')).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens every sibling branch with *', async () => {
    const user = userEvent.setup();
    render(<Taxonomy />);
    await user.tab();

    await user.keyboard('*');

    expect(item('People')).toHaveAttribute('aria-expanded', 'true');
    expect(item('Delivery')).toHaveAttribute('aria-expanded', 'true');
    expect(item('Feedback')).toHaveAttribute('aria-expanded', 'false');
  });

  it('moves to the next item whose name starts with what is typed, ignoring case and accents', async () => {
    const user = userEvent.setup();
    render(
      <TreeView aria-label="People">
        <TreeViewItem value="ana">
          <TreeViewItemLabel>Ana</TreeViewItemLabel>
        </TreeViewItem>
        <TreeViewItem value="eva">
          <TreeViewItemLabel>Évaluation</TreeViewItemLabel>
        </TreeViewItem>
        <TreeViewItem value="emma">
          <TreeViewItemLabel>Emma</TreeViewItemLabel>
        </TreeViewItem>
      </TreeView>,
    );
    await user.tab();

    await user.keyboard('e');
    expect(item('Évaluation')).toHaveFocus();
    await user.keyboard('m');
    expect(item('Emma')).toHaveFocus();
  });

  it('matches typing against textValue when the label starts with something else, keeping the label as the name', async () => {
    const user = userEvent.setup();
    render(
      <TreeView aria-label="Competency taxonomy">
        <TreeViewItem value="core" textValue="Core Skills">
          <TreeViewItemLabel>Pillar: Core Skills</TreeViewItemLabel>
        </TreeViewItem>
        <TreeViewItem value="planning" textValue="Planning">
          <TreeViewItemLabel>Category: Planning</TreeViewItemLabel>
        </TreeViewItem>
        <TreeViewItem value="collaboration" textValue="Collaboration">
          <TreeViewItemLabel>Category: Collaboration</TreeViewItemLabel>
        </TreeViewItem>
        <TreeViewItem value="people" textValue="People">
          <TreeViewItemLabel>Pillar: People</TreeViewItemLabel>
        </TreeViewItem>
      </TreeView>,
    );
    await user.tab();
    expect(item('Pillar: Core Skills')).toHaveFocus();

    // «c» goes to the next name that starts with C, skipping «Category: Planning».
    await user.keyboard('c');
    expect(item('Category: Collaboration')).toHaveFocus();
    // «p» from the first item goes to «Planning», not to the next «Pillar».
    await user.keyboard('{Home}');
    await new Promise((resolve) => setTimeout(resolve, 600));
    await user.keyboard('p');
    expect(item('Category: Planning')).toHaveFocus();
  });

  it('chooses with Enter, Space or a click, and reports every choice', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Taxonomy defaultExpanded={['people']} onValueChange={onValueChange} />);
    await user.tab();

    await user.keyboard('{Enter}');
    expect(item('People')).toHaveAttribute('aria-selected', 'true');
    expect(onValueChange).toHaveBeenLastCalledWith('people');

    await user.keyboard('{ArrowDown} ');
    expect(item('Feedback')).toHaveAttribute('aria-selected', 'true');
    expect(item('People')).toHaveAttribute('aria-selected', 'false');

    await user.click(screen.getByText('Facilitation'));
    expect(item('Facilitation')).toHaveAttribute('aria-selected', 'true');
    expect(item('Facilitation')).toHaveFocus();

    // Choosing the chosen item again is reported too: it may show its detail again.
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenCalledTimes(4);
    expect(onValueChange).toHaveBeenLastCalledWith('facilitation');
  });

  it('does not choose while walking: focus does not follow selection', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Taxonomy defaultExpanded={['people']} onValueChange={onValueChange} />);
    await user.tab();
    await user.keyboard('{ArrowDown}{ArrowDown}{End}');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.queryAllByRole('treeitem', { selected: true })).toHaveLength(0);
  });

  it('opens and closes a branch from its chevron without choosing it', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(<Taxonomy onValueChange={onValueChange} />);
    const chevron = container.querySelector(
      '[data-pharos-slot="tree-view-item-toggle"]',
    ) as HTMLElement;

    await user.click(chevron);
    expect(item('People')).toHaveAttribute('aria-expanded', 'true');
    await user.click(chevron);
    expect(item('People')).toHaveAttribute('aria-expanded', 'false');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('keeps a disabled item visible, focusable and openable, but never chosen', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Taxonomy feedbackDisabled defaultExpanded={['people']} onValueChange={onValueChange} />,
    );
    const feedback = item('Feedback');
    expect(feedback).toHaveAttribute('aria-disabled', 'true');
    expect(feedback).toHaveAccessibleDescription('It is the element being moved');

    feedback.focus();
    await user.keyboard('{Enter} ');
    await user.click(screen.getByText('Feedback'));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(feedback).toHaveAttribute('aria-selected', 'false');
    expect(feedback).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(feedback).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{ArrowRight}');
    expect(item('Active listening')).toHaveFocus();
  });

  it('follows the controlled props and leaves them to the consumer', async () => {
    const user = userEvent.setup();
    const onExpandedChange = vi.fn();
    const onValueChange = vi.fn();
    render(
      <Taxonomy
        expanded={[]}
        onExpandedChange={onExpandedChange}
        value="delivery"
        onValueChange={onValueChange}
      />,
    );
    await user.tab();
    expect(item('Delivery')).toHaveFocus();

    await user.keyboard('{ArrowRight}{Home}{Enter}');

    expect(onExpandedChange).toHaveBeenCalledWith(['delivery']);
    expect(item('Delivery')).toHaveAttribute('aria-expanded', 'false');
    expect(onValueChange).toHaveBeenCalledWith('people');
    expect(item('Delivery')).toHaveAttribute('aria-selected', 'true');
  });

  it('comes back to the chosen item with Tab after focus leaves', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Taxonomy defaultExpanded={['people']} defaultValue="feedback" />
        <button type="button">After</button>
      </>,
    );
    await user.tab();
    expect(item('Feedback')).toHaveFocus();
    await user.keyboard('{End}');
    await user.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    await user.tab({ shift: true });
    expect(item('Feedback')).toHaveFocus();
  });

  it('moves focus to the branch when it is closed from its chevron while a child has focus', async () => {
    const user = userEvent.setup();
    const { container } = render(<Taxonomy defaultExpanded={['people']} />);
    item('Facilitation').focus();
    const chevron = container.querySelector(
      '[data-pharos-slot="tree-view-item-toggle"]',
    ) as HTMLElement;

    await user.click(chevron);

    expect(item('People')).toHaveFocus();
  });

  it('lets the consumer give focus back to the chosen item after the tree remounts', async () => {
    const user = userEvent.setup();
    function NarrowScreen() {
      const [showingDetail, setShowingDetail] = useState(true);
      return showingDetail ? (
        <button type="button" onClick={() => setShowingDetail(false)}>
          Back
        </button>
      ) : (
        <TreeView aria-label="Taxonomy" defaultExpanded={['people']} defaultValue="facilitation">
          <TreeViewItem value="people">
            <TreeViewItemLabel>People</TreeViewItemLabel>
            <TreeViewGroup>
              <TreeViewItem
                value="facilitation"
                ref={function focusTheChosenItem(node) {
                  node?.focus();
                }}
              >
                <TreeViewItemLabel>Facilitation</TreeViewItemLabel>
              </TreeViewItem>
            </TreeViewGroup>
          </TreeViewItem>
        </TreeView>
      );
    }
    render(<NarrowScreen />);
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(item('Facilitation')).toHaveFocus();
    expect(item('Facilitation')).toHaveAttribute('tabindex', '0');
  });

  it('mirrors its state in data attributes and forwards className', () => {
    render(<Taxonomy defaultExpanded={['people']} defaultValue="people" className="mine" />);
    expect(screen.getByRole('tree')).toHaveAttribute('data-pharos-slot', 'tree-view');
    expect(screen.getByRole('tree')).toHaveClass('mine');
    expect(item('People')).toHaveAttribute('data-pharos-expanded', 'true');
    expect(item('People')).toHaveAttribute('data-pharos-selected', 'true');
    expect(item('People')).toHaveAttribute('data-pharos-level', '1');
    expect(item('Facilitation')).not.toHaveAttribute('data-pharos-expanded');
  });

  it('refuses a part used outside its parent', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TreeViewItem value="lonely" />)).toThrow(/inside <TreeView>/);
  });
});
