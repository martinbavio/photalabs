"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";

type Step = "signIn" | "linkSent";

export function LoginForm() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<Step>("signIn");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set("email", email);
      await signIn("resend", formData);
      setStep("linkSent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send magic link");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "linkSent") {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-yellow/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-accent-yellow"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-text-primary font-[family-name:var(--font-heading)]">
            Check your email
          </h2>
          <p className="mt-2 text-text-muted">
            We sent a sign-in link to{" "}
            <span className="text-text-primary font-medium">{email}</span>
          </p>
        </div>
        <button
          onClick={() => setStep("signIn")}
          className="text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold text-text-primary font-[family-name:var(--font-heading)]">
          Welcome to PhotaLabs
        </h1>
        <p className="mt-2 text-text-muted">
          Enter your email to sign in or create an account
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          error={error ?? undefined}
        />
        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}
        >
          {isLoading ? "Sending link..." : "Send magic link"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-text-muted">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
