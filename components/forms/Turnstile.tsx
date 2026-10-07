"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/**
 * Cloudflare Turnstile widget. It adds a `cf-turnstile-response` field to the
 * enclosing form; the server verifies it. Renders nothing without a site key.
 * `resetKey` changes after each submit because a token can only be used once.
 */
export function Turnstile({ resetKey }: { resetKey: unknown }) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    if (!SITE_KEY || !container.current) return;
    const api = window.turnstile;
    if (!api) return;
    widgetId.current = api.render(container.current, { sitekey: SITE_KEY, theme: "light" });
    return () => {
      if (widgetId.current) api.remove(widgetId.current);
      widgetId.current = undefined;
    };
  }, [scriptReady]);

  useEffect(() => {
    if (widgetId.current) window.turnstile?.reset(widgetId.current);
  }, [resetKey]);

  if (!SITE_KEY) return null;
  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <div ref={container} className="min-h-[65px]" />
    </>
  );
}
