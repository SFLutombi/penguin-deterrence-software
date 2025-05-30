import { authMiddleware } from "@clerk/nextjs";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default authMiddleware({
  publicRoutes: [
    "/",
    "/api/esp32",
    "/api/serial",
    "/api/log",
    "/api/deter",
    "/test",
    "/sign-in",
    "/sign-up",
    "/api/webhook/clerk",
    "/api/webhook/stripe",
    "/api/detections",
    "/api/detections/stats",
    "/api/detections/export",
    "/api/microphones",
    "/detections",
    "/settings"
  ],
  ignoredRoutes: [
    "/((?!api|trpc))(_next.*|.+\\.[\\w]+$)",
    "/api/log"
  ]
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}; 