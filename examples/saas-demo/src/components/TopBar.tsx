import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  IconButton,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from '@code-sherpas/pharos-react';
import { useEffect, useRef } from 'react';
import { Bell, LogOut, Settings as SettingsIcon, Users } from 'lucide-react';
import { NOTIFICATIONS, initials } from '../data';
import { NewProjectSheet } from './NewProjectSheet';
import type { Page } from '../Shell';

interface TopBarProps {
  user: string;
  page: Page;
  onNavigate: (page: Page) => void;
  onSignOut: () => void;
}

const NAV: { id: Page; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'team', label: 'Team' },
  { id: 'settings', label: 'Settings' },
];

/**
 * Composes four overlay/atom families in one bar: nav Buttons, a Popover
 * (notifications) triggered by an IconButton carrying a Badge count, and an
 * Avatar-in-IconButton DropdownMenu (account menu). This is where the harness
 * gets to stress overlay stacking, focus return and keyboard flows.
 *
 * It also publishes where it ends, as `--nimbus-topbar-bottom` on the root,
 * so the app's Toaster can sit below it through `offset` instead of over it.
 */
export function TopBar({ user, page, onNavigate, onSignOut }: TopBarProps) {
  const bar = useRef<HTMLElement>(null);
  useEffect(function publishWhereTheBarEnds() {
    const element = bar.current;
    if (element === null) return;
    const root = document.documentElement;
    const observer = new ResizeObserver(function measure() {
      root.style.setProperty(
        '--nimbus-topbar-bottom',
        `${element.getBoundingClientRect().bottom}px`,
      );
    });
    observer.observe(element);
    return function forget() {
      observer.disconnect();
      root.style.removeProperty('--nimbus-topbar-bottom');
    };
  }, []);

  return (
    <header className="topbar" ref={bar}>
      <div className="topbar-brand">Nimbus</div>

      <nav className="topbar-nav" aria-label="Primary">
        {NAV.map((n) => (
          <Button
            key={n.id}
            intent={page === n.id ? 'secondary' : 'ghost'}
            size="sm"
            aria-current={page === n.id ? 'page' : undefined}
            onClick={() => onNavigate(n.id)}
          >
            {n.label}
          </Button>
        ))}
      </nav>

      <div className="topbar-actions">
        <NewProjectSheet />
        <div className="notif">
          <Popover>
            <PopoverTrigger
              render={
                <IconButton aria-label="Notifications">
                  <Bell size={18} aria-hidden="true" />
                </IconButton>
              }
            />
            <PopoverContent align="end">
              <PopoverTitle>Notifications</PopoverTitle>
              <ul className="notif-list">
                {NOTIFICATIONS.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
              <PopoverClose
                render={
                  <Button intent="ghost" size="sm">
                    Close
                  </Button>
                }
              />
            </PopoverContent>
          </Popover>
          <Badge variant="destructive" className="notif-count" aria-hidden="true">
            {NOTIFICATIONS.length}
          </Badge>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <IconButton aria-label="Account menu">
                <Avatar size="sm">
                  <AvatarFallback>{initials(user)}</AvatarFallback>
                </Avatar>
              </IconButton>
            }
          />
          <DropdownMenuContent align="end">
            {/*
             * DropdownMenuLabel wraps Base UI's Menu.GroupLabel, which must
             * live inside a DropdownMenuGroup (Menu.Group) — it reads the
             * group context to wire aria-labelledby. Using the label on its
             * own throws "MenuGroupRootContext is missing" at open time.
             */}
            <DropdownMenuGroup>
              <DropdownMenuLabel>Signed in as {user}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onNavigate('settings')}>
                <SettingsIcon size={16} aria-hidden="true" /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigate('team')}>
                <Users size={16} aria-hidden="true" /> Team
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={onSignOut}>
              <LogOut size={16} aria-hidden="true" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
