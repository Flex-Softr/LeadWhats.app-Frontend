import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";

const FEATURES = [
  "Official API & QR-based connectivity",
  "Broadcast campaigns to thousands",
  "Automated responses & chatbots",
  "Detailed analytics & insights",
] as const;

export function AuthMarketingPanel() {
  return (
    <div className="relative flex min-h-[240px] flex-col overflow-hidden bg-gradient-to-br from-violet-950 via-violet-800 to-fuchsia-600 px-8 py-10 text-white lg:min-h-screen lg:px-12 lg:py-12 xl:px-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12), transparent 45%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.08), transparent 40%)",
        }}
        aria-hidden
      />
      <div className="relative z-10 flex flex-1 flex-col">
        <Link
          href="/"
          className="mb-10 inline-flex w-fit items-center gap-2 text-[15px] font-semibold tracking-tight text-white/95 transition-opacity hover:opacity-90"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
            <MessageCircle className="size-5" strokeWidth={2} />
          </span>
          FlexoWhats
        </Link>

        <div className="max-w-md flex-1 space-y-8 lg:mt-6">
          <div className="space-y-4">
            <h1 className="font-heading text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-[2.35rem] lg:leading-[1.15]">
              Grow your business with WhatsApp
            </h1>
            <p className="text-[15px] leading-relaxed text-white/85 lg:text-base">
              Connect with customers, automate messages, and scale your
              marketing effortlessly.
            </p>
          </div>

          <ul className="space-y-4">
            {FEATURES.map((line) => (
              <li key={line} className="flex gap-3 text-[15px] leading-snug">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
                  <ArrowRight className="size-3.5 text-white" strokeWidth={2.5} />
                </span>
                <span className="pt-0.5 text-white/90">{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 mt-10 text-xs text-white/55 lg:mt-auto">
          © {new Date().getFullYear()} FlexoWhats. All rights reserved.
        </p>
      </div>
    </div>
  );
}
