import { useRef, useState, type ChangeEvent } from 'react';
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  RadioGroup,
  RadioGroupItem,
  Textarea,
} from '@code-sherpas/pharos-react';

export interface NewPillar {
  name: string;
  description: string;
}

const AUDIENCES = [
  { value: 'everyone', label: 'Everyone in the organisation' },
  { value: 'managers', label: 'People managers' },
  { value: 'contributors', label: 'Individual contributors' },
];

/**
 * Creating an element of the taxonomy is a form in a Dialog: the Alexandria
 * case the compact-width Dialog exists for. The form is taller than a phone,
 * so below `breakpoint.compact` the dialog fills the screen with its header
 * and footer pinned and only the fields scrolling between them; turning the
 * phone keeps what was typed. «Create pillar» stays unavailable (the focusable
 * way, aria-disabled) until there is a name, and pressed then it points at the
 * name field.
 */
export function NewPillarDialog({ onCreate }: { onCreate: (pillar: NewPillar) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [audience, setAudience] = useState('everyone');
  const [notes, setNotes] = useState('');
  const nameField = useRef<HTMLInputElement>(null);
  const canCreate = name.trim() !== '';

  function changeOpen(next: boolean) {
    setOpen(next);
    if (next) {
      setName('');
      setDescription('');
      setAudience('everyone');
      setNotes('');
    }
  }

  function create() {
    if (!canCreate) {
      nameField.current?.focus();
      return;
    }
    onCreate({ name: name.trim(), description: description.trim() });
    setOpen(false);
  }

  function changeName(event: ChangeEvent<HTMLInputElement>) {
    setName(event.target.value);
  }

  function changeDescription(event: ChangeEvent<HTMLTextAreaElement>) {
    setDescription(event.target.value);
  }

  function changeNotes(event: ChangeEvent<HTMLTextAreaElement>) {
    setNotes(event.target.value);
  }

  function changeAudience(value: unknown) {
    setAudience(String(value));
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger render={<Button size="sm">New pillar</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New pillar</DialogTitle>
          <DialogDescription>
            A pillar is the top level of the taxonomy: it groups categories.
          </DialogDescription>
        </DialogHeader>

        <div className="field">
          <label htmlFor="pillar-name">Name</label>
          <Input
            id="pillar-name"
            ref={nameField}
            value={name}
            onChange={changeName}
            aria-describedby={canCreate ? undefined : 'pillar-name-hint'}
          />
          {!canCreate && (
            <p id="pillar-name-hint" className="hint-text">
              Add a name to create the pillar.
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="pillar-description">Description</label>
          <Textarea
            id="pillar-description"
            rows={6}
            value={description}
            onChange={changeDescription}
          />
        </div>

        <div className="field">
          <span id="pillar-audience-label" className="field-heading">
            Applies to
          </span>
          <RadioGroup
            aria-labelledby="pillar-audience-label"
            value={audience}
            onValueChange={changeAudience}
          >
            {AUDIENCES.map((option) => (
              <label key={option.value} htmlFor={`audience-${option.value}`} className="radio-row">
                <RadioGroupItem id={`audience-${option.value}`} value={option.value} />
                {option.label}
              </label>
            ))}
          </RadioGroup>
        </div>

        <div className="field">
          <label htmlFor="pillar-notes">Notes for reviewers</label>
          <Textarea id="pillar-notes" rows={6} value={notes} onChange={changeNotes} />
        </div>

        <DialogFooter>
          <DialogClose render={<Button intent="ghost">Cancel</Button>} />
          <Button
            aria-disabled={!canCreate}
            aria-describedby={canCreate ? undefined : 'pillar-name-hint'}
            onClick={create}
          >
            Create pillar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
