"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CONTACT_EMAIL } from "@/lib/contact-constants";
import { Loader2, Send } from "lucide-react";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name"),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().optional(),
  topic: z.string().min(1, "Choose a topic"),
  message: z
    .string()
    .trim()
    .min(10, "Message should be at least 10 characters")
    .max(1500, "Message is too long (max 1500 characters)"),
});

type FormState = {
  name: string;
  email: string;
  phone: string;
  topic: string;
  message: string;
};

const initial: FormState = {
  name: "",
  email: "",
  phone: "",
  topic: "general",
  message: "",
};

const fieldClass =
  "w-full rounded-xl border border-black/[0.12] bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-black/35 " +
  "hover:border-black/20 focus:border-black/35 focus:ring-2 focus:ring-black/[0.06]";

const topics = [
  { value: "general", label: "General question" },
  { value: "order", label: "Order status or tracking" },
  { value: "returns", label: "Returns or exchanges" },
  { value: "payment", label: "Payment or billing" },
  { value: "other", label: "Something else" },
] as const;

export function ContactForm() {
  const [values, setValues] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sentHint, setSentHint] = useState(false);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleBlur(key: keyof FormState) {
    setTouched((t) => ({ ...t, [key]: true }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSentHint(false);
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const flat: Partial<Record<keyof FormState, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormState | undefined;
        if (key && !flat[key]) flat[key] = issue.message;
      }
      setErrors(flat);
      setTouched({ name: true, email: true, topic: true, message: true });
      return;
    }

    setSubmitting(true);
    const { name, email, phone, topic, message } = parsed.data;
    const topicLabel = topics.find((t) => t.value === topic)?.label ?? topic;
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || "—"}`,
      `Topic: ${topicLabel}`,
      "",
      message,
    ].join("\n");

    const subject = `[SRX Contact] ${topicLabel}`;
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    await new Promise((r) => setTimeout(r, 280));
    window.location.href = mailto;
    setSubmitting(false);
    setSentHint(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="contact-name" className="text-xs font-medium uppercase tracking-wide text-black/50">
            Name <span className="text-red-600">*</span>
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(e) => setField("name", e.target.value)}
            onBlur={() => handleBlur("name")}
            className={cn(fieldClass, touched.name && errors.name && "border-red-400/80 focus:ring-red-100")}
            placeholder="Your full name"
          />
          {touched.name && errors.name ? (
            <p className="text-xs text-red-600" role="alert">
              {errors.name}
            </p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <label htmlFor="contact-email" className="text-xs font-medium uppercase tracking-wide text-black/50">
            Email <span className="text-red-600">*</span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => setField("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            className={cn(fieldClass, touched.email && errors.email && "border-red-400/80 focus:ring-red-100")}
            placeholder="you@example.com"
          />
          {touched.email && errors.email ? (
            <p className="text-xs text-red-600" role="alert">
              {errors.email}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="contact-phone" className="text-xs font-medium uppercase tracking-wide text-black/50">
            Phone <span className="text-black/30">(optional)</span>
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(e) => setField("phone", e.target.value)}
            className={fieldClass}
            placeholder="+1 (555) 000-0000"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="contact-topic" className="text-xs font-medium uppercase tracking-wide text-black/50">
            Topic <span className="text-red-600">*</span>
          </label>
          <select
            id="contact-topic"
            name="topic"
            value={values.topic}
            onChange={(e) => setField("topic", e.target.value)}
            onBlur={() => handleBlur("topic")}
            className={cn(
              fieldClass,
              "cursor-pointer appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10",
              touched.topic && errors.topic && "border-red-400/80"
            )}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
            }}
          >
            {topics.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          {touched.topic && errors.topic ? (
            <p className="text-xs text-red-600" role="alert">
              {errors.topic}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="contact-message" className="text-xs font-medium uppercase tracking-wide text-black/50">
          Message <span className="text-red-600">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          value={values.message}
          onChange={(e) => setField("message", e.target.value)}
          onBlur={() => handleBlur("message")}
          maxLength={1500}
          className={cn(
            fieldClass,
            "min-h-[140px] resize-y py-3 leading-relaxed",
            touched.message && errors.message && "border-red-400/80 focus:ring-red-100"
          )}
          placeholder="How can we help? Include your order number if it applies."
        />
        <div className="flex justify-between gap-2">
          {touched.message && errors.message ? (
            <p className="text-xs text-red-600" role="alert">
              {errors.message}
            </p>
          ) : (
            <span />
          )}
          <span className="text-xs text-black/40">{values.message.length}/1500</span>
        </div>
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="inline-flex h-12 w-full items-center justify-center rounded-full bg-black text-base font-medium text-white hover:bg-black/90 sm:w-auto sm:min-w-[200px]"
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            Opening email…
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" aria-hidden />
            Send message
          </>
        )}
      </Button>

      <p className="text-xs leading-relaxed text-black/45">
        Submitting opens your email app with this message addressed to{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-black underline underline-offset-2">
          {CONTACT_EMAIL}
        </a>
        . Send the draft from there — no data is stored on our servers from this form.
      </p>

      {sentHint ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          If your mail program did not open, copy our address above or email{" "}
          <a className="font-semibold underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>{" "}
          manually.
        </p>
      ) : null}
    </form>
  );
}
