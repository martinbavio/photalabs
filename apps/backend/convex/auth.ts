import Resend from "@auth/core/providers/resend";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Resend({
      from: "Photalabs <noreply@photalabs.com>",
      sendVerificationRequest: async ({ identifier: email, url, provider }) => {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.AUTH_RESEND_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: provider.from,
            to: email,
            subject: "Sign in to Photalabs",
            html: `<p>Click the link below to sign in:</p><p><a href="${url}">Sign in to Photalabs</a></p>`,
            text: `Sign in to Photalabs: ${url}`,
          }),
        });

        if (!res.ok) {
          throw new Error(`Resend error: ${await res.text()}`);
        }
      },
    }),
  ],
});
