import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/api/esp32",
    "/api/log",
    "/login",
    "/signup",
    "/signup/verify-email-address",
    "/verify-email-address",
    "/verify-email-address/:path*",
    "/sign-in",
    "/sign-up"
  ],
  ignoredRoutes: ["/api/esp32"]
});

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
}; 