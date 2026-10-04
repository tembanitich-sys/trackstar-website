import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Development-only: `?it=live` or `?it=prelaunch` previews the InstaTickets wording. */
export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  if (process.env.NODE_ENV !== "production") {
    const value = request.nextUrl.searchParams.get("it");
    if (value === "live" || value === "prelaunch") {
      response.cookies.set("ts_it_preview", value, { path: "/" });
    }
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|brand|.*\\..*).*)"],
};
