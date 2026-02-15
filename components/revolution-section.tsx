"use client";

import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { useAuth } from "@/hooks/use-auth";

const FLARE_IMAGE = "/flare.png";

export function RevolutionSection() {
  const { isAuthenticated } = useAuth();

  return (
    <section
      className="relative flex min-h-[70vh] w-full flex-col items-center justify-center overflow-hidden px-4 py-32 text-center md:px-8 md:py-40 lg:px-[100px] lg:py-48"
      style={{
        boxShadow:
          "inset 0 24px 48px -24px rgba(0,0,0,0.2), inset 0 -24px 48px -24px rgba(0,0,0,0.2), 0 0 100px -25px rgba(0,0,0,0.25)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <div
          className="absolute bottom-0 left-1/2 h-[400px] w-full min-w-[800px] -translate-x-1/2 rounded-full opacity-25 blur-[100px]"
          style={{
            background:
              "radial-gradient(ellipse, rgba(87, 43, 174, 0.85), transparent 70%)",
          }}
        />
      </div>

      {/* Flare overlay - semi-transparent so fog passes through */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
        style={{ filter: "brightness(1.1) contrast(1.05)" }}
      >
        <div className="absolute left-1/2 top-1/2 h-full w-[140%] max-w-none -translate-x-1/2 -translate-y-1/2 mix-blend-screen" style={{ animation: "light-sweep 6s ease-in-out infinite" }}>
          <div className="relative block h-full w-full">
            <Image src={FLARE_IMAGE} alt="" fill className="object-cover" sizes="100vw" />
          </div>
        </div>
        <div className="absolute left-1/2 top-1/2 h-full w-[120%] max-w-none -translate-x-1/2 -translate-y-1/2 mix-blend-screen" style={{ animation: "glow-pulse 4s ease-in-out infinite" }}>
          <div className="relative block h-full w-full">
            <Image src={FLARE_IMAGE} alt="" fill className="object-cover" sizes="100vw" />
          </div>
        </div>
        <div className="absolute left-1/2 top-[60%] h-[80%] w-[160%] max-w-none -translate-x-1/2 -translate-y-1/2 mix-blend-screen blur-sm" style={{ animation: "flare-drift 8s ease-in-out infinite" }}>
          <div className="relative block h-full w-full">
            <Image src={FLARE_IMAGE} alt="" fill className="object-cover" sizes="100vw" />
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <h2 className="font-sans text-2xl font-bold tracking-tight text-foreground text-balance md:text-3xl lg:text-4xl">
          Be Part of the Programming Revolution
        </h2>
        <p className="mx-auto mt-4 max-w-xl font-sans text-base leading-relaxed text-muted-foreground md:text-lg">
          Whether you&apos;re just starting your programming journey or aiming for
          ICPC glory, we&apos;re here to support you every step of the way.
          Together, we&apos;re building a future where every programmer has access
          to personalized, effective training.
        </p>
        <Link
          href={isAuthenticated ? "/dashboard" : "/auth/register"}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 font-sans text-base font-medium text-primary-foreground transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Join
          <Icon icon="codicon:robot" className="h-5 w-5" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
