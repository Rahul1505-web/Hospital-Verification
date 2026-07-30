import { Button } from "@/components/ui/button";
import { MODE_META, type VerificationResult } from "@/lib/verification";
import { Trash2 } from "lucide-react";

const dot: Record<string, string> = {
  easy: "bg-easy",
  moderate: "bg-moderate",
  high: "bg-high",
};

export function HistoryLog({
  history,
  onClear,
}: {
  history: VerificationResult[];
  onClear: () => void;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Verification history</h2>
          <p className="text-sm text-muted-foreground">Last 5 runs in this session.</p>
        </div>
        <Button variant="ghost" size="sm" className="gap-2" onClick={onClear} disabled={!history.length}>
          <Trash2 className="size-3.5" /> Clear
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {history.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">No verifications yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {history.map((h) => (
              <li key={h.id} className="flex flex-wrap items-center gap-3 p-4 text-sm">
                <span className={`size-2 rounded-full ${dot[h.mode]}`} />
                <span className="font-mono text-xs text-muted-foreground">{h.id}</span>
                <span className="font-medium">{h.subject}</span>
                <span className="text-xs text-muted-foreground">{MODE_META[h.mode].label}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {new Date(h.timestamp).toLocaleTimeString()}
                </span>
                <span className="tabular-nums text-xs">{h.score}%</span>
                <span className="text-xs font-medium">{h.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
