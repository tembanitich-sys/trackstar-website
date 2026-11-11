"use client";

import { useEffect, useRef } from "react";

const KEYS = ["utm_source", "utm_medium", "utm_campaign"] as const;
const STORAGE_KEY = "trackstar_utm";

function read(): Record<string, string> {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

/** Remembers utm_* parameters from the landing URL for the rest of the visit. Renders nothing. */
export function UtmCapture() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const found = Object.fromEntries(KEYS.flatMap((k) => (params.get(k) ? [[k, params.get(k)!.slice(0, 100)]] : [])));
      if (Object.keys(found).length) sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...read(), ...found }));
    } catch {
      // Storage can be unavailable (private mode); attribution is optional.
    }
  }, []);
  return null;
}

/** Hidden inputs filled from the remembered utm_* values when the form mounts. */
export function UtmFields() {
  const root = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const stored = read();
    root.current?.querySelectorAll<HTMLInputElement>("input").forEach((input) => {
      input.value = stored[input.dataset.key ?? ""] ?? "";
    });
  }, []);
  return (
    <span ref={root} hidden>
      <input type="hidden" name="utmSource" data-key="utm_source" />
      <input type="hidden" name="utmMedium" data-key="utm_medium" />
      <input type="hidden" name="utmCampaign" data-key="utm_campaign" />
    </span>
  );
}
