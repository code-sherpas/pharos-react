import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Select, SelectTrigger, SelectContent, SelectItem } from '../src/components/Select';
import { IconButton } from '../src/components/IconButton';
import { LanguagesIcon } from '../src/icons/LanguagesIcon';

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
];

/** A language picker opened from an icon-only button, as Alexandria's collapsed sidebar does. */
function IconLanguagePicker() {
  const [language, setLanguage] = useState('en');
  const label = LANGUAGES.find((option) => option.value === language)?.label ?? '';
  return (
    <Select
      value={language}
      onValueChange={function pick(next) {
        setLanguage(next ?? 'en');
      }}
      items={LANGUAGES}
    >
      <SelectTrigger render={<IconButton size="sm" aria-label={`Language: ${label}`} />}>
        <LanguagesIcon />
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

describe('SelectTrigger with render', () => {
  it('is the rendered control: an IconButton named by its aria-label, with the select semantics', () => {
    render(<IconLanguagePicker />);
    const trigger = screen.getByRole('combobox', { name: 'Language: English' });
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).toHaveAttribute('data-pharos-intent', 'ghost');
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
  });

  it('carries none of the field trigger: no chevron, and the IconButton size governs', () => {
    render(<IconLanguagePicker />);
    const trigger = screen.getByRole('combobox', { name: 'Language: English' });
    expect(trigger.querySelectorAll('svg')).toHaveLength(1);
    expect(trigger.querySelector('[data-pharos-icon="languages"]')).not.toBeNull();
    expect(trigger).toHaveAttribute('data-pharos-size', 'sm');
  });

  it('opens the listbox and picks a value', async () => {
    const user = userEvent.setup();
    render(<IconLanguagePicker />);
    await user.click(screen.getByRole('combobox', { name: 'Language: English' }));
    const listbox = await screen.findByRole('listbox');
    await user.click(within(listbox).getByRole('option', { name: 'Español' }));
    expect(await screen.findByRole('combobox', { name: 'Language: Español' })).toBeInTheDocument();
  });

  it('keeps the field trigger, with its chevron, when no render is given', () => {
    render(
      <Select>
        <SelectTrigger aria-label="Visibility" />
      </Select>,
    );
    const trigger = screen.getByRole('combobox', { name: 'Visibility' });
    expect(trigger).toHaveAttribute('data-pharos-slot', 'select-trigger');
    expect(trigger.querySelectorAll('svg')).toHaveLength(1);
  });
});
