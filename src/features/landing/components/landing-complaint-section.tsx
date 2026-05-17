"use client";

import * as React from "react";
import { AlertCircle, Send } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/components/providers/auth-provider";
import { submitPublicComplaint } from "@/services/public-complaint.service";
import type { PublicComplaintCategory } from "@/services/public-complaint.service";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollReveal } from "@/features/landing/components/scroll-reveal";

const CATEGORIES: { value: PublicComplaintCategory; label: string }[] = [
  { value: "billing", label: "Billing & subscription" },
  { value: "technical", label: "Technical issue" },
  { value: "account", label: "Account & workspace" },
  { value: "abuse", label: "Abuse or safety" },
  { value: "other", label: "Other" },
];

export function LandingComplaintSection() {
  const { user } = useAuth();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [category, setCategory] = React.useState<PublicComplaintCategory>("other");
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    if (user?.email) {
      setEmail((e) => (e.trim() === "" ? user.email : e));
    }
    if (user?.name?.trim()) {
      setName((n) => (n.trim() === "" ? user.name!.trim() : n));
    }
  }, [user?.email, user?.name]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      await submitPublicComplaint({
        email: email.trim(),
        name: name.trim() || undefined,
        category,
        subject: subject.trim(),
        message: message.trim(),
      });
      toast.success("Complaint received", {
        description: "Thank you—we logged your message and will review it.",
      });
      setSubject("");
      setMessage("");
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not submit. Try again later.";
      toast.error("Submission failed", { description: msg });
    } finally {
      setPending(false);
    }
  }

  return (
    <section
      id="complaints"
      className="scroll-mt-24 py-20 bg-gradient-to-r from-violet-800/05 via-fuchsia-300/20 dark:via-fuchsia-900/35 to-blue-800/05"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/50 dark:text-amber-100">
            <AlertCircle className="size-3.5" />
            Complaints
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Tell us what went wrong
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-300">
            Submit billing disputes, technical problems, safety concerns, or general feedback. Your
            message is logged securely on our servers—no account required, but signing in pre-fills your
            email.
          </p>
        </ScrollReveal>

        <ScrollReveal delayMs={80} className="mx-auto mt-12 max-w-2xl">
          <form
            onSubmit={(e) => void onSubmit(e)}
            className="rounded-xl border border-slate-200/80 bg-white/90 p-6 shadow-lg shadow-violet-500/5 backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/70 sm:p-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="complaint-name">Name (optional)</Label>
                <Input
                  id="complaint-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={120}
                  autoComplete="name"
                  className="rounded-md h-10"
                  placeholder="Jane Doe"
                />
              </div>
              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="complaint-email">Email</Label>
                <Input
                  id="complaint-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={320}
                  autoComplete="email"
                  className="rounded-md h-10"
                  placeholder="you@company.com"
                />
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <Label htmlFor="complaint-category">Category</Label>
              <select
                id="complaint-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as PublicComplaintCategory)}
                className="flex h-10 w-full rounded-md border border-input bg-background dark:bg-violate-800 dark:text-white px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value} className="dark:bg-[#08071d] dark:text-white">
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-5 space-y-2">
              <Label htmlFor="complaint-subject">Subject</Label>
              <Input
                id="complaint-subject"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                minLength={3}
                maxLength={200}
                className="rounded-md h-10"
                placeholder="Short summary"
              />
            </div>
            <div className="mt-5 space-y-2">
              <Label htmlFor="complaint-message">Details</Label>
              <Textarea
                id="complaint-message"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                minLength={10}
                maxLength={8000}
                rows={5}
                className="min-h-[120px] resize-y rounded-md"
                placeholder="Describe the issue, steps to reproduce, and any relevant dates or IDs."
              />
            </div>
            <Button
              type="submit"
              disabled={pending}
              className="mt-6 h-11 w-full rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md hover:from-violet-500 hover:to-fuchsia-500 sm:w-auto"
            >
              {pending ? (
                "Sending…"
              ) : (
                <>
                  <Send className="mr-2 size-4" />
                  Submit complaint
                </>
              )}
            </Button>
          </form>
        </ScrollReveal>
      </div>
    </section>
  );
}
