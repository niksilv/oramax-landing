export default function BgHero({ children }: { children?: React.ReactNode }) {
  return (
    <section className="w-full bg-black/5 dark:bg-white/5 py-16">
      <div className="max-w-5xl mx-auto px-4">{children}</div>
    </section>
  );
}
