import { Link } from "@tanstack/react-router";
import { useAccount, useDisconnect } from "wagmi";
import { HeartPulse, LogOut, ShieldCheck } from "lucide-react";
import { truncate } from "@/lib/chain";

export function TopBar({ adminLabel }: { adminLabel?: boolean }) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <Link to="/" className="flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
          <HeartPulse className="size-4.5" />
        </span>
        <span className="text-sm font-semibold tracking-tight text-foreground">
          Hospital Verification
        </span>
      </Link>

      <div className="flex items-center gap-2">
        <Link
          to="/admin"
          className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
          activeProps={{ className: "text-foreground bg-white/[0.06]" }}
        >
          Admin
        </Link>

        {isConnected && (
          <button
            type="button"
            onClick={() => disconnect()}
            title="Disconnect wallet"
            className="group flex items-center gap-2 rounded-full border border-border bg-white/[0.04] px-3 py-1.5 font-mono text-xs text-foreground transition-colors hover:border-destructive/50 hover:bg-destructive/10"
          >
            <span className="pulse-dot size-1.5 rounded-full bg-primary" />
            {adminLabel && (
              <span className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">
                Admin Wallet
              </span>
            )}
            {truncate(address)}
            <LogOut className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        )}
        {!isConnected && (
          <span className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" /> Not connected
          </span>
        )}
      </div>
    </header>
  );
}
