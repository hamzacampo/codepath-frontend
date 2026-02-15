"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import NeuralCircuit from "@/components/neural-circuit";
import { useAuth } from "@/hooks/use-auth";

/* Theme: primary #572BAE, accent #8465C2, background #000 - from globals.css */
export default function HeroSection() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-background">
      {/* Background radial gradient overlay (primary) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 55% 50%, rgba(87, 43, 174, 0.08) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Subtle grid pattern (accent) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(132, 101, 194, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(132, 101, 194, 0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
        aria-hidden="true"
      />

      <div className="pointer-events-none absolute inset-0">
        <NeuralCircuit />
      </div>

      {/* Ambient glow spots (primary / accent) */}
      <div
        className="pointer-events-none absolute left-1/4 top-1/3 h-64 w-64 rounded-full opacity-20 blur-3xl"
        style={{ background: "rgba(87, 43, 174, 0.3)" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-1/4 right-1/3 h-48 w-48 rounded-full opacity-15 blur-3xl"
        style={{ background: "rgba(132, 101, 194, 0.2)" }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex w-full flex-col items-start justify-between gap-10 px-4 pt-6 pb-6 lg:flex-row lg:items-center lg:gap-8 lg:px-[100px] lg:pt-12 lg:pb-[100px]">
        <div className="max-w-2xl">
          <p className="mb-4 font-sans text-base tracking-wide text-accent-foreground/85 lg:text-lg">
            Get personalized training, master algorithms, and dominate contests
          </p>

          <h1 className="text-balance font-sans text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Stop Guessing What to Practice{" "}
            <span className="text-primary">Next</span>
          </h1>
        </div>

        <div className="shrink-0 self-start lg:self-auto">
          <Link
            href={isAuthenticated ? "/dashboard" : "/auth/register"}
            className="group inline-flex items-center gap-3 rounded-xl bg-primary px-8 py-4 font-sans text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:text-lg"
          >
            {isAuthenticated ? "Go to dashboard" : "Start your journey"}
            <Icon icon="mdi:thunder" className="h-5 w-5 transition-transform group-hover:scale-110" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
