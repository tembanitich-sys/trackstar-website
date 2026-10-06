"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { getTrackStar as t, helpPresetFor, helpPresets, legalProductName } from "@/content/site";
import { ENQUIRY_ENDPOINT } from "@/lib/submit";
import {
  a11y, Checkbox, CountrySelect, Field, FormMessage, inputClass, PhoneField, submitClass, SuccessPanel,
} from "./fields";
import { Honeypot } from "./Honeypot";
import { Turnstile } from "./Turnstile";
import { UtmFields } from "./Utm";
import { useFormSubmit } from "./useFormSubmit";

/**
 * Operator enquiry form. The CTA buttons link here with `?help=need` or `?help=demo`,
 * which presets "How can <product> help?"; the visitor can change it. The page is static,
 * so the query string is read in the browser.
 */
export function EnquiryForm() {
  return (
    <Suspense fallback={<EnquiryFormBody helpDefault={helpPresets.need} />}>
      <PresetForm />
    </Suspense>
  );
}

function PresetForm() {
  const preset = useSearchParams()?.get("help") ?? undefined;
  return <EnquiryFormBody key={preset ?? "default"} helpDefault={helpPresetFor(preset)} />;
}

export function EnquiryFormBody({ helpDefault, endpoint = ENQUIRY_ENDPOINT }: { helpDefault: string; endpoint?: string }) {
  const { state, pending, onSubmit, formRef } = useFormSubmit(endpoint);
  const [current, setCurrent] = useState("none");
  const err = state.fieldErrors ?? {};

  if (state.status === "success") return <SuccessPanel title={t.successTitle} body={t.successBody} />;

  return (
    <form ref={formRef} onSubmit={onSubmit} className="grid gap-5">
      <FormMessage message={state.status === "error" ? state.message : undefined} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="fullName" label={t.fields.fullName} required error={err.fullName}>
          <input id="fullName" name="fullName" autoComplete="name" required className={inputClass} {...a11y("fullName", err.fullName)} />
        </Field>
        <Field id="company" label={t.fields.company} required error={err.company}>
          <input id="company" name="company" autoComplete="organization" required className={inputClass} {...a11y("company", err.company)} />
        </Field>
        <PhoneField name="mobile" label={t.fields.mobile} required error={err.mobile} />
        <Field id="email" label={t.fields.email} required error={err.email}>
          <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} {...a11y("email", err.email)} />
        </Field>
        <Field id="country" label={t.fields.country} required error={err.country}>
          <CountrySelect id="country" name="country" error={err.country} />
        </Field>
        <Field id="fleetSize" label={t.fields.fleetSize} required error={err.fleetSize}>
          <select id="fleetSize" name="fleetSize" required defaultValue="" className={inputClass} {...a11y("fleetSize", err.fleetSize)}>
            <option value="" disabled>
              Select
            </option>
            {t.fleetSizes.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field id="helpType" label={t.fields.help} required error={err.helpType}>
        <select id="helpType" name="helpType" required defaultValue={helpDefault} className={inputClass} {...a11y("helpType", err.helpType)}>
          {t.helpTypes.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="currentTicketing" label={t.fields.currentTicketing} error={err.currentTicketing}>
          <select
            id="currentTicketing"
            name="currentTicketing"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className={inputClass}
            {...a11y("currentTicketing", err.currentTicketing)}
          >
            {t.currentTicketing.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        {current === "own_system" ? (
          <Field id="currentSystemName" label={t.fields.systemName} error={err.currentSystemName}>
            <input id="currentSystemName" name="currentSystemName" className={inputClass} {...a11y("currentSystemName", err.currentSystemName)} />
          </Field>
        ) : null}
      </div>

      <Field id="message" label={t.fields.message} error={err.message}>
        <textarea id="message" name="message" rows={4} className={inputClass} {...a11y("message", err.message)} />
      </Field>

      <div className="grid gap-3">
        <Checkbox id="marketingConsent" name="marketingConsent">
          {t.marketing}
        </Checkbox>
        <Checkbox id="privacyAck" name="privacyAck" required error={err.privacyAck}>
          I have read the {legalProductName}{" "}
          <Link href="/privacy/" className="font-semibold text-green-text underline underline-offset-2">
            Privacy Notice
          </Link>
          .
        </Checkbox>
      </div>

      <Honeypot />
      <UtmFields />
      <Turnstile resetKey={state} />

      <div>
        <button type="submit" disabled={pending} aria-disabled={pending} className={submitClass}>
          {pending ? "SENDING..." : t.submit}
        </button>
      </div>
    </form>
  );
}
