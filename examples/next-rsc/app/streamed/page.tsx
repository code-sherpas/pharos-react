// A page whose data takes a while: Next streams it after the shell, inside the
// Suspense boundary of `loading.tsx`, so the shell hydrates before it arrives.
export const dynamic = 'force-dynamic';

const DATA_DELAY_MS = 1500;

function waitForData(): Promise<void> {
  return new Promise(function resolveLater(resolve) {
    setTimeout(resolve, DATA_DELAY_MS);
  });
}

export default async function StreamedPage() {
  await waitForData();
  return (
    <section data-streamed-page="">
      <h1>Quarterly report</h1>
      <p>The report the server sent.</p>
    </section>
  );
}
