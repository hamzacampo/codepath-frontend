"use client";

import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { useAuth } from "@/hooks/use-auth";

const FLARE_IMAGE = "/flare.png";

export function CtaSection() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative flex min-h-[70vh] w-full flex-col items-center justify-center overflow-hidden bg-background px-4 py-32 text-center md:px-8 md:py-40 lg:px-[100px] lg:py-48">
      {/* Ambient glow - theme primary */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <div
          className="absolute bottom-0 left-1/2 h-[400px] w-full min-w-[800px] -translate-x-1/2 rounded-full opacity-45 blur-[100px]"
          style={{
            background:
              "radial-gradient(ellipse, rgba(87, 43, 174, 0.85), transparent 70%)",
          }}
        />
      </div>

      {/* Flare overlay - home page only */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
        style={{ filter: "brightness(1.15) contrast(1.05)" }}
      >
        <div className="absolute left-1/2 top-1/2 h-full w-[140%] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-90 mix-blend-screen" style={{ animation: "light-sweep 6s ease-in-out infinite" }}>
          <div className="relative block h-full w-full">
            <Image src={FLARE_IMAGE} alt="" fill className="object-cover" sizes="100vw" />
          </div>
        </div>
        <div className="absolute left-1/2 top-1/2 h-full w-[120%] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-65 mix-blend-screen" style={{ animation: "glow-pulse 4s ease-in-out infinite" }}>
          <div className="relative block h-full w-full">
            <Image src={FLARE_IMAGE} alt="" fill className="object-cover" sizes="100vw" />
          </div>
        </div>
        <div className="absolute left-1/2 top-[60%] h-[80%] w-[160%] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-75 mix-blend-screen blur-sm" style={{ animation: "flare-drift 8s ease-in-out infinite" }}>
          <div className="relative block h-full w-full">
            <Image src={FLARE_IMAGE} alt="" fill className="object-cover" sizes="100vw" />
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <h2 className="font-sans text-2xl font-bold tracking-tight text-foreground text-balance md:text-3xl lg:text-4xl">
          Ready to Transform Your Competitive Programming Skills?
        </h2>
        <p className="mx-auto mt-4 max-w-xl font-sans text-base leading-relaxed text-muted-foreground md:text-lg">
          Join thousands of students already accelerating their learning with
          personalized AI
        </p>
        <Link
          href={isAuthenticated ? "/dashboard" : "/auth/register"}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 font-sans text-base font-medium text-primary-foreground transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {isAuthenticated ? "Go to dashboard" : "Join"}
          <Icon icon="mdi:robot-outline" className="h-5 w-5" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
