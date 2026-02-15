"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
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

export function ContactSection() {
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
    <section className="w-full bg-background px-4 py-16 sm:px-6 lg:px-[100px]">
      <div
        className="relative mx-auto max-w-[1200px] overflow-hidden rounded-2xl"
        style={{
          background:
            "linear-gradient(to top right, rgba(73, 45, 104, 0.7) 0%, rgba(58, 58, 60, 0.6) 100%)",
        }}
      >
        <div className="absolute left-0 top-0 bottom-0 z-2 w-[70%] pointer-events-none">
          <div className="relative h-full w-full">
            <Image
              src="/Wires.png"
              alt=""
              fill
              className="object-contain object-left opacity-70"
              priority
            />
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 gap-8 p-10 sm:p-12 md:grid-cols-2 md:gap-12 md:py-14 lg:p-16 lg:py-20">
          {/* Left Column - Text */}
          <div className="flex flex-col justify-center">
            <h2 className="text-balance font-sans text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Need Help Getting Started?
            </h2>
            <p className="mt-6 font-sans text-base leading-relaxed text-muted-foreground sm:text-lg">
              Our team is here to help you succeed. Whether you&apos;re unsure
              which assessment method to choose or have questions about your
              learning path, we&apos;ll guide you every step of the way.
            </p>
          </div>

          {/* Right Column - Form */}
          <div className="flex flex-col">
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
    </section>
  );
}
