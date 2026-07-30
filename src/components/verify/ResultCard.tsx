import { useState } from "react";
import { ChevronDown, Share2 } from "lucide-react";
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

export function ResultCard({ result }: { result: VerificationResult }) {
  const [open, setOpen] = useState(true);
  const accent = accentVar[result.mode];
  const json = JSON.stringify(result, null, 2);

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
      className="animate-in fade-in slide-in-from-bottom-3 rounded-2xl border bg-card p-5 duration-500 sm:p-6"
      style={{ borderColor: accent, boxShadow: `0 0 0 1px color-mix(in oklab, ${accent} 25%, transparent), 0 20px 60px -30px ${accent}` }}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <div
            className="inline-flex items-center rounded-full px-4 py-1.5 text-lg font-semibold tracking-tight"
            style={{ background: `color-mix(in oklab, ${accent} 18%, transparent)`, color: accent }}
          >
            {result.status}
          </div>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p className="text-base font-medium text-foreground">{result.subject}</p>
            <p className="font-mono text-xs">{result.model}</p>
            <p className="text-xs">
              inference {result.latencyMs} ms · {new Date(result.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
        <ScoreRing value={result.score} accent={accent} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <CopyButton value={json} label="Copy JSON" />
        <Button type="button" variant="outline" size="sm" className="gap-2" onClick={share}>
          <Share2 className="size-3.5" /> Export
        </Button>
        <Button type="button" variant="ghost" size="sm" className="gap-2" onClick={() => setOpen((v) => !v)}>
          Details <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
        </Button>
      </div>

      {open && (
        <dl className="animate-in fade-in mt-4 grid gap-x-6 gap-y-2 border-t border-border pt-4 text-sm sm:grid-cols-2">
          {Object.entries(result.details).map(([k, v]) => (
            <div key={k} className="flex items-start justify-between gap-4 py-1">
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
