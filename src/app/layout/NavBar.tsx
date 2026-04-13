"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const navLinks = [
  { label: "Início", path: "/" },
  { label: "Sobre Mim", path: "/aboutMe" },
];

const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 z-90">

        {/* Logo */}
          <Link href="/" className="">
            <Image src="/logo.svg" className="object-cover" alt="Entre Livros" width={125} height={200} />
          </Link>

        {/* Links */}
        <div className="flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;

            return (
              <Link
                key={link.path}
                href={link.path}
                className={`rounded-full px-4 py-1.5 font-body text-sm font-medium transition-colors
                  ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"}
                `}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
