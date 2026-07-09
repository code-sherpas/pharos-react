import { useState } from 'react';
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@code-sherpas/pharos-react';

const VISIBILITY = { private: 'Private', team: 'Team', public: 'Public' };

/**
 * A right-docked Sheet holding a small create form. Deliberately embeds a
 * Select: the harness's proof that a listbox opened from INSIDE a modal sheet
 * still stacks above the panel (the LanguageSelector-in-a-drawer case, and the
 * reason Sheet shares the popover z-index layer instead of a higher one).
 */
export function NewProjectSheet() {
  const [visibility, setVisibility] = useState('team');

  return (
    <Sheet>
      <SheetTrigger render={<Button size="sm">New project</Button>} />
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>New project</SheetTitle>
          <SheetDescription>Create a project for your team.</SheetDescription>
        </SheetHeader>

        <div className="field">
          <label htmlFor="project-name">Name</label>
          <Input id="project-name" placeholder="Acme website" />
        </div>

        <div className="field">
          <label id="project-visibility-label">Visibility</label>
          <Select
            items={VISIBILITY}
            value={visibility}
            onValueChange={(v) => setVisibility(v ?? '')}
          >
            <SelectTrigger aria-labelledby="project-visibility-label">
              <SelectValue placeholder="Select visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="team">Team</SelectItem>
              <SelectItem value="public">Public</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <SheetFooter>
          <SheetClose render={<Button intent="ghost">Cancel</Button>} />
          <SheetClose render={<Button>Create</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
