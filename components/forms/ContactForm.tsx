"use client";

import Link from "next/link";
import { contact as t } from "@/content/site";
import { Checkbox, Field, inputClass, PhoneField, submitClass } from "./fields";

/** Contact form. Submission is wired in Phase 2; until then the button stays disabled. */
export function ContactForm() {
  const submitReady = false;
  return (
    <form className="grid gap-5" onSubmit={(e) => e.preventDefault()}>
      <Field id="contactName" label={t.fields.name} required>
        <input id="contactName" name="name" autoComplete="name" required className={inputClass} />
      </Field>
      <Field id="contactEmail" label={t.fields.email} required>
        <input id="contactEmail" name="email" type="email" autoComplete="email" required className={inputClass} />
      </Field>
      <PhoneField id="contactPhone" label={t.fields.phone} />
      <Field id="enquiryType" label={t.fields.enquiryType} required>
        <select id="enquiryType" name="enquiryType" required defaultValue="general" className={inputClass}>
          {t.enquiryTypes.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>
      <Field id="contactMessage" label={t.fields.message} required>
        <textarea id="contactMessage" name="message" rows={5} required className={inputClass} />
      </Field>
      <Checkbox id="contactPrivacyAck" name="privacyAck" required>
        I have read the TrackStar{" "}
        <Link href="/privacy" className="font-semibold text-green-text underline underline-offset-2">
          Privacy Notice
        </Link>
        .
      </Checkbox>
      <div>
        <button type="submit" disabled={!submitReady} className={submitClass}>
          {t.submit}
        </button>
      </div>
    </form>
  );
}
