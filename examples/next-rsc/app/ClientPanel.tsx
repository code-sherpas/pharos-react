'use client';

// A Client Component: the client atoms (hooks / context / Base UI primitives)
// live here behind the `"use client"` boundary, the way a real consumer wires
// interactive UI. Includes the two atoms that call `createContext` at module
// scope (Avatar — the original D14 RSC crash — and Combobox), so a regression
// that reintroduced the module-eval-on-server problem is caught by `next build`.
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  IconButton,
  Switch,
  Checkbox,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Combobox,
  ComboboxControl,
  ComboboxInput,
  ComboboxClear,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxList,
  ComboboxItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@code-sherpas/pharos-react';

const row = { display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' as const };
const FRUITS = ['Apple', 'Banana', 'Cherry'];

export function ClientPanel() {
  return (
    <section aria-label="Client-boundary atoms" style={{ display: 'grid', gap: 16 }}>
      <div style={row}>
        <Avatar>
          {/* Inline data-URI so the runtime smoke's console stays clean (a
              network 404 would log a resource error and mask real ones). */}
          <AvatarImage
            src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
            alt="Ada"
          />
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
        <IconButton aria-label="Settings">
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="3" fill="currentColor" />
          </svg>
        </IconButton>
        <label style={row} htmlFor="notify">
          <Switch id="notify" defaultChecked />
          Notifications
        </label>
        <label style={row} htmlFor="terms">
          <Checkbox id="terms" />
          Accept terms
        </label>
      </div>

      <RadioGroup defaultValue="card" aria-label="Payment method">
        <label style={row} htmlFor="pay-card">
          <RadioGroupItem id="pay-card" value="card" />
          Card
        </label>
        <label style={row} htmlFor="pay-cash">
          <RadioGroupItem id="pay-cash" value="cash" />
          Cash
        </label>
      </RadioGroup>

      <div style={row}>
        <Select items={{ a: 'Option A', b: 'Option B' }} defaultValue="a">
          <SelectTrigger aria-label="Choose option">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Option A</SelectItem>
            <SelectItem value="b">Option B</SelectItem>
          </SelectContent>
        </Select>

        <Combobox items={FRUITS}>
          <ComboboxControl>
            <ComboboxInput placeholder="Fruit…" aria-label="Fruit" />
            <ComboboxClear />
            <ComboboxTrigger aria-label="Open fruits" />
          </ComboboxControl>
          <ComboboxContent>
            <ComboboxEmpty>No fruit</ComboboxEmpty>
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

      <div style={row}>
        <Popover>
          <PopoverTrigger>Notifications</PopoverTrigger>
          <PopoverContent>You are all caught up.</PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger>Account</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog>
          <DialogTrigger>Invite</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite teammate</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <Sheet>
          <SheetTrigger>New project</SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>New project</SheetTitle>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>
    </section>
  );
}
