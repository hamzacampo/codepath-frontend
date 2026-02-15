import Image from "next/image";
import { ContactCard } from "@/components/contact-card";

export default function ContactPage() {
  return (
    <div className="relative min-h-screen w-full">
      {/* Full-page background - connected nodes */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/connected-nodes.png"
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>

      {/* Get in touch card - centered */}
      <section className="relative z-10 flex min-h-screen w-full items-center justify-center px-4 py-16 sm:px-6 lg:px-[100px]">
        <ContactCard />
      </section>
    </div>
  );
}
