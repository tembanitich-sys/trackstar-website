import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { contactDetails, facts } from "@/content/facts";
import { contact, contactEmail } from "@/content/site";
import { ContactForm } from "@/components/forms/ContactForm";
import { Rich } from "@/components/Rich";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = { title: "Contact", alternates: canonical("/contact/") };

export default function ContactPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
      <div>
        <h1 className="text-4xl text-navy sm:text-5xl">{contact.headline}</h1>
        <ul className="mt-8 grid gap-2 text-base">
          <li>
            <a href={`mailto:${contactEmail}`} className="inline-flex min-h-11 items-center gap-2 font-semibold text-green-text underline underline-offset-2">
              <Mail aria-hidden="true" className="size-5" />
              <span className="sr-only">{contact.emailLabel}: </span>
              {contactEmail}
            </a>
          </li>
          {facts.showContactPhones
            ? contactDetails.phones.map((p) => (
                <li key={p}>
                  <a
                    href={`tel:${p.replace(/\s/g, "")}`}
                    className="inline-flex min-h-11 items-center gap-2 font-semibold text-green-text underline underline-offset-2"
                  >
                    <Phone aria-hidden="true" className="size-5" />
                    <span className="sr-only">{contact.phonesLabel}: </span>
                    {p}
                  </a>
                </li>
              ))
            : null}
          {facts.showAddress && contactDetails.address ? (
            <li className="flex items-start gap-2 text-ink">
              <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
              <span>
                <span className="sr-only">{contact.addressLabel}: </span>
                {contactDetails.address}
              </span>
            </li>
          ) : null}
        </ul>
        <p className="mt-8 rounded-xl border border-border bg-neutral-bg p-4 text-base text-ink">
          <Rich textPx={16}>{contact.operatorNote}</Rich>{" "}
          <Link href="/#get-busrep" className="font-semibold text-green-text underline underline-offset-2">
            {contact.operatorLink}
          </Link>
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-white p-5 shadow-card sm:p-8">
        <ContactForm />
      </div>
    </div>
  );
}
