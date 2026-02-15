"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Icon } from "@iconify/react";
import { apiService } from "@/lib/api-service";

const contactSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  title: z.string().min(1, "Title is required"),
  message: z
    .string()
    .min(1, "Message is required")
    .min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactCard() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setSubmitError(null);
    setSubmitSuccess(false);
    try {
      await apiService.sendContactInquiry({
        fullName: data.name,
        email: data.email,
        title: data.title,
        message: data.message,
      });
      reset();
      setSubmitSuccess(true);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : null;
      setSubmitError(message || "Failed to send message. Please try again.");
    }
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background aria-[invalid=true]:border-destructive";

  return (
    <div className="relative mx-auto w-full max-w-[1200px]">
      <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
        {/* Left Column - Contact info (no background, matches design) */}
        <div className="flex flex-col justify-center gap-6 p-10 sm:p-12 md:py-14 lg:p-16 lg:py-20">
          <h2 className="text-balance font-sans text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Need Help Getting Started?
          </h2>
          <a
            href="mailto:info@codepath.com"
            className="inline-flex items-center gap-3 font-sans text-base text-foreground transition-opacity hover:opacity-80"
          >
            <Icon icon="ic:outline-email" className="h-7 w-7 shrink-0 text-accent" aria-hidden />
            <span>info@codepath.com</span>
          </a>
          <a
            href="tel:+963944135246"
            className="inline-flex items-center gap-3 font-sans text-base text-foreground transition-opacity hover:opacity-80"
          >
            <Icon icon="line-md:phone" className="h-7 w-7 shrink-0 text-accent" aria-hidden />
            <span>+963944135246</span>
          </a>
          <div className="flex items-center gap-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent transition-opacity hover:opacity-80"
              aria-label="Facebook"
            >
              <Icon icon="ic:baseline-facebook" className="h-7 w-7 text-accent" aria-hidden />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent transition-opacity hover:opacity-80"
              aria-label="Instagram"
            >
              <Icon icon="mdi:instagram" className="h-7 w-7 text-accent" aria-hidden />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent transition-opacity hover:opacity-80"
              aria-label="YouTube"
            >
              <Icon icon="mdi:youtube" className="h-7 w-7 text-accent" aria-hidden />
            </a>
          </div>
        </div>

        {/* Right Column - Form (gray linear gradient to bottom via Tailwind) */}
        <div className="flex flex-col rounded-2xl bg-linear-to-b from-neutral-800/90 via-neutral-800/70 to-neutral-950/10 p-10 sm:p-12 md:py-14 md:pl-12 lg:p-16 lg:py-20 lg:pl-16">
          <h3 className="mb-6 text-center font-sans text-xl font-bold text-foreground sm:text-2xl">
            Get in touch with us
          </h3>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
            noValidate
          >
            <div>
              <input
                {...register("name")}
                type="text"
                placeholder="Name"
                className={inputClass}
                aria-invalid={!!errors.name}
              />
              <p className="mt-1 min-h-5 text-xs text-destructive">
                {errors.name?.message}
              </p>
            </div>

            <div>
              <input
                {...register("email")}
                type="email"
                placeholder="Email"
                className={inputClass}
                aria-invalid={!!errors.email}
              />
              <p className="mt-1 min-h-5 text-xs text-destructive">
                {errors.email?.message}
              </p>
            </div>

            <div>
              <input
                {...register("title")}
                type="text"
                placeholder="Title"
                className={inputClass}
                aria-invalid={!!errors.title}
              />
              <p className="mt-1 min-h-5 text-xs text-destructive">
                {errors.title?.message}
              </p>
            </div>

            <div>
              <textarea
                {...register("message")}
                placeholder="Message"
                rows={4}
                className={`${inputClass} resize-none`}
                aria-invalid={!!errors.message}
              />
              <p className="mt-1 min-h-5 text-xs text-destructive">
                {errors.message?.message}
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 w-full rounded-lg bg-primary py-3 text-center font-sans font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-70"
            >
              {isSubmitting ? "Sending..." : "Send"}
            </button>

            {(submitError || submitSuccess) && (
              <p
                className={`mt-2 min-h-5 text-xs ${submitError ? "text-destructive" : "text-strong"}`}
              >
                {submitError ||
                  "Inquiry sent successfully. We'll get back to you soon."}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
