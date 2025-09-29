// components/Header.tsx
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full px-6 py-4 flex items-center">
      <Link href="/" className="flex items-center space-x-2">
        <Image
          src="/logos/oramax-logo.png"
          alt="Oramax Logo"
          width={48}
          height={48}
          priority
        />
        <span className="text-xl font-semibold text-white">Orama X</span>
      </Link>
    </header>
  );
}
