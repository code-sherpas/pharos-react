import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LanguagesIcon } from '../src/icons/LanguagesIcon';

function renderedIcon(container: HTMLElement): SVGSVGElement {
  const svg = container.querySelector('svg');
  if (svg === null) throw new Error('LanguagesIcon rendered no <svg>');
  return svg;
}

describe('LanguagesIcon', () => {
  it('is hidden from assistive technology when it has no label', () => {
    const { container } = render(<LanguagesIcon />);
    const svg = renderedIcon(container);
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('is an image named by its label when it stands alone', () => {
    render(<LanguagesIcon label="Language" />);
    const img = screen.getByRole('img', { name: 'Language' });
    expect(img).not.toHaveAttribute('aria-hidden');
  });

  it('stays hidden when the label is an empty string, instead of becoming an unnamed image', () => {
    const { container } = render(<LanguagesIcon label="" />);
    expect(renderedIcon(container)).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('follows the text: 1em in size and the current colour', () => {
    const { container } = render(<LanguagesIcon />);
    const svg = renderedIcon(container);
    expect(svg).toHaveAttribute('width', '1em');
    expect(svg).toHaveAttribute('height', '1em');
    expect(svg).toHaveAttribute('stroke', 'currentColor');
    expect(svg).toHaveAttribute('fill', 'none');
  });

  it('draws Lucide languages on its 24-unit grid', () => {
    const { container } = render(<LanguagesIcon />);
    const svg = renderedIcon(container);
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    expect([...svg.querySelectorAll('path')].map((path) => path.getAttribute('d'))).toEqual([
      'm5 8 6 6',
      'm4 14 6-6 2-3',
      'M2 5h12',
      'M7 2h1',
      'm22 22-5-10-5 10',
      'M14 18h6',
    ]);
  });

  it('exposes data-pharos-icon for tests and selectors', () => {
    const { container } = render(<LanguagesIcon />);
    expect(renderedIcon(container)).toHaveAttribute('data-pharos-icon', 'languages');
  });

  it('lets the consumer size it and add a class', () => {
    const { container } = render(<LanguagesIcon width={20} height={20} className="nav-icon" />);
    const svg = renderedIcon(container);
    expect(svg).toHaveAttribute('width', '20');
    expect(svg).toHaveAttribute('height', '20');
    expect(svg).toHaveClass('nav-icon');
  });
});
