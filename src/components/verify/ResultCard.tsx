import { useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, ExternalLink, Share2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "./CopyButton";
import { ScoreRing } from "./ScoreRing";
import { cn } from "@/lib/utils";
import type { VerificationResult } from "@/lib/verification";

const accentVar: Record<string, string> = {
  easy: "var(--easy)",
  moderate: "var(--moderate)",
  high: "var(--high)",
};

const statusIcon = {
  VERIFIED: CheckCircle2,
  FAILED: XCircle,
  "REVIEW REQUIRED": AlertTriangle,
} as const;

export function ResultCard({ result }: { result: VerificationResult }) {
  const [open, setOpen] = useState(true);
  const accent = accentVar[result.mode];
  const json = JSON.stringify(result, null, 2);
  const Icon = statusIcon[result.status];
  const txHash = result.mode === "high" ? String(result.details["Tx hash"] ?? "") : "";

  const share = async () => {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `verification-${result.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="glass animate-in fade-in slide-in-from-bottom-6 rounded-3xl p-6 duration-700 sm:p-8"
      style={{
        borderColor: `color-mix(in oklab, ${accent} 35%, transparent)`,
        boxShadow: `0 0 0 1px color-mix(in oklab, ${accent} 20%, transparent), 0 40px 100px -50px ${accent}`,
      }}
    >
      <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-4">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-base font-semibold tracking-tight"
            style={{
              background: `color-mix(in oklab, ${accent} 14%, transparent)`,
              color: accent,
              boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${accent} 35%, transparent)`,
            }}
          >
            <Icon className="size-4" />
            {result.status}
          </div>
          <div className="space-y-1.5">
            <p className="text-lg font-semibold tracking-tight text-foreground">{result.subject}</p>
            <p className="font-mono text-[11px] text-muted-foreground">{result.model}</p>
            <p className="text-xs text-muted-foreground">
              inference {result.latencyMs} ms · {new Date(result.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
        <ScoreRing value={result.score} accent={accent} />
      </div>

      {txHash && (
        <a
          href={`https://ritualscan.io/tx/${txHash}`}
          target="_blank"
          rel="noreferrer"
          className="mt-6 flex items-center gap-2 rounded-xl border border-border bg-white/[0.03] px-3 py-2.5 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <span className="shrink-0 uppercase tracking-widest">tx</span>
          <span className="truncate">{txHash}</span>
          <ExternalLink className="ml-auto size-3.5 shrink-0" />
        </a>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <CopyButton value={json} label="Copy as JSON" />
        <Button type="button" variant="outline" size="sm" className="gap-2 rounded-full" onClick={share}>
          <Share2 className="size-3.5" /> Export
        </Button>
        <Button type="button" variant="ghost" size="sm" className="gap-2 rounded-full" onClick={() => setOpen((v) => !v)}>
          Details <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
        </Button>
      </div>

      {open && (
        <dl className="animate-in fade-in mt-5 grid gap-x-8 gap-y-1 border-t border-border pt-5 text-sm sm:grid-cols-2">
          {Object.entries(result.details).map(([k, v]) => (
            <div key={k} className="flex items-start justify-between gap-4 py-1.5">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="max-w-[60%] truncate text-right font-mono text-xs text-foreground">
                {Array.isArray(v) ? v.join(", ") : String(v)}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
