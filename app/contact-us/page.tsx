// components/BgHero.tsx
import React from "react";

type Props = {
  image?: string;      // π.χ. "/images/contact.jpg"
  title?: string;      // π.χ. "Contact"
  subtitle?: string;   // π.χ. "Get in touch"
  children?: React.ReactNode;
};

export default function BgHero({ image, title, subtitle, children }: Props) {
  return (
    <section className="relative w-full min-h-[280px] flex items-center justify-center text-white overflow-hidden rounded-2xl">
      {/* background image */}
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{
          backgroundImage: image ? `url(${image})` : undefined,
        }}
      />
      {/* gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      {/* content */}
      <div className="relative z-10 px-6 py-14 text-center">
        {subtitle && (
          <p className="text-sm md:text-base opacity-90 tracking-wide uppercase">
            {subtitle}
          </p>
        )}
        {title && (
          <h1 className="mt-2 text-3xl md:text-5xl font-semibold">{title}</h1>
        )}
        {children && <div className="mt-5">{children}</div>}
      </div>
    </section>
  );
}
