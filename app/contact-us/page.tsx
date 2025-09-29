// app/contact-us/page.tsx
import BgHero from "@/components/BgHero";

export const metadata = {
  title: "Contact Us — Orama X",
  description: "Contact Orama X team",
};

export default function ContactPage() {
  return (
    <main className="min-h-[80vh] px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-10">
        <BgHero
          image="/images/contact.jpg"
          title="Contact"
          subtitle="Get in touch"
        >
          <p className="max-w-xl mx-auto text-base md:text-lg leading-7">
            Για συνεργασίες ή ερωτήσεις σχετικές με το NASA Challenge 2025, στείλε μας email.
          </p>
          <p className="mt-4 text-lg">
            Email:{" "}
            <a
              className="underline hover:opacity-80"
              href="mailto:info@oramax.space"
            >
              info@oramax.space
            </a>
          </p>
        </BgHero>
      </div>
    </main>
  );
}
