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
            src="/images/team-man-1.jpg" 
            alt="Nikolaos Silvestros"
            className="w-full h-64 object-cover rounded-md shadow"
          />
          <img
            src="/images/team-woman-1.jpg"
            alt="Andriani Christoforou"
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
              Nikolaos Silvestros-Quality Assurance
            </h3>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 leading-6">
              Nikolaos is the founder and coordinator of the team. He oversees the 
              progress of the program, identifies errors and forwards them for 
              correction, while also contributing to the website’s design. 
              His role is to safeguard quality and anticipate future challenges.
            </p>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Andriani Christoforou-Advisor
            </h3>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 leading-6">
              Andriani brings a fresh perspective to the team, offering creative ideas
              and honest feedback. Her presence adds balance and inspiration, 
              strengthening teamwork and fostering a positive atmosphere at every stage 
              of the project.
            </p>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Theodore Silvestros-Developer
            </h3>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 leading-6">
              Theodore is the driving force behind the team’s technology. 
              He designs and implements the program, turning ideas into functional 
              applications. With his ability to solve every technical challenge, 
              he ensures the quality and innovation of the project.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
