import { useState } from 'react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Textarea,
} from '@code-sherpas/pharos-react';

const PLURAL = new Intl.PluralRules('en');

/**
 * The warning's title, one whole message per plural category of English
 * (`one`, `other`); the categories English never returns fall back to `other`.
 */
const USED_IN: Record<Intl.LDMLPluralRule, (count: number) => string> = {
  zero: usedInMany,
  one: function usedInOne(count) {
    return `Used in ${count} assessment`;
  },
  two: usedInMany,
  few: usedInMany,
  many: usedInMany,
  other: usedInMany,
};

function usedInMany(count: number) {
  return `Used in ${count} assessments`;
}

function usedIn(count: number) {
  return USED_IN[PLURAL.select(count)](count);
}

interface EditDescriptionDialogProps {
  /** The element's name, shown under the title so the dialog says what it edits. */
  name: string;
  description: string;
  /** How many assessments already rated this element. */
  assessments: number;
  onSave: (description: string) => void;
}

/**
 * A form in a Dialog with the two inline notices of the Alert contract: when
 * the element was already assessed, a warning — that saving changes what those
 * assessments mean — before the action of saving, in reading and in focus
 * order; and beside it an informative note. Told apart by icon, bar and title,
 * not by colour alone; each title a heading under the dialog's own.
 */
export function EditDescriptionDialog({
  name,
  description,
  assessments,
  onSave,
}: EditDescriptionDialogProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(description);

  function openWithTheCurrentDescription(next: boolean) {
    if (next) setDraft(description);
    setOpen(next);
  }

  function save() {
    onSave(draft);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={openWithTheCurrentDescription}>
      <DialogTrigger render={<Button intent="secondary">Edit description</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit description</DialogTitle>
          <DialogDescription>{name}</DialogDescription>
        </DialogHeader>

        <div className="edit-description-notices">
          {assessments > 0 && (
            <Alert variant="warning">
              <AlertTitle render={<h3 />}>{usedIn(assessments)}</AlertTitle>
              <AlertDescription>
                Saving a different description changes what those assessments mean.
              </AlertDescription>
            </Alert>
          )}
          <Alert variant="info">
            <AlertTitle render={<h3 />}>Assessors read this description</AlertTitle>
            <AlertDescription>It is shown next to the element when they rate it.</AlertDescription>
          </Alert>
        </div>

        <div className="field">
          <label htmlFor="edit-description">Description</label>
          <Textarea
            id="edit-description"
            value={draft}
            onChange={function keepTheDraft(event) {
              setDraft(event.target.value);
            }}
          />
        </div>

        <DialogFooter>
          <DialogClose render={<Button intent="ghost">Cancel</Button>} />
          <Button onClick={save}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
