import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Activity, Cpu, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeForm } from "@/components/verify/ModeForm";
import { ResultCard } from "@/components/verify/ResultCard";
import { EmbedSection } from "@/components/verify/EmbedSection";
import { HistoryLog } from "@/components/verify/HistoryLog";
import {
  MODEL_REGISTRY,
  MODE_META,
  buildResult,
  inferenceStages,
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
          "Multi-mode hospital verification dashboard: identity, credential and deep ML checks powered by ONNX inference and the Ritual Chain 0x0800 precompile.",
      },
      { property: "og:title", content: "Hospital Verification Bot — ONNX Identity & Credential Checks" },
      {
        property: "og:description",
        content:
          "Verify patients and staff in three modes, embed the bot in Discord, hospital portals, or via REST API.",
      },
    ],
  }),
  component: Dashboard,
});

const MODES: Mode[] = ["easy", "moderate", "high"];
const accentClass: Record<Mode, string> = {
  easy: "text-easy",
  moderate: "text-moderate",
  high: "text-high",
};
const accentBg: Record<Mode, string> = {
  easy: "bg-easy/15 border-easy/60 text-easy",
  moderate: "bg-moderate/15 border-moderate/60 text-moderate",
  high: "bg-high/15 border-high/60 text-high",
};

const DURATION: Record<Mode, [number, number]> = {
  easy: [600, 950],
  moderate: [2000, 3000],
  high: [3000, 5000],
};

function Dashboard() {
  const [mode, setMode] = useState<Mode>("easy");
  const [forms, setForms] = useState<Record<Mode, Record<string, string>>>({
    easy: {},
    moderate: {},
    high: {},
  });
  const [stage, setStage] = useState<number | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [history, setHistory] = useState<VerificationResult[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const running = stage !== null;
  const stages = inferenceStages[mode];

  const run = useCallback(() => {
    if (running) return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setResult(null);
    setStage(0);

    const [lo, hi] = DURATION[mode];
    const total = Math.round(lo + Math.random() * (hi - lo));
    const step = total / stages.length;

    stages.forEach((_, i) => {
      timers.current.push(setTimeout(() => setStage(i), Math.round(step * i)));
    });

    timers.current.push(
      setTimeout(() => {
        const res = buildResult(mode, forms[mode], total);
        setStage(null);
        setResult(res);
        setHistory((h) => [res, ...h].slice(0, 5));
      }, total),
    );
  }, [forms, mode, running, stages]);

  return (
    <main className="min-h-screen bg-background">
      <div
        className="border-b border-border"
        style={{ background: "radial-gradient(1200px 400px at 50% -180px, color-mix(in oklab, var(--primary) 22%, transparent), transparent)" }}
      >
        <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary">
            <ShieldCheck className="size-4" /> Hospital Verification Bot
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            ONNX-powered identity, credential &amp; deep-risk verification
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            One verification engine for reception desks, staff onboarding and ICU clearance — embeddable in
            Discord, hospital portals, and any web app.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-10 px-4 py-10">
        {/* Mode selector */}
        <div className="grid gap-2 rounded-2xl border border-border bg-card p-2 sm:grid-cols-3">
          {MODES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setResult(null);
              }}
              className={cn(
                "rounded-xl border border-transparent px-4 py-3 text-left transition-all",
                mode === m ? accentBg[m] : "text-muted-foreground hover:bg-secondary/60",
              )}
            >
              <span className="block text-sm font-semibold">
                {MODE_META[m].emoji} {MODE_META[m].label} mode
              </span>
              <span className="mt-0.5 block text-xs opacity-80">{MODE_META[m].title}</span>
            </button>
          ))}
        </div>

        {/* Form */}
        <section key={mode} className="animate-in fade-in slide-in-from-bottom-2 space-y-5 rounded-2xl border border-border bg-card p-5 duration-300 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className={cn("text-lg font-semibold tracking-tight", accentClass[mode])}>
                {MODE_META[mode].title}
              </h2>
              <p className="text-xs text-muted-foreground">
                {MODE_META[mode].useCase} · target {MODE_META[mode].target}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border px-3 py-1 font-mono text-[11px] text-muted-foreground">
              <Cpu className="size-3.5" /> {MODEL_REGISTRY[mode]}
            </div>
          </div>

          <ModeForm
            mode={mode}
            form={forms[mode]}
            onChange={(patch) => setForms((f) => ({ ...f, [mode]: { ...f[mode], ...patch } }))}
          />

          {mode === "high" && (
            <div className="inline-flex items-center gap-2 rounded-full border border-high/50 bg-high/10 px-3 py-1 text-[11px] font-medium text-high">
              <Activity className="size-3.5" /> Powered by Ritual ONNX Precompile 0x0800
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={run} disabled={running} className="gap-2">
              {running && <Loader2 className="size-4 animate-spin" />}
              {running ? "Running inference…" : "Run verification"}
            </Button>
            {running && (
              <span className="font-mono text-xs text-muted-foreground">
                [{(stage ?? 0) + 1}/{stages.length}] {stages[stage ?? 0]}…
              </span>
            )}
          </div>

          {running && (
            <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${(((stage ?? 0) + 1) / stages.length) * 100}%` }}
              />
            </div>
          )}
        </section>

        {result && <ResultCard result={result} />}

        <EmbedSection />
        <HistoryLog history={history} onClear={() => setHistory([])} />

        <p className="pb-6 text-center text-xs text-muted-foreground">
          Demonstration build — ONNX inference and on-chain anchoring are simulated.
        </p>
      </div>
    </main>
  );
}
