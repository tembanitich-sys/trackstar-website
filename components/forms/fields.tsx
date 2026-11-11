import type { ReactNode } from "react";
import { countryOptions, DEFAULT_COUNTRY } from "@/lib/countries";

export const inputClass =
  "block min-h-12 w-full rounded-lg border border-border bg-white px-3 py-2 text-base text-ink transition-colors duration-150 placeholder:text-muted focus:border-navy aria-[invalid=true]:border-error";

/** Props that tie an input to its error message. */
export function a11y(id: string, error?: string) {
  return error ? { "aria-invalid": true as const, "aria-describedby": `${id}-error` } : {};
}

export function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={`${id}-error`} role="alert" className="mt-1 text-sm font-semibold text-error">
      {error}
    </p>
  );
}

export function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-heading text-sm font-semibold text-ink">
        {label}
        {required ? (
          <span aria-hidden="true" className="text-green-text">
            {" "}
            *
          </span>
        ) : null}
      </label>
      {children}
      <FieldError id={id} error={error} />
    </div>
  );
}

export function CountrySelect({
  id,
  name,
  defaultValue,
  error,
}: {
  id: string;
  name: string;
  defaultValue?: string;
  error?: string;
}) {
  return (
    <select
      id={id}
      name={name}
      defaultValue={defaultValue || DEFAULT_COUNTRY}
      required
      className={inputClass}
      {...a11y(id, error)}
    >
      {countryOptions.map((c) => (
        <option key={c.code} value={c.code}>
          {c.name}
        </option>
      ))}
    </select>
  );
}

/** Country calling code selector (default Zimbabwe, +263) beside the national number. */
export function PhoneField({
  name,
  label,
  required,
  error,
  defaultCountry,
  defaultNational,
}: {
  /** Field prefix: submits `${name}Country` and `${name}National`. */
  name: string;
  label: string;
  required?: boolean;
  error?: string;
  defaultCountry?: string;
  defaultNational?: string;
}) {
  const id = `${name}-national`;
  return (
    <Field id={id} label={label} required={required} error={error}>
      <div className="flex gap-2">
        <select
          id={`${name}-country`}
          name={`${name}Country`}
          aria-label="Country calling code"
          defaultValue={defaultCountry || DEFAULT_COUNTRY}
          className={`${inputClass} w-32 shrink-0`}
        >
          {countryOptions.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} {c.dial}
            </option>
          ))}
        </select>
        <input
          id={id}
          name={`${name}National`}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          required={required}
          defaultValue={defaultNational}
          className={inputClass}
          {...a11y(id, error)}
        />
      </div>
    </Field>
  );
}

export function Checkbox({
  id,
  name,
  required,
  error,
  defaultChecked,
  children,
}: {
  id: string;
  name: string;
  required?: boolean;
  error?: string;
  defaultChecked?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          id={id}
          name={name}
          type="checkbox"
          required={required}
          defaultChecked={defaultChecked}
          className="mt-1 size-6 shrink-0 rounded border-border accent-green-text"
          {...a11y(id, error)}
        />
        <label htmlFor={id} className="text-base text-ink">
          {children}
        </label>
      </div>
      <FieldError id={id} error={error} />
    </div>
  );
}

export function FormMessage({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      tabIndex={-1}
      data-form-message
      className="rounded-lg border border-error bg-error-bg p-3 text-base font-semibold text-error"
    >
      {message}
    </p>
  );
}

export function SuccessPanel({ title, body }: { title: string; body?: string }) {
  return (
    <div role="status" className="rounded-xl border border-green-text bg-neutral-bg p-6">
      <p className="font-heading text-2xl font-extrabold text-navy">{title}</p>
      {body ? <p className="mt-3 text-base text-ink">{body}</p> : null}
    </div>
  );
}

export const submitClass =
  "inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-green-text px-6 py-3 font-heading text-sm font-bold tracking-wide text-white transition-colors duration-150 hover:bg-navy disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto";
