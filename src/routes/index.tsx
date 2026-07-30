import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BadgeCheck,
  Cpu,
  Fingerprint,
  IdCard,
  Link2,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { ModeForm } from "@/components/verify/ModeForm";
import { ResultCard } from "@/components/verify/ResultCard";
import {
  MODEL_REGISTRY,
  MODE_META,
  buildResult,
  type Mode,
  type VerificationResult,
} from "@/lib/verification";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hospital Verification Bot — ONNX Identity & Credential Checks" },
      {
        name: "description",
        content:
          "Enterprise-grade hospital verification: identity, credential and deep ML risk checks powered by ONNX inference and the Ritual Chain 0x0800 precompile.",
      },
      { property: "og:title", content: "Hospital Verification Bot — ONNX Identity & Credential Checks" },
      {
        property: "og:description",
        content:
          "HIPAA-grade verification in three modes — 99.7% accuracy, sub-3s ONNX inference, on-chain attestation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const MODES: Mode[] = ["easy", "moderate", "high"];

const MODE_ICON = { easy: IdCard, moderate: BadgeCheck, high: Fingerprint } as const;
const ACCENT: Record<Mode, string> = {
  easy: "var(--easy)",
  moderate: "var(--moderate)",
  high: "var(--high)",
};

const STEPS = ["Encoding input", "Running ONNX inference", "Verifying on Ritual Chain", "Complete"];

const DURATION: Record<Mode, [number, number]> = {
  easy: [900, 1400],
  moderate: [2000, 3000],
  high: [3000, 5000],
};

const STATS = ["99.7% Accuracy", "< 3s Inference", "Ritual ONNX Powered"];

function Dashboard() {
  const [mode, setMode] = useState<Mode>("easy");
  const [forms, setForms] = useState<Record<Mode, Record<string, string>>>({
    easy: {},
    moderate: {},
    high: {},
  });
  const [stage, setStage] = useState<number | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const running = stage !== null;
  const accent = ACCENT[mode];

  const run = useCallback(() => {
    if (running) return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setResult(null);
    setStage(0);

    const [lo, hi] = DURATION[mode];
    const total = Math.round(lo + Math.random() * (hi - lo));
    const step = total / STEPS.length;

    STEPS.forEach((_, i) => {
      timers.current.push(setTimeout(() => setStage(i), Math.round(step * i)));
    });

    timers.current.push(
      setTimeout(() => {
        setStage(null);
        setResult(buildResult(mode, forms[mode], total));
      }, total),
    );
  }, [forms, mode, running]);

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-background"
      style={{ ["--mode-accent" as string]: accent }}
    >
      {/* animated gradient background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="aurora absolute -top-[30%] left-[-15%] size-[70vw] rounded-full blur-[120px]"
          style={{ background: "color-mix(in oklab, var(--mode-accent) 20%, transparent)", transition: "background 700ms" }}
        />
        <div
          className="aurora absolute bottom-[-25%] right-[-10%] size-[60vw] rounded-full blur-[140px]"
          style={{ background: "oklch(0.45 0.15 265 / 35%)", animationDelay: "-9s" }}
        />
        <div
          className="aurora absolute left-[35%] top-[35%] size-[45vw] rounded-full blur-[150px]"
          style={{ background: "oklch(0.5 0.09 220 / 22%)", animationDelay: "-16s" }}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[900px] flex-col gap-8 px-4 py-14 sm:px-6 sm:py-20">
        {/* Hero */}
        <header className="space-y-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.04] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
            🔒 HIPAA-Grade Verification
          </div>
          <h1 className="text-balance text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-6xl">
            Verify every{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(100deg, var(--mode-accent), oklch(0.8 0.11 220))` }}
            >
              patient &amp; clinician
            </span>{" "}
            in seconds
          </h1>
          <p className="mx-auto max-w-xl text-pretty text-sm text-muted-foreground sm:text-base">
            One ONNX inference engine for reception desks, staff onboarding and ICU clearance — with
            cryptographic attestation on the Ritual Chain.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {STATS.map((s) => (
              <span
                key={s}
                className="rounded-full border border-border bg-white/[0.03] px-3.5 py-1.5 text-xs text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
              >
                {s}
              </span>
            ))}
          </div>
        </header>

        {/* Segmented control */}
        <div className="glass grid gap-1.5 rounded-[1.75rem] p-1.5 sm:grid-cols-3">
          {MODES.map((m) => {
            const Icon = MODE_ICON[m];
            const active = mode === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setResult(null);
                }}
                className={cn(
                  "group flex items-center gap-3 rounded-[1.4rem] px-4 py-3 text-left transition-all duration-300",
                  active ? "text-foreground" : "text-muted-foreground hover:bg-white/[0.04]",
                )}
                style={
                  active
                    ? {
                        background: `color-mix(in oklab, ${ACCENT[m]} 16%, transparent)`,
                        boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${ACCENT[m]} 45%, transparent), 0 12px 40px -18px ${ACCENT[m]}`,
                      }
                    : undefined
                }
              >
                <Icon
                  className="size-4 shrink-0 transition-colors"
                  style={active ? { color: ACCENT[m] } : undefined}
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{MODE_META[m].label}</span>
                  <span className="block truncate text-[11px] opacity-70">{MODE_META[m].title}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Form panel */}
        <section
          key={mode}
          className="glass animate-in fade-in slide-in-from-bottom-3 space-y-6 rounded-3xl p-5 duration-500 sm:p-8"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight" style={{ color: accent }}>
                {MODE_META[mode].title}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {MODE_META[mode].useCase} · target {MODE_META[mode].target}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-black/40 px-3 py-1.5 font-mono text-[10px] text-muted-foreground">
              <span className="pulse-dot size-1.5 rounded-full bg-easy" />
              <Cpu className="size-3" />
              <span className="max-w-[220px] truncate">{MODEL_REGISTRY[mode]}</span>
            </div>
          </div>

          <ModeForm
            mode={mode}
            form={forms[mode]}
            onChange={(patch) => setForms((f) => ({ ...f, [mode]: { ...f[mode], ...patch } }))}
          />

          {mode === "high" && (
            <div
              className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-[11px] font-semibold tracking-wide text-high"
              style={{
                background: "color-mix(in oklab, var(--high) 12%, transparent)",
                boxShadow:
                  "inset 0 0 0 1px color-mix(in oklab, var(--high) 40%, transparent), 0 0 30px -8px var(--high)",
              }}
            >
              <Link2 className="size-3.5" />
              Powered by Ritual ONNX Precompile 0x0800
              <ShieldAlert className="size-3.5 opacity-70" />
            </div>
          )}

          <div className="space-y-3">
            <button
              type="button"
              onClick={run}
              disabled={running}
              className="group relative flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-semibold text-background transition-all duration-300 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-80"
              style={{
                backgroundImage: `linear-gradient(100deg, var(--mode-accent), color-mix(in oklab, var(--mode-accent) 55%, oklch(0.8 0.11 220)))`,
                boxShadow: `0 18px 50px -20px var(--mode-accent)`,
              }}
            >
              {running && <Loader2 className="size-4 animate-spin" />}
              {running ? "Running inference…" : "Run verification"}
            </button>

            {running && (
              <div className="space-y-3 rounded-2xl border border-border bg-white/[0.02] p-4">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${(((stage ?? 0) + 1) / STEPS.length) * 100}%`,
                      background: "var(--mode-accent)",
                      boxShadow: "0 0 14px var(--mode-accent)",
                    }}
                  />
                </div>
                <ul className="grid gap-1.5 sm:grid-cols-2">
                  {STEPS.map((s, i) => {
                    const done = (stage ?? 0) > i;
                    const current = (stage ?? 0) === i;
                    return (
                      <li
                        key={s}
                        className={cn(
                          "flex items-center gap-2 font-mono text-[11px] transition-colors",
                          done ? "text-foreground/70" : current ? "text-foreground" : "text-muted-foreground/50",
                        )}
                      >
                        <span
                          className={cn("size-1.5 rounded-full", current && "pulse-dot")}
                          style={{
                            background: done || current ? "var(--mode-accent)" : "var(--color-border)",
                          }}
                        />
                        {s}
                        {current && "…"}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </section>

        {result && <ResultCard result={result} />}

        <p className="mt-auto pt-4 text-center text-[11px] text-muted-foreground">
          Demonstration build — ONNX inference and on-chain anchoring are simulated.
        </p>
      </div>
    </main>
  );
}
