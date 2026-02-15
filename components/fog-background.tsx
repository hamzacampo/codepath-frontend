"use client";

import Image from "next/image";

const fogMaskStyle: React.CSSProperties = {
  maskImage:
    "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 35%, rgba(0,0,0,0) 70%)",
  WebkitMaskImage:
    "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 35%, rgba(0,0,0,0) 70%)",
};

export function FogBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Layer 1 - Top center */}
      <div
        className="absolute top-[10%] left-[5%] h-[80%] w-[80%] animate-fog-drift-1"
        style={fogMaskStyle}
      >
        <Image
          src="/fog-bg.png"
          alt=""
          fill
          className="object-cover mix-blend-screen"
          priority
          sizes="80vw"
        />
      </div>

      {/* Layer 2 - Bottom right */}
      <div
        className="absolute -right-[15%] -bottom-[10%] h-[70%] w-[70%] animate-fog-drift-2"
        style={fogMaskStyle}
      >
        <Image
          src="/fog-bg.png"
          alt=""
          fill
          className="rotate-180 object-cover mix-blend-screen"
          sizes="70vw"
        />
      </div>

      {/* Layer 3 - Center */}
      {/* <div
        className="absolute top-[20%] left-[10%] h-[75%] w-[75%] animate-fog-drift-3"
        style={fogMaskStyle}
      >
        <Image
          src="/fog-bg.png"
          alt=""
          fill
          className="scale-x-[-1] object-cover mix-blend-screen"
          sizes="75vw"
        />
      </div> */}

      {/* Layer 4 - Additional bottom-left fog */}
      {/* <div
        className="absolute -bottom-[25%] -left-[20%] h-[65%] w-[65%] animate-fog-drift-2"
        style={{ ...fogMaskStyle, animationDelay: "-10s" }}
      >
        <Image
          src="/fog-bg.png"
          alt=""
          fill
          className="object-cover mix-blend-screen opacity-30"
          sizes="65vw"
        />
      </div> */}

      {/* Layer 5 - Top right additional fog */}
      {/* <div
        className="absolute -top-[15%] -right-[10%] h-[60%] w-[60%] animate-fog-drift-1"
        style={{ ...fogMaskStyle, animationDelay: "-15s" }}
      >
        <Image
          src="/fog-bg.png"
          alt=""
          fill
          className="rotate-90 object-cover mix-blend-screen opacity-25"
          sizes="60vw"
        />
      </div> */}
    </div>
  );
}
