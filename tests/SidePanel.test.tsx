import { afterEach, describe, it, expect, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, useState } from 'react';
import {
  SidePanel,
  SidePanelTrigger,
  SidePanelContent,
  SidePanelHeader,
  SidePanelTitle,
  SidePanelDescription,
  SidePanelFooter,
  SidePanelClose,
} from '../src/components/SidePanel';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../src/components/Select';
import { Sheet, SheetContent, SheetTitle } from '../src/components/Sheet';
import { Dialog, DialogContent, DialogTitle } from '../src/components/Dialog';
import { AlertDialog, AlertDialogContent, AlertDialogTitle } from '../src/components/AlertDialog';
import sheetStyles from '../src/components/Sheet.module.css';
import dialogStyles from '../src/components/Dialog.module.css';

/**
 * jsdom has no `matchMedia`, so the viewport is a double: the smallest one
 * that answers the panel's media query and tells its listeners when the
 * width crosses the breakpoint. Without it the panel takes the inline form.
 */
function viewport(wide: boolean) {
  let matches = wide;
  const listeners = new Set<() => void>();
  vi.stubGlobal(
    'matchMedia',
    vi.fn(function matchMedia(media: string) {
      return {
        media,
        get matches() {
          return matches;
        },
        addEventListener(_type: string, listener: () => void) {
          listeners.add(listener);
        },
        removeEventListener(_type: string, listener: () => void) {
          listeners.delete(listener);
        },
      };
    }),
  );
  return {
    resize(nextWide: boolean) {
      matches = nextWide;
      act(function notify() {
        for (const listener of listeners) listener();
      });
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

function Panel(props: {
  defaultOpen?: boolean;
  withDescription?: boolean;
  side?: 'left' | 'right';
}) {
  return (
    <div>
      <main>
        <p>Report</p>
        <button type="button">Report action</button>
      </main>
      <SidePanel defaultOpen={props.defaultOpen}>
        <SidePanelTrigger>Add action</SidePanelTrigger>
        <SidePanelContent side={props.side}>
          <SidePanelHeader>
            <SidePanelTitle>New action</SidePanelTitle>
            {props.withDescription !== false && (
              <SidePanelDescription>Plan the next step.</SidePanelDescription>
            )}
          </SidePanelHeader>
          <label htmlFor="action-name">Name</label>
          <input id="action-name" />
          <SidePanelFooter>
            <SidePanelClose>Cancel</SidePanelClose>
          </SidePanelFooter>
        </SidePanelContent>
      </SidePanel>
    </div>
  );
}

// `hidden`: while the modal form is open, the page behind it — the trigger
// included — is hidden from assistive technology.
const trigger = () => screen.getByRole('button', { name: 'Add action', hidden: true });

/** Closing runs the collapse transition first, then unmounts the panel. */
function panelGone() {
  return waitFor(() => expect(screen.queryByRole('complementary')).not.toBeInTheDocument());
}

describe('SidePanel — inline (wide viewport)', () => {
  it('starts closed, with the trigger saying so', () => {
    viewport(true);
    render(<Panel />);
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(trigger()).not.toHaveAttribute('aria-controls');
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
  });

  it('opens as a complementary landmark named by its title and moves focus into it', async () => {
    viewport(true);
    const user = userEvent.setup();
    render(<Panel />);

    await user.click(trigger());

    const panel = screen.getByRole('complementary', { name: 'New action' });
    expect(panel).toHaveAccessibleDescription('Plan the next step.');
    expect(panel).toHaveAttribute('data-pharos-mode', 'inline');
    expect(panel).toHaveAttribute('data-pharos-side', 'right');
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    expect(trigger()).toHaveAttribute('aria-controls', panel.id);
    expect(screen.getByLabelText('Name')).toHaveFocus();
    // Not modal: nothing else is hidden or turned into a dialog.
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('mirrors side="left"', async () => {
    viewport(true);
    const user = userEvent.setup();
    render(<Panel side="left" />);
    await user.click(trigger());
    expect(screen.getByRole('complementary')).toHaveAttribute('data-pharos-side', 'left');
  });

  it('closes on Escape from inside and returns focus to the trigger', async () => {
    viewport(true);
    const user = userEvent.setup();
    render(<Panel />);
    await user.click(trigger());

    await user.keyboard('{Escape}');

    await panelGone();
    expect(trigger()).toHaveFocus();
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes from SidePanelClose and returns focus to the trigger', async () => {
    viewport(true);
    const user = userEvent.setup();
    render(<Panel />);
    await user.click(trigger());

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await panelGone();
    expect(trigger()).toHaveFocus();
  });

  it('closes when the trigger is pressed again', async () => {
    viewport(true);
    const user = userEvent.setup();
    render(<Panel />);
    await user.click(trigger());
    await user.click(trigger());
    await panelGone();
  });

  it('stays open when the content beside it is used or focus tabs out', async () => {
    viewport(true);
    const user = userEvent.setup();
    render(<Panel />);
    await user.click(trigger());

    await user.click(screen.getByRole('button', { name: 'Report action' }));
    expect(screen.getByRole('complementary')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Name'));
    await user.tab(); // Cancel
    await user.tab(); // out of the panel
    expect(screen.getByRole('complementary')).toBeInTheDocument();
    expect(screen.getByRole('complementary')).not.toContainElement(
      document.activeElement as HTMLElement,
    );
  });

  it('does not close on Escape pressed outside it', async () => {
    viewport(true);
    const user = userEvent.setup();
    render(<Panel />);
    await user.click(trigger());
    await user.click(screen.getByRole('button', { name: 'Report action' }));

    await user.keyboard('{Escape}');

    expect(screen.getByRole('complementary')).toBeInTheDocument();
  });

  it('opened by default, it does not take focus on the first render', () => {
    viewport(true);
    render(<Panel defaultOpen />);
    expect(screen.getByRole('complementary', { name: 'New action' })).toBeInTheDocument();
    expect(document.body).toHaveFocus();
  });

  it('without a description, it points at none', async () => {
    viewport(true);
    const user = userEvent.setup();
    render(<Panel withDescription={false} />);
    await user.click(trigger());
    expect(screen.getByRole('complementary')).not.toHaveAttribute('aria-describedby');
  });

  it('closes a Select opened inside it first, and itself on the next Escape', async () => {
    viewport(true);
    const user = userEvent.setup();
    render(
      <SidePanel>
        <SidePanelTrigger>Add action</SidePanelTrigger>
        <SidePanelContent>
          <SidePanelTitle>New action</SidePanelTitle>
          <Select defaultValue="high">
            <SelectTrigger aria-label="Priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </SidePanelContent>
      </SidePanel>,
    );
    await user.click(trigger());
    await user.click(screen.getByRole('combobox', { name: 'Priority' }));
    expect(await screen.findByRole('listbox')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(screen.getByRole('complementary', { name: 'New action' })).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await panelGone();
    expect(trigger()).toHaveFocus();
  });

  it('focuses initialFocus when given', async () => {
    viewport(true);
    function WithInitialFocus() {
      const notes = useRef<HTMLTextAreaElement>(null);
      return (
        <SidePanel>
          <SidePanelTrigger>Add action</SidePanelTrigger>
          <SidePanelContent initialFocus={notes}>
            <SidePanelTitle>New action</SidePanelTitle>
            <input aria-label="Name" />
            <textarea aria-label="Notes" ref={notes} />
          </SidePanelContent>
        </SidePanel>
      );
    }
    const user = userEvent.setup();
    render(<WithInitialFocus />);
    await user.click(trigger());
    expect(screen.getByLabelText('Notes')).toHaveFocus();
  });

  it('can be controlled, and reports every request to open or close', async () => {
    viewport(true);
    const onOpenChange = vi.fn();
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <SidePanel
          open={open}
          onOpenChange={function track(next) {
            onOpenChange(next);
            setOpen(next);
          }}
        >
          <SidePanelTrigger>Add action</SidePanelTrigger>
          <SidePanelContent>
            <SidePanelTitle>New action</SidePanelTitle>
            <SidePanelClose>Cancel</SidePanelClose>
          </SidePanelContent>
        </SidePanel>
      );
    }
    const user = userEvent.setup();
    render(<Controlled />);
    await user.click(trigger());
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
    await panelGone();
  });

  it('moves focus in and back however the owner opens and closes it', async () => {
    viewport(true);
    function OwnedElsewhere() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open from the page
          </button>
          <SidePanel open={open} onOpenChange={setOpen}>
            <SidePanelTrigger>Add action</SidePanelTrigger>
            <SidePanelContent>
              <SidePanelTitle>New action</SidePanelTitle>
              <input aria-label="Name" />
              <button type="button" onClick={() => setOpen(false)}>
                Save
              </button>
            </SidePanelContent>
          </SidePanel>
        </>
      );
    }
    const user = userEvent.setup();
    render(<OwnedElsewhere />);

    await user.click(screen.getByRole('button', { name: 'Open from the page' }));
    expect(screen.getByLabelText('Name')).toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'Save' }));
    await panelGone();
    // Back to what opened it, not to the SidePanel's own trigger.
    expect(screen.getByRole('button', { name: 'Open from the page' })).toHaveFocus();
  });

  it('returns focus to what opened it when there is no SidePanelTrigger at all', async () => {
    viewport(true);
    function WithoutTrigger() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Edit action
          </button>
          <SidePanel open={open} onOpenChange={setOpen}>
            <SidePanelContent>
              <SidePanelTitle>Edit action</SidePanelTitle>
              <SidePanelClose>Done</SidePanelClose>
            </SidePanelContent>
          </SidePanel>
        </>
      );
    }
    const user = userEvent.setup();
    render(<WithoutTrigger />);

    await user.click(screen.getByRole('button', { name: 'Edit action' }));
    expect(screen.getByRole('button', { name: 'Done' })).toHaveFocus();
    await user.keyboard('{Escape}');

    await panelGone();
    expect(screen.getByRole('button', { name: 'Edit action' })).toHaveFocus();
  });

  it('stays closed when controlled and the owner refuses to open it', async () => {
    viewport(true);
    const user = userEvent.setup();
    render(
      <SidePanel open={false} onOpenChange={() => {}}>
        <SidePanelTrigger>Add action</SidePanelTrigger>
        <SidePanelContent>
          <SidePanelTitle>New action</SidePanelTitle>
        </SidePanelContent>
      </SidePanel>,
    );
    await user.click(trigger());
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
  });

  it('refuses parts rendered outside a SidePanel', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<SidePanelTrigger>Orphan</SidePanelTrigger>)).toThrow(
      '<SidePanelTrigger> must be rendered inside <SidePanel>.',
    );
  });

  it('refuses a title or a description outside the panel surface they label', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(
        <SidePanel>
          <SidePanelTitle>Loose title</SidePanelTitle>
        </SidePanel>,
      ),
    ).toThrow('<SidePanelTitle> must be rendered inside <SidePanelContent>.');
    expect(() =>
      render(
        <SidePanel>
          <SidePanelDescription>Loose description</SidePanelDescription>
        </SidePanel>,
      ),
    ).toThrow('<SidePanelDescription> must be rendered inside <SidePanelContent>.');
  });
});

describe('SidePanel — modal (narrow viewport)', () => {
  it('opens as the modal Sheet named by its title, with focus inside', async () => {
    viewport(false);
    const user = userEvent.setup();
    render(<Panel />);

    await user.click(trigger());

    const dialog = await screen.findByRole('dialog', { name: 'New action' });
    expect(dialog).toHaveAccessibleDescription('Plan the next step.');
    expect(dialog).toHaveAttribute('data-pharos-mode', 'modal');
    expect(dialog).toHaveAttribute('data-pharos-side', 'right');
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    expect(trigger()).toHaveAttribute('aria-controls', dialog.id);
    expect(trigger()).toHaveAttribute('aria-haspopup', 'dialog');
    await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement));
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    viewport(false);
    const user = userEvent.setup();
    render(<Panel />);
    await user.click(trigger());
    const dialog = await screen.findByRole('dialog');
    await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement));

    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger()).toHaveFocus());
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('SidePanel — crossing the breakpoint while open', () => {
  it('stays open as the modal Sheet, with focus moved into it', async () => {
    const screenSize = viewport(true);
    const user = userEvent.setup();
    render(<Panel />);
    await user.click(trigger());
    expect(screen.getByLabelText('Name')).toHaveFocus();

    screenSize.resize(false);

    const dialog = await screen.findByRole('dialog', { name: 'New action' });
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement));
  });

  it('stays open inline, with focus moved into it', async () => {
    const screenSize = viewport(false);
    const user = userEvent.setup();
    render(<Panel />);
    await user.click(trigger());
    const dialog = await screen.findByRole('dialog');
    await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement));

    screenSize.resize(true);

    const panel = screen.getByRole('complementary', { name: 'New action' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(panel).toContainElement(document.activeElement as HTMLElement));
  });
});

/**
 * A page that wraps its report in a SidePanel and opens an overlay from the
 * report: the overlay is a modal of its own, not one nested in the panel.
 */
const overlays = [
  {
    name: 'Sheet',
    backdropClass: sheetStyles.backdrop,
    render: function OpenSheet() {
      return (
        <Sheet open>
          <SheetContent>
            <SheetTitle>Filters</SheetTitle>
            <button type="button">Apply</button>
          </SheetContent>
        </Sheet>
      );
    },
  },
  {
    name: 'Dialog',
    backdropClass: dialogStyles.backdrop,
    render: function OpenDialog() {
      return (
        <Dialog open>
          <DialogContent>
            <DialogTitle>Filters</DialogTitle>
            <button type="button">Apply</button>
          </DialogContent>
        </Dialog>
      );
    },
  },
  {
    name: 'AlertDialog',
    backdropClass: dialogStyles.backdrop,
    render: function OpenAlertDialog() {
      return (
        <AlertDialog open>
          <AlertDialogContent>
            <AlertDialogTitle>Filters</AlertDialogTitle>
            <button type="button">Apply</button>
          </AlertDialogContent>
        </AlertDialog>
      );
    },
  },
] as const;

const layouts = [
  { viewportName: 'wide', wide: true, panelOpen: false },
  { viewportName: 'wide', wide: true, panelOpen: true },
  { viewportName: 'narrow', wide: false, panelOpen: false },
  { viewportName: 'narrow', wide: false, panelOpen: true },
] as const;

describe('SidePanel — an overlay opened from the content beside it', () => {
  for (const overlay of overlays) {
    for (const layout of layouts) {
      it(`a ${overlay.name} dims the page (${layout.viewportName}, panel ${
        layout.panelOpen ? 'open' : 'closed'
      })`, () => {
        viewport(layout.wide);
        const Overlay = overlay.render;
        render(
          <div>
            <SidePanel defaultOpen={layout.panelOpen}>
              <main>
                <Overlay />
              </main>
              <SidePanelContent>
                <SidePanelTitle>New action</SidePanelTitle>
              </SidePanelContent>
            </SidePanel>
          </div>,
        );

        const title = screen.getByText('Filters');
        const popup = title.closest('[role="dialog"], [role="alertdialog"]') as HTMLElement;
        expect(popup).not.toHaveAttribute('data-nested');
        // The overlay's own backdrop, in its own portal beside its popup.
        const portal = popup.parentElement as HTMLElement;
        expect(portal.querySelector(`.${overlay.backdropClass}`)).not.toBeNull();
      });
    }
  }
});
