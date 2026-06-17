import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from '../src/components/Select';

/**
 * A minimal single-select reused across tests: a trigger showing the chosen
 * value (or a placeholder) and three options. Asserts the **listbox**
 * contract — `role="listbox"` / `option`, NOT the menu-button contract of
 * DropdownMenu.
 */
function renderSelect(props: { onValueChange?: (v: string | null) => void } = {}) {
  return render(
    <Select onValueChange={props.onValueChange}>
      <SelectTrigger aria-label="Visibility">
        <SelectValue placeholder="Select visibility" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="private">Private</SelectItem>
        <SelectItem value="organization">Organization</SelectItem>
        <SelectItem value="public">Public</SelectItem>
      </SelectContent>
    </Select>,
  );
}

describe('Select', () => {
  it('renders the trigger as a button and keeps the listbox closed initially', () => {
    renderSelect();
    expect(screen.getByRole('combobox', { name: 'Visibility' })).toBeInTheDocument();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('shows the placeholder until a value is selected', () => {
    renderSelect();
    expect(screen.getByText('Select visibility')).toBeInTheDocument();
  });

  it('opens on trigger click and exposes listbox/option roles — not a menu', async () => {
    const user = userEvent.setup();
    renderSelect();

    await user.click(screen.getByRole('combobox', { name: 'Visibility' }));

    expect(await screen.findByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Private' })).toBeInTheDocument();
    // The listbox contract — deliberately NOT a menu.
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
  });

  it('fires onValueChange and closes after picking an option (single-select)', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderSelect({ onValueChange });

    await user.click(screen.getByRole('combobox', { name: 'Visibility' }));
    await user.click(await screen.findByRole('option', { name: 'Organization' }));

    expect(onValueChange).toHaveBeenCalledWith('organization', expect.anything());
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  });

  it('reflects the selected option label in the trigger (with items)', async () => {
    const user = userEvent.setup();
    // Assert on the trigger's OWN text (the popup is portaled outside it, and
    // a document-wide `getByText` would match the still-mounted hidden option
    // rather than the trigger — a false positive). The label only resolves
    // because `items` is provided: Base UI maps value→label there, not from
    // the SelectItem children, for interactive selection too.
    render(
      <Select items={{ private: 'Private', organization: 'Organization', public: 'Public' }}>
        <SelectTrigger aria-label="Visibility">
          <SelectValue placeholder="Select visibility" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="private">Private</SelectItem>
          <SelectItem value="organization">Organization</SelectItem>
          <SelectItem value="public">Public</SelectItem>
        </SelectContent>
      </Select>,
    );
    const trigger = screen.getByRole('combobox', { name: 'Visibility' });
    await user.click(trigger);
    await user.click(await screen.findByRole('option', { name: 'Public' }));

    await waitFor(() => expect(trigger).toHaveTextContent('Public'));
    expect(trigger).not.toHaveTextContent('Select visibility');
  });

  it('shows the option label (not the raw value) for a preset value via items', () => {
    // Base UI resolves the trigger label from the root `items` map; a
    // preset/controlled value has no captured label without it. With `items`
    // the trigger shows "Organization", not the raw enum "organization".
    render(
      <Select
        defaultValue="organization"
        items={{ private: 'Private', organization: 'Organization', public: 'Public' }}
      >
        <SelectTrigger aria-label="Visibility">
          <SelectValue placeholder="Select visibility" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="private">Private</SelectItem>
          <SelectItem value="organization">Organization</SelectItem>
          <SelectItem value="public">Public</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(screen.getByRole('combobox', { name: 'Visibility' })).toHaveTextContent('Organization');
  });

  it('marks the trigger expanded state via aria-expanded', async () => {
    const user = userEvent.setup();
    renderSelect();
    const trigger = screen.getByRole('combobox', { name: 'Visibility' });

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    renderSelect();
    const trigger = screen.getByRole('combobox', { name: 'Visibility' });

    await user.click(trigger);
    expect(await screen.findByRole('listbox')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('keeps the listbox open and accumulates values when multiple', async () => {
    const user = userEvent.setup();
    function MultiSelect() {
      const [value, setValue] = useState<string[]>([]);
      return (
        <div>
          <span data-testid="count">{value.length}</span>
          <Select multiple value={value} onValueChange={setValue}>
            <SelectTrigger aria-label="Roles">
              <SelectValue placeholder="Pick roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }
    render(<MultiSelect />);

    await user.click(screen.getByRole('combobox', { name: 'Roles' }));
    await user.click(await screen.findByRole('option', { name: 'Admin' }));
    await user.click(await screen.findByRole('option', { name: 'Editor' }));

    // Multi-select keeps the popup open so selections accumulate.
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByTestId('count')).toHaveTextContent('2');
  });

  it('does not fire the handler for a disabled option', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Select onValueChange={onValueChange}>
        <SelectTrigger aria-label="Plan">
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="free" disabled>
            Free
          </SelectItem>
          <SelectItem value="pro">Pro</SelectItem>
        </SelectContent>
      </Select>,
    );

    await user.click(screen.getByRole('combobox', { name: 'Plan' }));
    await user.click(await screen.findByRole('option', { name: 'Free' }));

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('renders a group with an accessible label', async () => {
    const user = userEvent.setup();
    render(
      <Select>
        <SelectTrigger aria-label="Fruit">
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Citrus</SelectLabel>
            <SelectItem value="orange">Orange</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>,
    );

    await user.click(screen.getByRole('combobox', { name: 'Fruit' }));
    expect(await screen.findByRole('group', { name: 'Citrus' })).toBeInTheDocument();
  });

  it('tags the content surface and trigger via data-pharos-slot', async () => {
    const user = userEvent.setup();
    renderSelect();

    const trigger = screen.getByRole('combobox', { name: 'Visibility' });
    expect(trigger).toHaveAttribute('data-pharos-slot', 'select-trigger');

    await user.click(trigger);
    // role="listbox" sits on Base UI's inner List; the Popup surface that
    // carries the Pharos chrome is tagged on its own element.
    await screen.findByRole('listbox');
    expect(document.querySelector('[data-pharos-slot="select-content"]')).toBeInTheDocument();
  });

  it('conveys error state through aria-invalid on the trigger', () => {
    render(
      <Select>
        <SelectTrigger aria-label="Visibility" aria-invalid>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(screen.getByRole('combobox', { name: 'Visibility' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('renders a group separator as decorative (aria-hidden, not a listbox child)', async () => {
    const user = userEvent.setup();
    render(
      <Select>
        <SelectTrigger aria-label="Fruit">
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Citrus</SelectLabel>
            <SelectItem value="orange">Orange</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Berries</SelectLabel>
            <SelectItem value="strawberry">Strawberry</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>,
    );

    await user.click(screen.getByRole('combobox', { name: 'Fruit' }));
    const listbox = await screen.findByRole('listbox');

    // A `separator` is not a permitted child of the `listbox` role (only
    // `option` / `group`), so the divider must stay out of the a11y tree —
    // otherwise axe's aria-required-children fails (critical). The grouping
    // semantics live on SelectGroup/SelectLabel, not on the divider.
    const separator = document.querySelector('[data-pharos-slot="select-separator"]');
    expect(separator).not.toBeNull();
    expect(separator).toHaveAttribute('aria-hidden', 'true');
    expect(separator).toHaveAttribute('role', 'none');
    expect(within(listbox).queryByRole('separator')).toBeNull();
  });
});
