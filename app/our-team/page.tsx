// app/our-team/page.tsx
export const metadata = { title: "Our Team — Orama X" };

export default function OurTeamPage() {
  return (
    <main className="min-h-[70vh] py-10">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-100 mb-8 text-center">
          Researchers &amp; Developers
        </h1>

        {/* Πίνακας 2x3 */}
        <div className="grid grid-cols-3 gap-6">
          {/* Γραμμή 1 - εικόνες */}
          <img
            src="/images/team-woman-1.jpg"
            alt="Andriani Christoforou"
            className="w-full h-64 object-cover rounded-md shadow"
          />
          <img
            src="/images/team-man-1.jpg"
            alt="Nikolaos Silvestros"
            className="w-full h-64 object-cover rounded-md shadow"
          />
          <img
            src="/images/team-man-2.jpg"
            alt="Theodore Silvestros"
            className="w-full h-64 object-cover rounded-md shadow"
          />

          {/* Γραμμή 2 - κείμενα */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Andriani Christoforou
            </h3>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 leading-6">
              A 20-year-old student studying Human Biology at the University of
              Nicosia. Her research involved a comparative analysis of the gender
              pay gap in the UK and Commonwealth, laying a foundation for
              understanding how climate change affects different genders.
            </p>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Nikolaos Silvestros
            </h3>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 leading-6">
              A 20-year-old student studying Human Biology at the University of
              Nicosia. His role was organizing the team, gathering data, and
              assisting in the design of the website.
            </p>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Theodore Silvestros
            </h3>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 leading-6">
              A graduate Senior Developer at the University of Montpellier,
              specializing in programming, statistics, and econometrics. He
              implemented the full development of the website.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
