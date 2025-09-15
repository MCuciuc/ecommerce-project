import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Public routes should bypass auth redirect to avoid loops on sign-in/sign-up
const isPublicRoute = createRouteMatcher([
  "/api/:path*",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sso-callback(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes immediately. For API, also strip cookies to prevent 431s.
  if (isPublicRoute(req)) {
    if (req.nextUrl.pathname.startsWith("/api")) {
      const headers = new Headers(req.headers);
      headers.delete("cookie");
      return NextResponse.next({ request: { headers } });
    }
    return NextResponse.next();
  }

  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/(api|trpc)(.*)"],
};