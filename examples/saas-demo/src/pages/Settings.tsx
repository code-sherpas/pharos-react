import { useState, type FormEvent } from 'react';
import {
  Button,
  Combobox,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxClear,
  ComboboxContent,
  ComboboxControl,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Textarea,
} from '@code-sherpas/pharos-react';
import { SKILLS, TIMEZONES } from '../data';

const VISIBILITY = { private: 'Private', organization: 'Organization', public: 'Public' };

/**
 * The form-heavy page: Input, Textarea, Select (single listbox), Combobox
 * (single filter) and Combobox (multi with removable chips), plus validation
 * and a save confirmation. Exercises every form atom composed on one page.
 */
export function SettingsPage() {
  const [name, setName] = useState('Ada Lovelace');
  const [bio, setBio] = useState('');
  const [visibility, setVisibility] = useState('organization');
  const [skills, setSkills] = useState<string[]>(['React']);
  const [nameError, setNameError] = useState(false);
  const [saved, setSaved] = useState(false);

  function touch() {
    setSaved(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setNameError(true);
      setSaved(false);
      return;
    }
    setNameError(false);
    setSaved(true);
  }

  return (
    <section>
      <h1>Settings</h1>
      <form onSubmit={handleSubmit} noValidate className="settings-form">
        <div className="field">
          <label htmlFor="name">Display name</label>
          <Input
            id="name"
            value={name}
            aria-invalid={nameError || undefined}
            onChange={(e) => {
              setName(e.target.value);
              touch();
            }}
          />
          {nameError && (
            <p className="error-text" role="alert">
              Display name is required.
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="bio">Bio</label>
          <Textarea
            id="bio"
            value={bio}
            placeholder="Tell your team about yourself…"
            onChange={(e) => {
              setBio(e.target.value);
              touch();
            }}
          />
        </div>

        <div className="field">
          <label id="visibility-label">Profile visibility</label>
          <Select
            items={VISIBILITY}
            value={visibility}
            onValueChange={(v) => {
              // A single Select yields `string | null` (null when cleared).
              setVisibility(v ?? '');
              touch();
            }}
          >
            <SelectTrigger aria-labelledby="visibility-label">
              <SelectValue placeholder="Select visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="organization">Organization</SelectItem>
              <SelectItem value="public">Public</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="field">
          <label id="timezone-label">Timezone</label>
          <Combobox items={TIMEZONES}>
            <ComboboxControl>
              <ComboboxInput placeholder="Search timezone…" aria-labelledby="timezone-label" />
              <ComboboxClear />
              <ComboboxTrigger aria-label="Open timezones" />
            </ComboboxControl>
            <ComboboxContent>
              <ComboboxEmpty>No timezone found</ComboboxEmpty>
              <ComboboxList>
                {(item: string) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>

        <div className="field">
          <label id="skills-label">Skills</label>
          <Combobox
            multiple
            items={SKILLS}
            value={skills}
            onValueChange={(v) => {
              setSkills(v);
              touch();
            }}
          >
            <ComboboxChips>
              {skills.map((s) => (
                <ComboboxChip key={s}>
                  {s}
                  <ComboboxChipRemove />
                </ComboboxChip>
              ))}
              <ComboboxInput inset placeholder="Add skill…" aria-labelledby="skills-label" />
            </ComboboxChips>
            <ComboboxContent>
              <ComboboxEmpty>No skill found</ComboboxEmpty>
              <ComboboxList>
                {(item: string) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>

        <Separator />
        <div className="settings-actions">
          <Button type="submit">Save changes</Button>
          {saved && (
            <span role="status" className="notice">
              Settings saved.
            </span>
          )}
        </div>
      </form>
    </section>
  );
}
