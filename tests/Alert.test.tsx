import { describe, it, expect } from 'vitest';
import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { act } from 'react';
import userEvent from '@testing-library/user-event';
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
  type AlertVariant,
} from '../src/components/Alert';
import { Button } from '../src/components/Button';

function Warning() {
  return (
    <Alert variant="warning">
      <AlertTitle render={<h3 />}>Used in 7 assessments</AlertTitle>
      <AlertDescription>Saving changes what they mean.</AlertDescription>
    </Alert>
  );
}

describe('Alert', () => {
  it.each<[AlertVariant, 'alert' | 'status']>([
    ['warning', 'alert'],
    ['destructive', 'alert'],
    ['default', 'status'],
    ['info', 'status'],
    ['success', 'status'],
  ])('a %s alert is a live region with role %s', async (variant, role) => {
    render(
      <Alert variant={variant}>
        <AlertTitle>Title of {variant}</AlertTitle>
      </Alert>,
    );

    const alert = screen.getByRole(role);
    expect(alert).toHaveAttribute('data-pharos-variant', variant);
    expect(await screen.findByText(`Title of ${variant}`)).toBeInTheDocument();
    expect(alert).toContainElement(screen.getByText(`Title of ${variant}`));
  });

  it('is a status about nothing in particular when no variant is given', () => {
    render(<Alert>Plain note</Alert>);

    expect(screen.getByRole('status')).toHaveAttribute('data-pharos-variant', 'default');
  });

  it.each<[AlertVariant, string]>([
    ['info', 'info'],
    ['success', 'circle-check'],
    ['warning', 'triangle-alert'],
    ['destructive', 'circle-alert'],
  ])(
    'marks a %s alert with its own decorative icon (%s), so the tone is not colour alone',
    (variant, icon) => {
      const { container } = render(<Alert variant={variant}>Text</Alert>);

      const glyph = container.querySelector('[data-pharos-slot="alert-icon"]');
      expect(glyph).toHaveAttribute('data-pharos-icon', icon);
      expect(glyph).toHaveAttribute('aria-hidden', 'true');
    },
  );

  it('carries no icon in the default variant', () => {
    render(<Alert>Plain note</Alert>);

    expect(screen.getByRole('status').querySelector('svg')).toBeNull();
  });

  it('renders the title as the heading the consumer asks for, with only their text', async () => {
    render(<Warning />);

    const heading = await screen.findByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent(/^Used in 7 assessments$/);
    expect(heading).toHaveAttribute('data-pharos-slot', 'alert-title');
  });

  it('renders the title as a plain div when no heading is asked for', async () => {
    render(
      <Alert variant="info">
        <AlertTitle>A note</AlertTitle>
      </Alert>,
    );

    const title = await screen.findByText('A note');
    expect(title.tagName).toBe('DIV');
    expect(screen.queryByRole('heading')).toBeNull();
  });

  it('puts the action after the description, inside the alert, in reading and focus order', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Alert variant="destructive">
          <AlertTitle>Couldn’t load the suggestions</AlertTitle>
          <AlertDescription>Check your connection and try again.</AlertDescription>
          <AlertAction className="consumer-class">
            <Button intent="secondary">Retry</Button>
          </AlertAction>
        </Alert>
        <button type="button">After the alert</button>
      </>,
    );

    const retry = await screen.findByRole('button', { name: 'Retry' });
    await waitFor(() => expect(retry).toBeVisible());
    const description = screen.getByText('Check your connection and try again.');
    const action = retry.closest('[data-pharos-slot="alert-action"]');
    expect(action).toHaveClass('consumer-class');
    expect(screen.getByRole('alert')).toContainElement(retry);
    expect(
      description.compareDocumentPosition(retry) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    await user.tab();
    expect(retry).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'After the alert' })).toHaveFocus();
  });

  it('still keeps a bare action after the description, as before AlertAction', async () => {
    render(
      <Alert variant="destructive">
        <AlertTitle>Couldn’t load the suggestions</AlertTitle>
        <AlertDescription>Check your connection and try again.</AlertDescription>
        <Button intent="secondary">Retry</Button>
      </Alert>,
    );

    expect(screen.getByRole('alert')).toContainElement(
      await screen.findByRole('button', { name: 'Retry' }),
    );
  });

  // A retry that fails again changes the text of the alert already on screen:
  // the change is announced in the same region, and the focused Retry stays.
  it('tells a retry that failed again in the same region, keeping the focus on Retry', async () => {
    const user = userEvent.setup();
    function Section() {
      const [attempts, setAttempts] = useState(1);
      return (
        <Alert variant="destructive">
          <AlertTitle>Billing couldn’t be loaded</AlertTitle>
          <AlertDescription>
            {attempts === 1 ? 'The rest of the page is up to date.' : 'Still failing.'}
          </AlertDescription>
          <AlertAction>
            <Button
              intent="secondary"
              onClick={function failAgain() {
                setAttempts(attempts + 1);
              }}
            >
              Retry
            </Button>
          </AlertAction>
        </Alert>
      );
    }
    render(<Section />);
    const region = screen.getByRole('alert');
    const retry = await screen.findByRole('button', { name: 'Retry' });
    await waitFor(() => expect(retry).toBeVisible());

    await user.click(retry);

    expect(screen.getByRole('alert')).toBe(region);
    expect(region).toHaveTextContent('Still failing.');
    expect(screen.getByText('Still failing.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Retry' })).toBe(retry);
    expect(retry).toHaveFocus();
  });

  it('puts no text of its own in the alert', async () => {
    render(
      <Alert variant="warning">
        <AlertTitle>Only this</AlertTitle>
      </Alert>,
    );

    await screen.findByText('Only this');
    expect(screen.getByRole('alert')).toHaveTextContent(/^Only this$/);
  });

  // A live region inserted together with its text is announced unreliably:
  // the content is there from the first render, taking its place, but hidden
  // from everyone for two frames, and then shown inside the existing region.
  it('mounted after the page loaded, shows its text inside the region after it', async () => {
    const user = userEvent.setup();
    function Page() {
      const [shown, setShown] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setShown(true)}>
            Edit
          </button>
          {shown && <Warning />}
        </>
      );
    }
    render(<Page />);

    await user.click(screen.getByRole('button', { name: 'Edit' }));

    const region = screen.getByRole('alert');
    const title = screen.getByText('Used in 7 assessments');
    expect(region).toContainElement(title);
    expect(title).not.toBeVisible();
    await waitFor(() => expect(title).toBeVisible());
    expect(screen.getByRole('alert')).toBe(region);
  });

  it('keeps the same region when its text changes, so the change is announced in it', async () => {
    function Saving({ outcome }: { outcome: string }) {
      return (
        <Alert variant="info">
          <AlertTitle>{outcome}</AlertTitle>
        </Alert>
      );
    }
    const { rerender } = render(<Saving outcome="Saving…" />);
    const region = screen.getByRole('status');
    await waitFor(() => expect(screen.getByText('Saving…')).toBeVisible());

    rerender(<Saving outcome="Saved" />);

    expect(screen.getByRole('status')).toBe(region);
    expect(screen.getByText('Saved')).toBeVisible();
  });

  it('becomes a new alert when its variant turns urgent, announced as if it had just appeared', async () => {
    function Notice({ variant }: { variant: AlertVariant }) {
      return (
        <Alert variant={variant}>
          <AlertTitle>The import is taking longer than usual</AlertTitle>
        </Alert>
      );
    }
    const { rerender } = render(<Notice variant="info" />);
    const status = screen.getByRole('status');
    await waitFor(() => expect(screen.getByText(/taking longer/)).toBeVisible());

    rerender(<Notice variant="warning" />);

    const alert = screen.getByRole('alert');
    expect(alert).not.toBe(status);
    expect(status).not.toBeInTheDocument();
    expect(alert).toHaveAttribute('data-pharos-variant', 'warning');
    expect(screen.getByText(/taking longer/)).not.toBeVisible();
    await waitFor(() => expect(screen.getByText(/taking longer/)).toBeVisible());
  });

  // Part of the page as the server sent it: whole from the first paint, so it
  // is found by reading the page, and hydrating it changes nothing.
  it('rendered on the server, is whole in the HTML and hydrates without a change', async () => {
    const html = renderToString(<Warning />);
    expect(html).toContain('role="alert"');
    expect(html).toContain('Used in 7 assessments');

    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    const errors: unknown[] = [];
    await act(async () => {
      hydrateRoot(container, <Warning />, {
        onRecoverableError: function keep(error) {
          errors.push(error);
        },
      });
    });

    expect(errors).toEqual([]);
    expect(container.querySelector('[data-pharos-slot="alert-content"]')).not.toHaveAttribute(
      'style',
    );
    expect(container).toHaveTextContent('Used in 7 assessmentsSaving changes what they mean.');
    container.remove();
  });
});
