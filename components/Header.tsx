import Link from "next/link";
import { LogIn } from "lucide-react";
import { cta, nav, operatorLogin } from "@/content/site";
import { Button } from "./ui";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white">
      <div className="relative mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="TrackStar home" className="flex items-center">
          <Logo variant="horizontal" height={40} priority />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-6 lg:flex">
          <ul className="flex items-center gap-6">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center text-sm font-semibold text-navy transition-colors duration-150 hover:text-green-text"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          {/* Secondary: a text link to the operator portal (a different site), same tab. Not a button. */}
          <a
            href={operatorLogin.href}
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-muted transition-colors duration-150 hover:text-navy"
          >
            <LogIn aria-hidden="true" className="size-4" />
            {operatorLogin.label}
          </a>
          <Button href="/?help=need#get-trackstar">{cta.primary}</Button>
        </nav>
        <MobileNav />
      </div>
    </header>
  );
}
