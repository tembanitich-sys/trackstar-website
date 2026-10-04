"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { submitOperatorEnquiry } from "@/app/actions/enquiry";
import { getTrackStar as t } from "@/content/site";
import { idleState } from "@/lib/enquiries/types";
import type { FormState } from "@/lib/enquiries/types";
import {
  a11y, Checkbox, CountrySelect, Field, FormMessage, inputClass, PhoneField, submitClass, SuccessPanel,
} from "./fields";
import { Turnstile } from "./Turnstile";
import { UtmFields } from "./Utm";

/** Operator enquiry form. `helpDefault` is the CTA preset; the visitor can change it. */
export function EnquiryForm({
  helpDefault,
  action = submitOperatorEnquiry,
}: {
  helpDefault: string;
  action?: (prev: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState(action, idleState);
  const [current, setCurrent] = useState(state.values?.currentTicketing ?? "none");
  const err = state.fieldErrors ?? {};
  const v = state.values ?? {};

  if (state.status === "success") return <SuccessPanel title={t.successTitle} body={t.successBody} />;

  return (
    <form action={formAction} className="grid gap-5">
      <FormMessage message={state.status === "error" ? state.message : undefined} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="fullName" label={t.fields.fullName} required error={err.fullName}>
          <input id="fullName" name="fullName" autoComplete="name" required defaultValue={v.fullName} className={inputClass} {...a11y("fullName", err.fullName)} />
        </Field>
        <Field id="company" label={t.fields.company} required error={err.company}>
          <input id="company" name="company" autoComplete="organization" required defaultValue={v.company} className={inputClass} {...a11y("company", err.company)} />
        </Field>
        <PhoneField
          name="mobile"
          label={t.fields.mobile}
          required
          error={err.mobile}
          defaultCountry={v.mobileCountry}
          defaultNational={v.mobileNational}
        />
        <Field id="email" label={t.fields.email} required error={err.email}>
          <input id="email" name="email" type="email" autoComplete="email" required defaultValue={v.email} className={inputClass} {...a11y("email", err.email)} />
        </Field>
        <Field id="country" label={t.fields.country} required error={err.country}>
          <CountrySelect id="country" name="country" defaultValue={v.country} error={err.country} />
        </Field>
        <Field id="fleetSize" label={t.fields.fleetSize} required error={err.fleetSize}>
          <select id="fleetSize" name="fleetSize" required defaultValue={v.fleetSize ?? ""} className={inputClass} {...a11y("fleetSize", err.fleetSize)}>
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
        <select id="helpType" name="helpType" required defaultValue={v.helpType || helpDefault} className={inputClass} {...a11y("helpType", err.helpType)}>
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
            <input id="currentSystemName" name="currentSystemName" defaultValue={v.currentSystemName} className={inputClass} {...a11y("currentSystemName", err.currentSystemName)} />
          </Field>
        ) : null}
      </div>

      <Field id="message" label={t.fields.message} error={err.message}>
        <textarea id="message" name="message" rows={4} defaultValue={v.message} className={inputClass} {...a11y("message", err.message)} />
      </Field>

      <div className="grid gap-3">
        <Checkbox id="marketingConsent" name="marketingConsent" defaultChecked={v.marketingConsent === "on"}>
          {t.marketing}
        </Checkbox>
        <Checkbox id="privacyAck" name="privacyAck" required error={err.privacyAck} defaultChecked={v.privacyAck === "on"}>
          I have read the TrackStar{" "}
          <Link href="/privacy" className="font-semibold text-green-text underline underline-offset-2">
            Privacy Notice
          </Link>
          .
        </Checkbox>
      </div>

      <UtmFields />
      <Turnstile resetKey={state} />

      <div>
        <button type="submit" disabled={pending} className={submitClass}>
          {t.submit}
        </button>
      </div>
    </form>
  );
}
