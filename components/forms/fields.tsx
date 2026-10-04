import type { ReactNode } from "react";
import { countryOptions, DEFAULT_COUNTRY } from "@/lib/countries";

export const inputClass =
  "block min-h-12 w-full rounded-lg border border-border bg-white px-3 py-2 text-base text-ink transition-colors duration-150 placeholder:text-muted focus:border-navy";

export function Field({
  id,
  label,
  required,
  hint,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
        {required ? (
          <span aria-hidden="true" className="text-green-text">
            {" "}
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint ? <p className="mt-1 text-sm text-muted">{hint}</p> : null}
    </div>
  );
}

export function CountrySelect({ id, name }: { id: string; name: string }) {
  return (
    <select id={id} name={name} defaultValue={DEFAULT_COUNTRY} required className={inputClass}>
      {countryOptions.map((c) => (
        <option key={c.code} value={c.code}>
          {c.name}
        </option>
      ))}
    </select>
  );
}

export function PhoneField({ id, label, required }: { id: string; label: string; required?: boolean }) {
  return (
    <Field id={`${id}-national`} label={label} required={required}>
      <div className="flex gap-2">
        <select
          id={`${id}-country`}
          name={`${id}Country`}
          aria-label="Country calling code"
          defaultValue={DEFAULT_COUNTRY}
          className={`${inputClass} w-32 shrink-0`}
        >
          {countryOptions.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} {c.dial}
            </option>
          ))}
        </select>
        <input
          id={`${id}-national`}
          name={`${id}National`}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          required={required}
          className={inputClass}
        />
      </div>
    </Field>
  );
}

export function Checkbox({
  id,
  name,
  required,
  children,
}: {
  id: string;
  name: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        name={name}
        type="checkbox"
        required={required}
        className="mt-1 size-6 shrink-0 rounded border-border accent-green-text"
      />
      <label htmlFor={id} className="text-base text-ink">
        {children}
      </label>
    </div>
  );
}

export const submitClass =
  "inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-green-text px-6 py-3 font-heading text-sm font-bold tracking-wide text-white transition-colors duration-150 hover:bg-navy disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto";
