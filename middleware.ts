import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const isAuthRoute = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/api/auth");
      if (isAuthRoute) return true;
      return !!token && token.role === "ADMIN";
    },
  },
});

export const config = {
  matcher: ["/((?!_next|favicon.ico|api/auth).*)"],
};
