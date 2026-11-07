import { useState, type FormEvent } from 'react';
import {
  Button,
  Card,
  Checkbox,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SidePanel,
  SidePanelClose,
  SidePanelContent,
  SidePanelDescription,
  SidePanelFooter,
  SidePanelHeader,
  SidePanelTitle,
  SidePanelTrigger,
  Textarea,
} from '@code-sherpas/pharos-react';

const PRIORITIES = { high: 'High', medium: 'Medium', low: 'Low' };
type Priority = keyof typeof PRIORITIES;

interface Action {
  name: string;
  priority: Priority;
}

const EMPTY_DRAFT = { name: '', priority: 'medium' as Priority, notes: '' };

/**
 * An assessment report with a coaching plan, and a SidePanel holding the form
 * that adds an action to it. On a wide screen the panel sits beside the report
 * and narrows it, and the report stays usable (the «Reviewed» checkbox); on a
 * narrow one the same panel opens as the modal Sheet. The draft lives here, in
 * the page, so it survives the panel switching form when the window crosses
 * the breakpoint — the panel unmounts its content, keeping it is the
 * consumer's job.
 */
export function ReportPage() {
  const [actions, setActions] = useState<Action[]>([
    { name: 'Pair on the release checklist', priority: 'high' },
  ]);
  const [reviewed, setReviewed] = useState(false);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  function addAction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.name.trim()) return;
    setActions(function append(current) {
      return [...current, { name: draft.name.trim(), priority: draft.priority }];
    });
    setDraft(EMPTY_DRAFT);
    setOpen(false);
  }

  return (
    <div className="report">
      <SidePanel open={open} onOpenChange={setOpen}>
        <section className="report-body" aria-labelledby="report-heading">
          <div className="page-head">
            <h1 id="report-heading">Assessment report</h1>
            <SidePanelTrigger render={<Button size="sm">Add action</Button>} />
          </div>
          <Card className="report-card">
            <h2>Summary</h2>
            <p>
              The team met four of its six goals this quarter. Delivery is steady, and the review
              cadence held through the release.
            </p>
            <label className="report-reviewed" htmlFor="report-reviewed">
              <Checkbox
                id="report-reviewed"
                checked={reviewed}
                onCheckedChange={function markReviewed(next) {
                  setReviewed(next === true);
                }}
              />
              Reviewed
            </label>
          </Card>
          <Card className="report-card">
            <h2>Coaching plan</h2>
            <ul aria-label="Coaching plan" className="report-actions">
              {actions.map((action) => (
                <li key={action.name}>
                  {action.name} · {PRIORITIES[action.priority]}
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <SidePanelContent>
          <form className="report-form" onSubmit={addAction} noValidate>
            <SidePanelHeader>
              <SidePanelTitle>New action</SidePanelTitle>
              <SidePanelDescription>Add a step to the coaching plan.</SidePanelDescription>
            </SidePanelHeader>
            <div className="field">
              <label htmlFor="action-name">Action</label>
              <Input
                id="action-name"
                value={draft.name}
                onChange={function editName(event) {
                  const name = event.target.value;
                  setDraft(function withName(current) {
                    return { ...current, name };
                  });
                }}
              />
            </div>
            <div className="field">
              <label id="action-priority-label">Priority</label>
              <Select
                items={PRIORITIES}
                value={draft.priority}
                onValueChange={function pickPriority(next) {
                  if (next === null) return;
                  setDraft(function withPriority(current) {
                    return { ...current, priority: next as Priority };
                  });
                }}
              >
                <SelectTrigger aria-labelledby="action-priority-label">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="field">
              <label htmlFor="action-notes">Notes</label>
              <Textarea
                id="action-notes"
                value={draft.notes}
                onChange={function editNotes(event) {
                  const notes = event.target.value;
                  setDraft(function withNotes(current) {
                    return { ...current, notes };
                  });
                }}
              />
            </div>
            <SidePanelFooter>
              <SidePanelClose render={<Button intent="ghost">Cancel</Button>} />
              <Button type="submit">Save action</Button>
            </SidePanelFooter>
          </form>
        </SidePanelContent>
      </SidePanel>
    </div>
  );
}
