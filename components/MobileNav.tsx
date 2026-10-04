"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cta, nav } from "@/content/site";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
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
                  className="flex min-h-12 items-center text-base font-semibold text-navy"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/?help=need#get-trackstar"
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
