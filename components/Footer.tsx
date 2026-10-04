import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { contactDetails } from "@/content/facts";
import type { Facts } from "@/content/facts";
import { contactEmail, footer, INSTATICKETS_URL } from "@/content/site";
import { Logo } from "./Logo";

export function Footer({ facts }: { facts: Facts }) {
  return (
    <footer>
      <div className="on-navy bg-navy text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <Logo variant="full-reversed" height={150} />
            <p className="mt-4 font-heading text-sm font-bold tracking-wide">{footer.tagline}</p>
          </div>
          <nav aria-label="Footer">
            <ul className="grid gap-1">
              {footer.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="inline-flex min-h-11 items-center text-sm font-semibold hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="grid content-start gap-3 text-sm">
            <a href={`mailto:${contactEmail}`} className="inline-flex min-h-11 items-center gap-2 font-semibold hover:underline">
              <Mail aria-hidden="true" className="size-4" />
              {contactEmail}
            </a>
            {facts.showContactPhones
              ? contactDetails.phones.map((p) => (
                  <a
                    key={p}
                    href={`tel:${p.replace(/\s/g, "")}`}
                    className="inline-flex min-h-11 items-center gap-2 font-semibold hover:underline"
                  >
                    <Phone aria-hidden="true" className="size-4" />
                    {p}
                  </a>
                ))
              : null}
            {facts.showAddress && contactDetails.address ? (
              <p className="inline-flex items-start gap-2">
                <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                {contactDetails.address}
              </p>
            ) : null}
            <ul className="mt-2 grid gap-1">
              {footer.legal.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="inline-flex min-h-11 items-center font-semibold hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Image
              src="/brand/bullion-compact.png"
              width={771}
              height={325}
              alt="Bullion Technologies"
              style={{ height: 44, width: "auto" }}
            />
            <p className="font-sans text-xs font-bold uppercase tracking-[0.14em] text-navy">
              {footer.endorsement}
            </p>
          </div>
          <p className="text-sm text-muted">
            {footer.productsLead}{" "}
            <a href={INSTATICKETS_URL} className="font-semibold text-green-text underline underline-offset-2">
              InstaTickets
            </a>{" "}
            &middot; TrackStar
          </p>
          <p className="text-sm text-muted">{footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
