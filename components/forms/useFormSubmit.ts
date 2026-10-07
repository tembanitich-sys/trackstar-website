"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { idleState, postForm } from "@/lib/submit";
import type { FormState } from "@/lib/submit";

/**
 * Submits a form as JSON to a PHP endpoint. Typed input stays in the form on errors,
 * the button is disabled while sending, and focus moves to the first problem.
 */
export function useFormSubmit(endpoint: string) {
  const [state, setState] = useState<FormState>(idleState);
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    setPending(true);
    setState(await postForm(endpoint, data));
    setPending(false);
  }

  useEffect(() => {
    if (state.status !== "error") return;
    const target =
      formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]") ??
      formRef.current?.querySelector<HTMLElement>("[data-form-message]");
    target?.focus();
  }, [state]);

  return { state, pending, onSubmit, formRef };
}
