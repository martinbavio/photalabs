"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useAuth } from "@/features/auth";
import { Logo } from "@/features/layout/components/Logo";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";

// Curated Pexels images showcasing creative/artistic photography
const showcaseImages = [
  {
    thumb: "https://images.pexels.com/photos/3844788/pexels-photo-3844788.jpeg?auto=compress&cs=tinysrgb&w=400",
    full: "https://images.pexels.com/photos/3844788/pexels-photo-3844788.jpeg?auto=compress&cs=tinysrgb&w=1920",
    alt: "Abstract colorful art",
  },
  {
    thumb: "https://images.pexels.com/photos/2693212/pexels-photo-2693212.png?auto=compress&cs=tinysrgb&w=400",
    full: "https://images.pexels.com/photos/2693212/pexels-photo-2693212.png?auto=compress&cs=tinysrgb&w=1920",
    alt: "Neon portrait",
  },
  {
    thumb: "https://images.pexels.com/photos/2832382/pexels-photo-2832382.jpeg?auto=compress&cs=tinysrgb&w=400",
    full: "https://images.pexels.com/photos/2832382/pexels-photo-2832382.jpeg?auto=compress&cs=tinysrgb&w=1920",
    alt: "Surreal landscape",
  },
  {
    thumb: "https://images.pexels.com/photos/1279813/pexels-photo-1279813.jpeg?auto=compress&cs=tinysrgb&w=400",
    full: "https://images.pexels.com/photos/1279813/pexels-photo-1279813.jpeg?auto=compress&cs=tinysrgb&w=1920",
    alt: "Creative portrait",
  },
  {
    thumb: "https://images.pexels.com/photos/2832034/pexels-photo-2832034.jpeg?auto=compress&cs=tinysrgb&w=400",
    full: "https://images.pexels.com/photos/2832034/pexels-photo-2832034.jpeg?auto=compress&cs=tinysrgb&w=1920",
    alt: "Artistic nature",
  },
  {
    thumb: "https://images.pexels.com/photos/3617500/pexels-photo-3617500.jpeg?auto=compress&cs=tinysrgb&w=400",
    full: "https://images.pexels.com/photos/3617500/pexels-photo-3617500.jpeg?auto=compress&cs=tinysrgb&w=1920",
    alt: "Digital art style",
  },
  {
    thumb: "https://images.pexels.com/photos/2911521/pexels-photo-2911521.jpeg?auto=compress&cs=tinysrgb&w=400",
    full: "https://images.pexels.com/photos/2911521/pexels-photo-2911521.jpeg?auto=compress&cs=tinysrgb&w=1920",
    alt: "Dramatic clouds",
  },
];

type Step = "signIn" | "linkSent";

export default function LoginPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { signIn } = useAuthActions();
  const router = useRouter();

  const [step, setStep] = useState<Step>("signIn");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/create");
    }
  }, [isAuthenticated, router]);

  // Preload all full-size images
  useEffect(() => {
    let loadedCount = 0;
    showcaseImages.forEach((image) => {
      const img = new window.Image();
      img.src = image.full;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === showcaseImages.length) {
          setImagesLoaded(true);
        }
      };
    });
    // Also trigger loaded state after first image loads for faster initial render
    const firstImg = new window.Image();
    firstImg.src = showcaseImages[0].full;
    firstImg.onload = () => setImagesLoaded(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (process.env.NEXT_PUBLIC_E2E === "1") {
        setStep("linkSent");
        return;
      }
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

  const handleImageSelect = (index: number) => {
    if (index === activeImageIndex || isTransitioning) return;
    setIsTransitioning(true);
    setActiveImageIndex(index);
    // Reset transition state after animation completes
    setTimeout(() => setIsTransitioning(false), 700);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="w-8 h-8 border-2 border-accent-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-bg-primary">
      {/* Background Images - Stacked with crossfade */}
      <div className="absolute inset-0">
        {showcaseImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === activeImageIndex && imagesLoaded ? "opacity-100" : "opacity-0"
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
              style={{
                backgroundImage: `url(${image.full})`,
              }}
            />
          </div>
        ))}
        {/* Gradient overlays for depth and readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
      </div>

      {/* Animated grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Logo - Top Left */}
      <div
        className={`absolute top-6 left-6 z-20 transition-all duration-700 delay-300 ${imagesLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
      >
        <Logo size="md" showText={false} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-24">
        {/* Hero Text */}
        <div
          className={`text-center mb-8 transition-all duration-700 delay-500 ${imagesLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight"
            style={{
              textShadow: "0 4px 30px rgba(0,0,0,0.5), 0 2px 10px rgba(0,0,0,0.3)",
              fontFamily: "var(--font-heading)",
            }}
          >
            {step === "linkSent" ? "Check your email" : "Create with AI"}
          </h1>
          <p
            className="text-lg md:text-xl text-white/80 max-w-md mx-auto"
            style={{
              textShadow: "0 2px 10px rgba(0,0,0,0.5)",
            }}
          >
            {step === "linkSent"
              ? `We sent a sign-in link to ${email}`
              : "Transform your ideas into stunning visuals"}
          </p>
        </div>

        {/* Form Card - Glassmorphic */}
        <div
          className={`w-full max-w-md transition-all duration-700 delay-700 ${imagesLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div
            className="relative p-6 md:p-8 rounded-2xl overflow-hidden"
            style={{
              background: "rgba(11, 11, 14, 0.7)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow:
                "0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
            }}
          >
            {/* Subtle glow effect */}
            <div
              className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20 blur-3xl pointer-events-none"
              style={{ background: "var(--color-accent-yellow)" }}
            />

            {step === "linkSent" ? (
              <div className="text-center relative z-10">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent-yellow/10 flex items-center justify-center border border-accent-yellow/20">
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
                <p className="text-text-muted mb-6">
                  Click the link in your email to sign in
                </p>
                <button
                  onClick={() => setStep("signIn")}
                  className="text-sm text-accent-yellow hover:text-accent-yellow/80 transition-colors"
                >
                  Use a different email
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  error={error ?? undefined}
                  className="bg-white/5 border-white/10 focus:border-accent-yellow/50"
                />
                <Button
                  type="submit"
                  className="w-full group"
                  size="lg"
                  isLoading={isLoading}
                >
                  <span className="flex items-center gap-2">
                    {isLoading ? (
                      "Sending..."
                    ) : (
                      <>
                        Get started
                        <svg
                          className="w-4 h-4 transition-transform group-hover:translate-x-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </>
                    )}
                  </span>
                </Button>
                <p className="text-center text-xs text-text-muted pt-2">
                  By continuing, you agree to our Terms and Privacy Policy
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Image Gallery - Bottom */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-20 transition-all duration-700 delay-1000 ${imagesLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        {/* Gradient fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

        <div className="relative px-4 pb-6 pt-16">
          {/* Image Grid */}
          <div className="flex justify-center gap-3">
            {showcaseImages.map((image, index) => (
              <button
                key={index}
                onClick={() => handleImageSelect(index)}
                className={`flex-shrink-0 group cursor-pointer transition-all duration-300 ${
                  index === activeImageIndex ? "scale-105" : "hover:scale-105"
                }`}
                aria-label={`Select ${image.alt} as background`}
              >
                <div
                  className={`relative w-24 h-16 sm:w-32 sm:h-20 md:w-36 md:h-24 rounded-xl overflow-hidden transition-all duration-300 ${
                    index === activeImageIndex
                      ? "ring-2 ring-accent-yellow ring-offset-2 ring-offset-black/50"
                      : ""
                  }`}
                  style={{
                    boxShadow: index === activeImageIndex
                      ? "0 8px 30px rgba(232, 231, 0, 0.3)"
                      : "0 8px 30px rgba(0,0,0,0.4)",
                  }}
                >
                  <img
                    src={image.thumb}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div
                    className={`absolute inset-0 transition-colors duration-300 ${
                      index === activeImageIndex
                        ? "bg-transparent"
                        : "bg-black/30 group-hover:bg-black/10"
                    }`}
                  />
                  <div className={`absolute inset-0 rounded-xl transition-colors duration-300 ${
                    index === activeImageIndex
                      ? "border-2 border-accent-yellow/50"
                      : "border border-white/10"
                  }`} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
