"use server";

import { requestDeps } from "@/lib/enquiries/deps";
import { processContactEnquiry, processOperatorEnquiry } from "@/lib/enquiries/process";
import type { FormState } from "@/lib/enquiries/types";

const FAILED: FormState = {
  status: "error",
  message: "Sorry, something went wrong and your request was not sent. Please try again, or email info@trackstar.co.zw.",
};

export async function submitOperatorEnquiry(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    return await processOperatorEnquiry(formData, await requestDeps());
  } catch (error) {
    console.error("operator enquiry: unexpected failure", error instanceof Error ? error.message : error);
    return FAILED;
  }
}

export async function submitContactEnquiry(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    return await processContactEnquiry(formData, await requestDeps());
  } catch (error) {
    console.error("contact enquiry: unexpected failure", error instanceof Error ? error.message : error);
    return FAILED;
  }
}
