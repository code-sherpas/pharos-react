import { createRef, type ReactNode } from 'react';
import { describe, it, expect } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import { Avatar, AvatarImage, AvatarFallback, AvatarGroup } from '../src/components/Avatar';

const Icon = ({ testId = 'fallback-icon' }: { testId?: string }) => (
  <svg data-testid={testId} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M0 0h24v24H0z" />
  </svg>
);

/**
 * jsdom does not fire `onLoad` / `onError` for `<img>` elements; the
 * helper dispatches the synthetic event directly so the loading-state
 * machine can be exercised in unit tests. Same workaround Radix and
 * Base UI test suites apply.
 */
async function fireImageLoad(img: HTMLImageElement | null) {
  if (!img) throw new Error('expected an img element');
  await act(async () => {
    img.dispatchEvent(new Event('load'));
  });
}

async function fireImageError(img: HTMLImageElement | null) {
  if (!img) throw new Error('expected an img element');
  await act(async () => {
    img.dispatchEvent(new Event('error'));
  });
}

function renderAvatar(children: ReactNode, props?: Parameters<typeof Avatar>[0]) {
  return render(<Avatar {...props}>{children}</Avatar>);
}

describe('Avatar', () => {
  it('renders a span root with default size and shape data attributes', () => {
    renderAvatar(<AvatarFallback>JD</AvatarFallback>);
    const root = screen.getByText('JD').parentElement;
    expect(root?.tagName).toBe('SPAN');
    expect(root).toHaveAttribute('data-pharos-size', 'md');
    expect(root).toHaveAttribute('data-pharos-shape', 'circle');
  });

  it.each([['sm'], ['md'], ['lg']] as const)(
    'exposes %s named size through data-pharos-size',
    (size) => {
      renderAvatar(<AvatarFallback>JD</AvatarFallback>, { size });
      expect(screen.getByText('JD').parentElement).toHaveAttribute('data-pharos-size', size);
    },
  );

  it.each([['circle'], ['square']] as const)(
    'exposes %s shape through data-pharos-shape',
    (shape) => {
      renderAvatar(<AvatarFallback>JD</AvatarFallback>, { shape });
      expect(screen.getByText('JD').parentElement).toHaveAttribute('data-pharos-shape', shape);
    },
  );

  it('applies a numeric size as inline width / height', () => {
    renderAvatar(<AvatarFallback>JD</AvatarFallback>, { size: 108 });
    const root = screen.getByText('JD').parentElement as HTMLElement;
    expect(root).toHaveAttribute('data-pharos-size', '108');
    expect(root.style.width).toBe('108px');
    expect(root.style.height).toBe('108px');
  });

  it('forwards a ref to the underlying span element', () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <Avatar ref={ref}>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('composes with a custom element via the render prop', () => {
    render(
      <Avatar render={<a href="/profile" />}>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );
    const link = screen.getByRole('link');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/profile');
    expect(link).toHaveAttribute('data-pharos-shape', 'circle');
  });

  it('merges a consumer className with the variant classes', () => {
    renderAvatar(<AvatarFallback>JD</AvatarFallback>, { className: 'extra' });
    expect(screen.getByText('JD').parentElement).toHaveClass('extra');
  });
});

describe('AvatarImage', () => {
  it('renders the fallback while the image is loading', () => {
    render(
      <Avatar>
        <AvatarImage src="https://example.com/a.jpg" alt="A" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('hides the fallback once the image reports loaded', async () => {
    render(
      <Avatar>
        <AvatarImage src="https://example.com/a.jpg" alt="A" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );
    const img = screen.getByRole('img');
    await fireImageLoad(img as HTMLImageElement);
    await waitFor(() => expect(screen.queryByText('JD')).not.toBeInTheDocument());
    const root = (img as HTMLImageElement).parentElement;
    expect(root).toHaveAttribute('data-pharos-loading', 'loaded');
  });

  it('removes the image and keeps the fallback when load fails', async () => {
    render(
      <Avatar>
        <AvatarImage src="https://example.com/missing.jpg" alt="missing" />
        <AvatarFallback>FB</AvatarFallback>
      </Avatar>,
    );
    const img = screen.getByRole('img') as HTMLImageElement;
    await fireImageError(img);
    await waitFor(() => expect(screen.queryByRole('img')).not.toBeInTheDocument());
    expect(screen.getByText('FB')).toBeInTheDocument();
  });

  it('skips rendering when src is missing', () => {
    render(
      <Avatar>
        <AvatarImage src="" alt="" />
        <AvatarFallback>FB</AvatarFallback>
      </Avatar>,
    );
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('FB')).toBeInTheDocument();
  });

  it('invokes onLoadingStatusChange on transitions', async () => {
    const events: string[] = [];
    render(
      <Avatar>
        <AvatarImage
          src="https://example.com/a.jpg"
          alt="A"
          onLoadingStatusChange={(status) => events.push(status)}
        />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );
    await fireImageLoad(screen.getByRole('img') as HTMLImageElement);
    expect(events).toContain('loading');
    expect(events).toContain('loaded');
  });
});

describe('AvatarFallback', () => {
  it('renders icon children verbatim', () => {
    render(
      <Avatar>
        <AvatarFallback>
          <Icon />
        </AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByTestId('fallback-icon')).toBeInTheDocument();
  });

  it('delays rendering when delayMs is set', async () => {
    render(
      <Avatar>
        <AvatarImage src="https://example.com/a.jpg" alt="A" />
        <AvatarFallback delayMs={120}>JD</AvatarFallback>
      </Avatar>,
    );
    // The fallback is hidden during the delay.
    expect(screen.queryByText('JD')).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('JD')).toBeInTheDocument(), { timeout: 500 });
  });
});

describe('AvatarGroup', () => {
  it('renders every child when no max is set', () => {
    render(
      <AvatarGroup>
        <Avatar>
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>B</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>C</AvatarFallback>
        </Avatar>
      </AvatarGroup>,
    );
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('cascades size and shape to Avatar children that omit them', () => {
    render(
      <AvatarGroup size="lg" shape="square">
        <Avatar>
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
      </AvatarGroup>,
    );
    const root = screen.getByText('A').parentElement;
    expect(root).toHaveAttribute('data-pharos-size', 'lg');
    expect(root).toHaveAttribute('data-pharos-shape', 'square');
  });

  it('caps visible children to max - 1 and renders a +N overflow avatar', () => {
    render(
      <AvatarGroup max={3}>
        <Avatar>
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>B</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>C</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>D</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>E</AvatarFallback>
        </Avatar>
      </AvatarGroup>,
    );
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.queryByText('C')).not.toBeInTheDocument();
    expect(screen.queryByText('D')).not.toBeInTheDocument();
    expect(screen.queryByText('E')).not.toBeInTheDocument();
    // 5 children, max=3 → visible = max - 1 = 2, surplus = 5 - 2 = 3.
    expect(screen.getByText('+3')).toBeInTheDocument();
    expect(screen.getByLabelText('3 more')).toBeInTheDocument();
  });

  it('does not render an overflow avatar when children fit within max', () => {
    render(
      <AvatarGroup max={4}>
        <Avatar>
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>B</AvatarFallback>
        </Avatar>
      </AvatarGroup>,
    );
    expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
  });

  it('supports a custom renderOverflow', () => {
    render(
      <AvatarGroup max={2}>
        <Avatar>
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>B</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>C</AvatarFallback>
        </Avatar>
      </AvatarGroup>,
    );
    // Default surplus message renders without renderOverflow.
    expect(screen.getByText('+2')).toBeInTheDocument();
  });
});
