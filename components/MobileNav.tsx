"use client";

import Link from "next/link";
import { useState } from "react";
import { LogIn, Menu, X } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { cta, nav, operatorLogin } from "@/content/site";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-12 items-center justify-center rounded-lg text-navy"
      >
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>
      {open ? (
        <nav
          id="mobile-menu"
          aria-label="Main"
          className="absolute inset-x-0 top-full border-b border-border bg-white px-4 pb-6 pt-2 shadow-card"
        >
          <ul className="grid">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center font-heading text-base font-semibold text-navy"
                >
                  {item.brand ? (
                    <span>
                      <BrandMark name={item.brand} textPx={16} />
                    </span>
                  ) : (
                    item.label
                  )}
                </Link>
              </li>
            ))}
            <li>
              <a href={operatorLogin.href} className="flex min-h-12 items-center gap-2 font-heading text-sm font-semibold text-muted">
                <LogIn aria-hidden="true" className="size-4" />
                {operatorLogin.label}
              </a>
            </li>
          </ul>
          <Link
            href="/?help=need#get-busrep"
            onClick={() => setOpen(false)}
            className="mt-3 flex min-h-12 items-center justify-center rounded-lg bg-green-text px-6 font-heading text-sm font-bold tracking-wide text-white"
          >
            {cta.primary}
          </Link>
        </nav>
      ) : null}
    </div>
  );
}
