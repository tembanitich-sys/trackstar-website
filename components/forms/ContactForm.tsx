"use client";

import Link from "next/link";
import { contact as t, legalProductName } from "@/content/site";
import { CONTACT_ENDPOINT } from "@/lib/submit";
import { a11y, Checkbox, Field, FormMessage, inputClass, PhoneField, submitClass, SuccessPanel } from "./fields";
import { Honeypot } from "./Honeypot";
import { Turnstile } from "./Turnstile";
import { useFormSubmit } from "./useFormSubmit";

export function ContactForm({ endpoint = CONTACT_ENDPOINT }: { endpoint?: string }) {
  const { state, pending, onSubmit, formRef } = useFormSubmit(endpoint);
  const err = state.fieldErrors ?? {};

  if (state.status === "success") return <SuccessPanel title={t.successTitle} />;

  return (
    <form ref={formRef} onSubmit={onSubmit} className="grid gap-5">
      <FormMessage message={state.status === "error" ? state.message : undefined} />
      <Field id="contactName" label={t.fields.name} required error={err.name}>
        <input id="contactName" name="name" autoComplete="name" required className={inputClass} {...a11y("contactName", err.name)} />
      </Field>
      <Field id="contactEmail" label={t.fields.email} required error={err.email}>
        <input id="contactEmail" name="email" type="email" autoComplete="email" required className={inputClass} {...a11y("contactEmail", err.email)} />
      </Field>
      <PhoneField name="phone" label={t.fields.phone} error={err.phone} />
      <Field id="enquiryType" label={t.fields.enquiryType} required error={err.enquiryType}>
        <select id="enquiryType" name="enquiryType" required defaultValue="general" className={inputClass} {...a11y("enquiryType", err.enquiryType)}>
          {t.enquiryTypes.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>
      <Field id="contactMessage" label={t.fields.message} required error={err.message}>
        <textarea id="contactMessage" name="message" required rows={5} className={inputClass} {...a11y("contactMessage", err.message)} />
      </Field>
      <Checkbox id="contactPrivacyAck" name="privacyAck" required error={err.privacyAck}>
        I have read the {legalProductName}{" "}
        <Link href="/privacy/" className="font-semibold text-green-text underline underline-offset-2">
          Privacy Notice
        </Link>
        .
      </Checkbox>
      <Honeypot />
      <Turnstile resetKey={state} />
      <div>
        <button type="submit" disabled={pending} aria-disabled={pending} className={submitClass}>
          {pending ? "SENDING..." : t.submit}
        </button>
      </div>
    </form>
  );
}
