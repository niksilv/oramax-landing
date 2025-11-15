// app/contact-us/page.tsx
import BgHero from "@/components/BgHero";

export const metadata = { title: "Contact us" };

export default function ContactUsPage() {
  return (
    <main className="container mx-auto px-6 py-10">
      <BgHero image="/images/contact.jpg" title="Contact" subtitle="Get in touch" />
      <section className="mt-8 space-y-3">
        <p>
          Email: <a className="underline" href="mailto:hello@oramax.space">hello@oramax.space</a>
        </p>
        <p>We’ll get back to you as soon as possible.</p>
      </section>
    </main>
  );
}
