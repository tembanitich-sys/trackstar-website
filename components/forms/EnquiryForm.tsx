"use client";

import Link from "next/link";
import { useState } from "react";
import { getTrackStar as t } from "@/content/site";
import { Checkbox, CountrySelect, Field, inputClass, PhoneField, submitClass } from "./fields";

/**
 * Operator enquiry form. The visitor can change the preset help type.
 * Submission is wired in Phase 2; until then the button stays disabled.
 */
export function EnquiryForm({ helpDefault }: { helpDefault: string }) {
  const [current, setCurrent] = useState("none");
  const submitReady = false;

  return (
    <form className="grid gap-5" noValidate={false} onSubmit={(e) => e.preventDefault()}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="fullName" label={t.fields.fullName} required>
          <input id="fullName" name="fullName" autoComplete="name" required className={inputClass} />
        </Field>
        <Field id="company" label={t.fields.company} required>
          <input id="company" name="company" autoComplete="organization" required className={inputClass} />
        </Field>
        <PhoneField id="mobile" label={t.fields.mobile} required />
        <Field id="email" label={t.fields.email} required>
          <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
        </Field>
        <Field id="country" label={t.fields.country} required>
          <CountrySelect id="country" name="country" />
        </Field>
        <Field id="fleetSize" label={t.fields.fleetSize} required>
          <select id="fleetSize" name="fleetSize" required defaultValue="" className={inputClass}>
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

      <Field id="helpType" label={t.fields.help} required>
        <select id="helpType" name="helpType" required defaultValue={helpDefault} className={inputClass}>
          {t.helpTypes.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="currentTicketing" label={t.fields.currentTicketing}>
          <select
            id="currentTicketing"
            name="currentTicketing"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className={inputClass}
          >
            {t.currentTicketing.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        {current === "own_system" ? (
          <Field id="currentSystemName" label={t.fields.systemName}>
            <input id="currentSystemName" name="currentSystemName" className={inputClass} />
          </Field>
        ) : null}
      </div>

      <Field id="message" label={t.fields.message}>
        <textarea id="message" name="message" rows={4} className={inputClass} />
      </Field>

      <div className="grid gap-3">
        <Checkbox id="marketingConsent" name="marketingConsent">
          {t.marketing}
        </Checkbox>
        <Checkbox id="privacyAck" name="privacyAck" required>
          I have read the TrackStar{" "}
          <Link href="/privacy" className="font-semibold text-green-text underline underline-offset-2">
            Privacy Notice
          </Link>
          .
        </Checkbox>
      </div>

      <div>
        <button type="submit" disabled={!submitReady} className={submitClass}>
          {t.submit}
        </button>
      </div>
    </form>
  );
}
