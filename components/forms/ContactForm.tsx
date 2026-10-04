"use client";

import Link from "next/link";
import { useActionState } from "react";
import { submitContactEnquiry } from "@/app/actions/enquiry";
import { contact as t } from "@/content/site";
import { idleState } from "@/lib/enquiries/types";
import type { FormState } from "@/lib/enquiries/types";
import { a11y, Checkbox, Field, FormMessage, inputClass, PhoneField, submitClass, SuccessPanel } from "./fields";
import { Turnstile } from "./Turnstile";

export function ContactForm({
  action = submitContactEnquiry,
}: {
  action?: (prev: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState(action, idleState);
  const err = state.fieldErrors ?? {};
  const v = state.values ?? {};

  if (state.status === "success") return <SuccessPanel title={t.successTitle} />;

  return (
    <form action={formAction} className="grid gap-5">
      <FormMessage message={state.status === "error" ? state.message : undefined} />
      <Field id="contactName" label={t.fields.name} required error={err.name}>
        <input id="contactName" name="name" autoComplete="name" required defaultValue={v.name} className={inputClass} {...a11y("contactName", err.name)} />
      </Field>
      <Field id="contactEmail" label={t.fields.email} required error={err.email}>
        <input id="contactEmail" name="email" type="email" autoComplete="email" required defaultValue={v.email} className={inputClass} {...a11y("contactEmail", err.email)} />
      </Field>
      <PhoneField name="phone" label={t.fields.phone} error={err.phone} defaultCountry={v.phoneCountry} defaultNational={v.phoneNational} />
      <Field id="enquiryType" label={t.fields.enquiryType} required error={err.enquiryType}>
        <select id="enquiryType" name="enquiryType" required defaultValue={v.enquiryType || "general"} className={inputClass} {...a11y("enquiryType", err.enquiryType)}>
          {t.enquiryTypes.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>
      <Field id="contactMessage" label={t.fields.message} required error={err.message}>
        <textarea id="contactMessage" name="message" rows={5} required defaultValue={v.message} className={inputClass} {...a11y("contactMessage", err.message)} />
      </Field>
      <Checkbox id="contactPrivacyAck" name="privacyAck" required error={err.privacyAck} defaultChecked={v.privacyAck === "on"}>
        I have read the TrackStar{" "}
        <Link href="/privacy" className="font-semibold text-green-text underline underline-offset-2">
          Privacy Notice
        </Link>
        .
      </Checkbox>
      <Turnstile resetKey={state} />
      <div>
        <button type="submit" disabled={pending} className={submitClass}>
          {t.submit}
        </button>
      </div>
    </form>
  );
}
