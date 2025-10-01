// app/our-project/our-challenge/page.tsx
export const dynamic = 'force-static';
export const metadata = { title: "Our Challenge — Orama X" };

export default function ChallengePage() {
  return (
    <main className="min-h-[80vh] px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold">Our Challenge</h1>
        <p className="mt-4 opacity-80">Temporary minimal page to isolate circular import.</p>
      </div>
    </main>
  );
}
