import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isAuthPage = createRouteMatcher(["/"]);
const isProtectedRoute = createRouteMatcher(["/create", "/history", "/characters"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  if (process.env.NEXT_PUBLIC_E2E === "1") {
    if (isProtectedRoute(request)) {
      return nextjsMiddlewareRedirect(request, "/");
    }
    return;
  }

  const isAuthenticated = await convexAuth.isAuthenticated();

  // Redirect authenticated users away from auth page
  if (isAuthPage(request) && isAuthenticated) {
    return nextjsMiddlewareRedirect(request, "/create");
  }

  // Redirect unauthenticated users to login
  if (isProtectedRoute(request) && !isAuthenticated) {
    return nextjsMiddlewareRedirect(request, "/");
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
