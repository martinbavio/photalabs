"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoginForm, useAuth } from "@/features/auth";
import { Logo } from "@/features/layout/components/Logo";

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/create");
    }
  }, [isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="mb-8">
        <Logo size="lg" />
      </div>
      <LoginForm />
    </main>
  );
}
