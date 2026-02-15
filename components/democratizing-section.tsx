"use client";

import Image from "next/image";

export function DemocratizingSection() {
  return (
    <section className="relative z-10 px-6 py-16 md:py-24 lg:px-[100px]">
      <div className="mx-auto flex max-w-5xl flex-col-reverse items-center gap-8 md:flex-row md:items-start md:gap-12">
        <div className="relative h-64 w-52 shrink-0 md:h-72 md:w-56 animate-balloon-float">
          <Image
            src="/Balloon.png"
            alt="A purple balloon symbolizing accessibility and reaching new heights"
            fill
            className="rounded-lg object-contain"
            sizes="(max-width: 768px) 208px, 224px"
          />
        </div>
        <div className="flex-1">
          <h3 className="mb-4 font-sans text-2xl font-bold text-foreground md:text-3xl">
            Democratizing Competitive Programming Education
          </h3>
          <p className="max-w-md font-sans text-sm leading-relaxed text-foreground md:text-base">
            We&apos;re on a mission to make world-class competitive programming
            training accessible to everyone, regardless of their background or
            starting point. Through intelligent technology and personalized
            coaching, we&apos;re breaking down barriers to help students
            worldwide reach their full potential in programming competitions and
            beyond.
          </p>
        </div>
      </div>
    </section>
  );
}
