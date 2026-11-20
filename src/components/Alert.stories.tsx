import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Alert, AlertAction, AlertDescription, AlertTitle } from './Alert';
import { Button } from './Button';

/**
 * `Alert` says something the person has to read inside a page, a form or a
 * dialog, and stays as long as it is true. `warning` and `destructive` are
 * `role="alert"`; `default`, `info` and `success` are `role="status"`. Every
 * variant but `default` has an icon and a side bar of its tone; the text keeps
 * the normal colour. The consumer writes every word, and gives `AlertTitle`
 * the heading level its place needs with `render`. What the person can do
 * about it — "Retry" — goes in `AlertAction`, after the description.
 *
 * Use it for what must not be missed and belongs where it is shown. Feedback
 * that can be missed is a `Toast`; a decision that must interrupt is a
 * `Dialog`.
 */
const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['default', 'info', 'success', 'warning', 'destructive'],
    },
  },
  args: { variant: 'warning' },
  decorators: [
    function Narrow(Story) {
      return (
        <div style={{ maxInlineSize: '32rem' }}>
          <Story />
        </div>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Waits for the alerts' text to show, which a client mount keeps hidden for
 * two frames after the region, so axe scans the text and not hidden content.
 */
function waitForText(...texts: string[]): Story['play'] {
  return async function textIsIn({ canvasElement }) {
    const canvas = within(canvasElement);
    for (const text of texts) {
      const node = canvas.getByText(text);
      await waitFor(function shown() {
        return expect(node).toBeVisible();
      });
    }
  };
}

/** A warning before a decision, its title a heading of the page's level. */
export const Default: Story = {
  render: function DefaultStory(args) {
    return (
      <Alert {...args}>
        <AlertTitle render={<h2 />}>Used in 7 assessments</AlertTitle>
        <AlertDescription>
          Changing the description changes what those assessments mean. To describe a different
          behaviour, create a new one instead.
        </AlertDescription>
      </Alert>
    );
  },
  play: waitForText('Used in 7 assessments'),
};

/** Every variant. All but `default` carry an icon, so colour is never alone. */
export const Variants: Story = {
  render: function VariantsStory() {
    return (
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        <Alert>
          <AlertTitle>Drafts are visible only to you</AlertTitle>
        </Alert>
        <Alert variant="info">
          <AlertTitle>Assessors read this description</AlertTitle>
          <AlertDescription>It is shown next to the behaviour when they rate it.</AlertDescription>
        </Alert>
        <Alert variant="success">
          <AlertTitle>Every member has a group</AlertTitle>
        </Alert>
        <Alert variant="warning">
          <AlertTitle>Used in 7 assessments</AlertTitle>
          <AlertDescription>Saving changes what they mean.</AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <AlertTitle>Couldn’t load the suggestions</AlertTitle>
          <AlertDescription>The rest of the page is up to date.</AlertDescription>
        </Alert>
      </div>
    );
  },
  play: waitForText(
    'Drafts are visible only to you',
    'Assessors read this description',
    'Every member has a group',
    'Used in 7 assessments',
    'Couldn’t load the suggestions',
  ),
};

/**
 * `AlertAction` holds what the person can do about it, after the description
 * and under the text, in reading and focus order. Several actions sit in a row
 * that wraps.
 */
export const WithAction: Story = {
  render: function WithActionStory() {
    return (
      <Alert variant="destructive">
        <AlertTitle>Couldn’t load the suggestions</AlertTitle>
        <AlertDescription>Check your connection and try again.</AlertDescription>
        <AlertAction>
          <Button intent="secondary" size="sm">
            Retry
          </Button>
        </AlertAction>
      </Alert>
    );
  },
  play: waitForText('Retry'),
};

/**
 * A retry that fails again: the same alert stays and its text changes, so the
 * person sees it and a screen reader announces it in the region, while the
 * focus stays on Retry.
 */
export const RetryThatFailsAgain: Story = {
  render: function RetryThatFailsAgainStory() {
    const [attempts, setAttempts] = useState(1);
    return (
      <Alert variant="destructive">
        <AlertTitle render={<h2 />}>Billing couldn’t be loaded</AlertTitle>
        <AlertDescription>
          {attempts === 1
            ? 'The rest of the page is up to date.'
            : `Still couldn’t load it after ${attempts} attempts.`}
        </AlertDescription>
        <AlertAction>
          <Button
            intent="secondary"
            size="sm"
            onClick={function failAgain() {
              setAttempts(attempts + 1);
            }}
          >
            Retry
          </Button>
        </AlertAction>
      </Alert>
    );
  },
  play: async function retryAndFailAgain({ canvasElement }) {
    const canvas = within(canvasElement);
    // Out of the accessibility tree for the alert's first two frames.
    const retry = await canvas.findByRole('button', { name: 'Retry' });
    await userEvent.click(retry);
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      'Still couldn’t load it after 2 attempts.',
    );
    await expect(retry).toHaveFocus();
  },
};

/**
 * Mounted after the page loaded: the alert takes its place at once, and its
 * text shows two frames later inside the live region, so a screen reader
 * announces it.
 */
export const AppearsAfterAnAction: Story = {
  render: function AppearsAfterAnActionStory() {
    const [shown, setShown] = useState(false);
    return (
      <div style={{ display: 'grid', gap: '0.75rem', justifyItems: 'start' }}>
        <Button
          intent="secondary"
          onClick={function showTheWarning() {
            setShown(true);
          }}
        >
          Show the warning
        </Button>
        {shown && (
          <Alert variant="warning">
            <AlertTitle>Used in 7 assessments</AlertTitle>
            <AlertDescription>Saving changes what they mean.</AlertDescription>
          </Alert>
        )}
      </div>
    );
  },
  play: async function showAndAnnounce({ canvasElement }) {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Show the warning' }));
    const region = canvas.getByRole('alert');
    const title = canvas.getByText('Used in 7 assessments');
    await expect(region).toContainElement(title);
    await waitFor(function shown() {
      return expect(title).toBeVisible();
    });
    await expect(region).toHaveTextContent('Saving changes what they mean.');
  },
};
