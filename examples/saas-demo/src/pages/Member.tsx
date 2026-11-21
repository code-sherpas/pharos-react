import { useEffect, useRef } from 'react';
import {
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbText,
  Card,
  CardContent,
} from '@code-sherpas/pharos-react';
import { PROJECTS_BY_MEMBER, ROLE_TONE, type Member } from '../data';
import { TeamLink, type TeamView } from '../components/TeamLink';

interface InnerPageProps {
  member: Member;
  /** Whether the signed-in person may open a member's page. */
  canOpenMember: boolean;
  onNavigate: (view: TeamView) => void;
}

/**
 * Moves focus to the page's heading when it opens, so a keyboard or
 * screen-reader user lands on the new screen rather than where the old one
 * left them (a route change in a single-page app).
 */
function useHeadingFocusedOnArrival() {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(function focusTheNewScreen() {
    heading.current?.focus();
  }, []);
  return heading;
}

/**
 * The detail of a member, an inner screen of Team: the breadcrumb says
 * Team › the member, and goes back up to the list.
 */
export function MemberPage({ member, onNavigate }: Omit<InnerPageProps, 'canOpenMember'>) {
  const heading = useHeadingFocusedOnArrival();
  return (
    <section className="inner-page">
      <Breadcrumb aria-label="Breadcrumb">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<TeamLink to={{ kind: 'list' }} onNavigate={onNavigate} />}>
              Team
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{member.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 ref={heading} tabIndex={-1}>
        {member.name}
      </h1>
      <Card>
        <CardContent className="member-facts">
          <dl>
            <dt>Email</dt>
            <dd>{member.email}</dd>
            <dt>Role</dt>
            <dd>
              <Badge variant={ROLE_TONE[member.role]}>{member.role}</Badge>
            </dd>
          </dl>
          <TeamLink
            className="text-link"
            to={{ kind: 'projects', memberId: member.id }}
            onNavigate={onNavigate}
          >
            Projects
          </TeamLink>
        </CardContent>
      </Card>
    </section>
  );
}

/**
 * A step on a member: their projects. The breadcrumb is Team › the member ›
 * Projects. Someone who may not open member pages (a viewer looking at their
 * own projects) sees the member's level as text, not as a link to a refusal.
 */
export function MemberProjectsPage({ member, canOpenMember, onNavigate }: InnerPageProps) {
  const heading = useHeadingFocusedOnArrival();
  const projects = PROJECTS_BY_MEMBER[member.id] ?? [];
  return (
    <section className="inner-page">
      <Breadcrumb aria-label="Breadcrumb">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<TeamLink to={{ kind: 'list' }} onNavigate={onNavigate} />}>
              Team
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {canOpenMember ? (
              <BreadcrumbLink
                render={
                  <TeamLink to={{ kind: 'member', memberId: member.id }} onNavigate={onNavigate} />
                }
              >
                {member.name}
              </BreadcrumbLink>
            ) : (
              <BreadcrumbText>{member.name}</BreadcrumbText>
            )}
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Projects</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 ref={heading} tabIndex={-1}>
        Projects of {member.name}
      </h1>
      <Card>
        <CardContent className="project-card">
          <ul className="project-list">
            {projects.map((project) => (
              <li key={project}>{project}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
