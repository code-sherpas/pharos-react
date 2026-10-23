import { useState, type FormEvent } from 'react';
import {
  Button,
  Checkbox,
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
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Switch,
  Textarea,
  useToast,
} from '@code-sherpas/pharos-react';
import { DATA_REGIONS, SKILLS, TIMEZONES } from '../data';

const VISIBILITY = {
  private: 'Private',
  organization: 'Organization',
  public: 'Public',
  invited: 'Only the people I invite, one by one, to each of my projects',
};

/**
 * The form-heavy page: Input, Textarea, Select (single listbox), Combobox
 * (single filter) and Combobox (multi with removable chips), plus validation
 * and a save confirmation in a toast. Exercises every form atom composed on one
 * page. The validation error stays next to its field: a toast is for what can
 * be missed.
 */
export function SettingsPage() {
  const [name, setName] = useState('Ada Lovelace');
  const [bio, setBio] = useState('');
  const [visibility, setVisibility] = useState('organization');
  const [skills, setSkills] = useState<string[]>(['React']);
  const [notify, setNotify] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [theme, setTheme] = useState('system');
  const [nameError, setNameError] = useState(false);
  const toast = useToast();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);
    // One id: saving twice refreshes the toast instead of stacking a second.
    toast.add({ id: 'settings-saved', title: 'Settings saved.', variant: 'success' });
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
            }}
          >
            <SelectTrigger aria-labelledby="visibility-label">
              <SelectValue placeholder="Select visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="organization">Organization</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="invited">
                Only the people I invite, one by one, to each of my projects
              </SelectItem>
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
          <label id="region-label">Data region</label>
          <Combobox items={DATA_REGIONS} defaultValue="Europe (Frankfurt)" disabled>
            <ComboboxControl>
              <ComboboxInput aria-labelledby="region-label" aria-describedby="region-hint" />
              <ComboboxTrigger aria-label="Open data regions" />
            </ComboboxControl>
            <ComboboxContent>
              <ComboboxList>
                {(item: string) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          <p id="region-hint" className="hint-text">
            Set by your workspace admin.
          </p>
        </div>

        <div className="field">
          <label id="skills-label">Skills</label>
          <Combobox
            multiple
            items={SKILLS}
            value={skills}
            onValueChange={(v) => {
              setSkills(v);
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

        <div className="field">
          <label htmlFor="notify" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Checkbox
              id="notify"
              checked={notify}
              onCheckedChange={(checked) => {
                setNotify(checked === true);
              }}
            />
            Email me product updates
          </label>
        </div>

        <div className="field">
          <label htmlFor="digest" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Switch
              id="digest"
              checked={weeklyDigest}
              onCheckedChange={(checked) => {
                setWeeklyDigest(checked);
              }}
            />
            Send me a weekly digest
          </label>
        </div>

        <div className="field">
          <label id="theme-label">Theme</label>
          <RadioGroup
            aria-labelledby="theme-label"
            value={theme}
            onValueChange={(value) => {
              setTheme(value as string);
            }}
          >
            <label
              htmlFor="theme-light"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <RadioGroupItem id="theme-light" value="light" />
              Light
            </label>
            <label
              htmlFor="theme-dark"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <RadioGroupItem id="theme-dark" value="dark" />
              Dark
            </label>
            <label
              htmlFor="theme-system"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <RadioGroupItem id="theme-system" value="system" />
              Match system
            </label>
          </RadioGroup>
        </div>

        <Separator />
        <div className="settings-actions">
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    </section>
  );
}
