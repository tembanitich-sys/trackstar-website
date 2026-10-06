import Link from "next/link";
import { LogIn } from "lucide-react";
import { cta, nav, operatorLogin, productName } from "@/content/site";
import { Button } from "./ui";
import { clearSpace, Logo } from "./Logo";
import { MobileNav } from "./MobileNav";

/**
 * The logo is 32 px tall and the bar is exactly as tall as the logo plus the clear space BRAND.md asks for
 * (the wordmark's capital B) above and below: 32 + 2 x 24 = 80 px. app/globals.css keeps the same number in
 * --header-h (a test checks they agree).
 */
const LOGO_HEIGHT = 32;
const LOGO_CLEAR = clearSpace("horizontal", LOGO_HEIGHT);
export const HEADER_HEIGHT = LOGO_HEIGHT + 2 * LOGO_CLEAR;

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white">
      <div
        className="relative mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 lg:px-8"
        style={{ height: HEADER_HEIGHT }}
      >
        <Link href="/" aria-label={`${productName} home`} className="flex items-center">
          <Logo variant="horizontal" height={LOGO_HEIGHT} priority />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-6 lg:flex">
          <ul className="flex items-center gap-6">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center font-heading text-sm font-semibold text-navy transition-colors duration-150 hover:text-green-text"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          {/* Secondary: a text link to the operator portal (a different site), same tab. Not a button. */}
          <a
            href={operatorLogin.href}
            className="inline-flex min-h-11 items-center gap-1.5 font-heading text-sm font-semibold text-muted transition-colors duration-150 hover:text-navy"
          >
            <LogIn aria-hidden="true" className="size-4" />
            {operatorLogin.label}
          </a>
          <Button href="/?help=need#get-busrep">{cta.primary}</Button>
        </nav>
        <MobileNav />
      </div>
    </header>
  );
}
