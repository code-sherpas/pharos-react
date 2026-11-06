import type { SVGProps } from 'react';

/**
 * The "languages" icon: a character and a Latin "A", the pattern people know
 * from language pickers. Path data is Lucide's `languages` (lucide-static
 * 1.70.0), copied verbatim under Lucide's ISC licence — see
 * THIRD-PARTY-NOTICES.md. Decision D4: Pharos icons are Lucide's.
 *
 * Inlined as an SVG so the published bundle takes no icon dependency, the same
 * convention as Spinner, Select and Checkbox. Stateless, so it renders in a
 * Server Component.
 *
 * - **Size** follows the surrounding text (`1em`). IconButton, Badge and the
 *   menu items size a child `svg` themselves; elsewhere set `width`/`height`
 *   or `font-size`.
 * - **Colour** is `currentColor`, so it takes the text colour of its parent.
 * - **Accessibility**: decorative by default (`aria-hidden`), because an icon
 *   almost always sits next to text or inside a control that carries the name
 *   (IconButton requires `aria-label`). When it stands alone and means
 *   something, pass `label`: it becomes `role="img"` with that accessible name.
 */
export interface LanguagesIconProps extends Omit<
  SVGProps<SVGSVGElement>,
  'role' | 'aria-hidden' | 'aria-label' | 'children'
> {
  /**
   * Accessible name, for an icon that stands alone and carries meaning. Omit
   * it (or pass an empty string) when text or the enclosing control already
   * names it: the icon is then hidden from assistive technology.
   */
  label?: string;
}

export function LanguagesIcon({ label, ...rest }: LanguagesIconProps) {
  const named = label !== undefined && label !== '';
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      data-pharos-icon="languages"
      {...rest}
      {...(named ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    >
      <path d="m5 8 6 6" />
      <path d="m4 14 6-6 2-3" />
      <path d="M2 5h12" />
      <path d="M7 2h1" />
      <path d="m22 22-5-10-5 10" />
      <path d="M14 18h6" />
    </svg>
  );
}

LanguagesIcon.displayName = 'LanguagesIcon';
