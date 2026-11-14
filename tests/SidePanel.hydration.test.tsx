import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, Suspense, use } from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToReadableStream } from 'react-dom/server';
import {
  SidePanel,
  SidePanelContent,
  SidePanelTitle,
  SidePanelTrigger,
} from '../src/components/SidePanel';

/**
 * A page streamed by a server framework: the shell (the SidePanel and its
 * trigger) arrives first, and the page itself later, inside a Suspense
 * boundary. While the shell hydrates, the page's HTML has not arrived yet.
 */

/** jsdom has no `matchMedia`: a phone below the panel breakpoint, or a desktop. */
function viewport(wide: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(function matchMedia(media: string) {
      return {
        media,
        matches: wide,
        addEventListener() {},
        removeEventListener() {},
      };
    }),
  );
}

let onServer = true;
const neverArrives = new Promise<never>(function pending() {});

/** On the server, the page's data is still on its way; in the browser, it never renders by itself. */
function Page() {
  if (onServer) use(neverArrives);
  return <p>Page rendered in the browser</p>;
}

function Shell({ defaultOpen = false }: { defaultOpen?: boolean }) {
  return (
    <SidePanel defaultOpen={defaultOpen}>
      <header>
        <SidePanelTrigger>Copilot</SidePanelTrigger>
      </header>
      <main>
        <Suspense fallback={<p>Loading page</p>}>
          <Page />
        </Suspense>
      </main>
      <SidePanelContent>
        <SidePanelTitle>Copilot</SidePanelTitle>
      </SidePanelContent>
    </SidePanel>
  );
}

/** The HTML the server has sent by the time the shell hydrates: the shell, with the page still pending. */
async function streamedShell(element: React.ReactElement): Promise<string> {
  onServer = true;
  const stream = await renderToReadableStream(element);
  const reader = stream.getReader();
  const { value } = await reader.read();
  reader.releaseLock();
  return new TextDecoder().decode(value);
}

let root: Root | null = null;
afterEach(() => {
  act(function unmount() {
    root?.unmount();
  });
  root = null;
  document.body.innerHTML = '';
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function hydrate(element: React.ReactElement) {
  // The response is still streaming: React waits for a pending boundary's
  // HTML only while the document is loading.
  vi.spyOn(document, 'readyState', 'get').mockReturnValue('loading');
  const container = document.createElement('div');
  container.innerHTML = await streamedShell(element);
  document.body.append(container);
  onServer = false;
  await act(async function hydrateShell() {
    root = hydrateRoot(container, element);
  });
  return container;
}

describe('SidePanel hydration', () => {
  it.each([
    ['a phone', false],
    ['a desktop', true],
  ])(
    'on %s, leaves a page still streaming to hydrate from the server HTML',
    async (_device, wide) => {
      viewport(wide);
      const container = await hydrate(<Shell />);

      expect(container.textContent).toContain('Loading page');
      expect(container.textContent).not.toContain('Page rendered in the browser');
    },
  );

  it('on a phone, an open panel leaves a page still streaming to hydrate from the server HTML', async () => {
    viewport(false);
    const container = await hydrate(<Shell defaultOpen />);

    expect(container.textContent).not.toContain('Page rendered in the browser');
  });

  it('on a desktop, an open panel leaves a page still streaming to hydrate from the server HTML', async () => {
    viewport(true);
    const container = await hydrate(<Shell defaultOpen />);

    expect(container.textContent).not.toContain('Page rendered in the browser');
  });
});
