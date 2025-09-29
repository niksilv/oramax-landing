export default function Header({ title = "Orama X", subtitle = "" }: { title?: string; subtitle?: string }) {
  return (
    <header className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">{title}</h1>
      {subtitle ? <p className="text-sm opacity-80 mt-1">{subtitle}</p> : null}
    </header>
  );
}
