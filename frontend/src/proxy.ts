import { NextResponse } from "next/server";
import type { NextAuthRequest } from "next-auth";
import { auth } from "./lib/auth/options";
import { isAllowedEmail } from "./lib/auth/allowedEmails";

const PUBLIC_CONSOLE_PATHS = ["/console/login", "/console/guest"];

const proxy = auth((request: NextAuthRequest) => {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/console")) {
    return NextResponse.next();
  }

  if (PUBLIC_CONSOLE_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const email = request.auth?.user?.email;
  if (email && isAllowedEmail(email)) {
    return NextResponse.next();
  }

  const signInUrl = new URL("/console/login", request.url);
  signInUrl.searchParams.set("callbackUrl", request.url);
  return NextResponse.redirect(signInUrl);
});

export default proxy;

export const config = {
  matcher: ["/console/:path*"],
};
