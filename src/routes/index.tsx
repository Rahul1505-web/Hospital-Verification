import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAccount, useSignMessage } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  HeartPulse,
  Loader2,
  LockKeyhole,
  RotateCcw,
  Wallet,
} from "lucide-react";
import { AuroraBackground } from "@/components/AuroraBackground";
import { TopBar } from "@/components/TopBar";
import { CopyButton } from "@/components/CopyButton";
import { useHydrated } from "@/components/web3/Web3Provider";
import { EXPLORER_URL, truncate } from "@/lib/chain";
import { generateCode, generateTxHash } from "@/lib/registry";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hospital Verification System — On-chain Identity Checks" },
      {
        name: "description",
        content:
          "Connect your wallet, confirm your hospital ID and authenticator code, and receive on-chain verified entry codes in seconds.",
      },
      { property: "og:title", content: "Hospital Verification System" },
      {
        property: "og:description",
        content: "Secure. On-chain. Verified. Wallet-based identity verification for hospital access.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

type Phase = "idle" | "validating" | "verifying" | "signing" | "success" | "failed";

const PHASE_TEXT: Record<string, string> = {
  validating: "Validating credentials...",
  verifying: "Running secure verification...",
  signing: "Awaiting wallet confirmation...",
};

function HomePage() {
  const hydrated = useHydrated();
  const { isConnected } = useAccount();

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <AuroraBackground />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[900px] flex-col gap-10 px-4 py-8 sm:px-6 sm:py-10">
        {!hydrated ? (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : isConnected ? (
          <>
            <TopBar />
            <VerifyPanel />
          </>
        ) : (
          <Landing />
        )}
      </div>
    </main>
  );
}

function Landing() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-7 text-center">
      <div className="glass grid size-20 place-items-center rounded-3xl text-primary">
        <HeartPulse className="size-9" />
      </div>
      <div className="space-y-3">
        <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Hospital Verification System
        </h1>
        <p className="text-base text-muted-foreground">Secure. On-chain. Verified.</p>
      </div>

      <div className="wallet-pulse rounded-2xl">
        <ConnectButton.Custom>
          {({ openConnectModal, mounted }) => (
            <button
              type="button"
              disabled={!mounted}
              onClick={openConnectModal}
              className="flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-primary to-[oklch(0.72_0.13_215)] px-10 py-4 text-sm font-semibold text-background shadow-[0_20px_60px_-24px_var(--primary)] transition-transform duration-300 hover:scale-[1.02]"
            >
              <Wallet className="size-4" />
              Connect Wallet
            </button>
          )}
        </ConnectButton.Custom>
      </div>

      <p className="max-w-sm text-xs text-muted-foreground">
        Your identity is verified on-chain. No data is stored off-chain.
      </p>
      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
        <LockKeyhole className="size-3" /> MetaMask &amp; WalletConnect supported · Ritual Chain (1979)
      </p>
    </div>
  );
}

function VerifyPanel() {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [staffId, setStaffId] = useState("");
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    entry: string;
    email: string;
    tx: string;
    block: number;
    time: string;
  } | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const wait = (ms: number) => new Promise((r) => timers.current.push(setTimeout(r, ms)));

  const submit = useCallback(async () => {
    if (phase === "validating" || phase === "verifying" || phase === "signing") return;
    setError("");
    setResult(null);
    setPhase("validating");
    await wait(900);

    const idOk = staffId.trim().length >= 3;
    const codeOk = /^\d{6}$/.test(code.trim());
    if (!idOk || !codeOk) {
      setPhase("failed");
      setError(
        !idOk
          ? "Please enter a valid ID (at least 3 characters)"
          : "Please enter a valid 6-digit code",
      );
      return;
    }

    setPhase("verifying");
    await wait(1500);

    setPhase("signing");
    try {
      await signMessageAsync({
        message: `Hospital Verification\nID: ${staffId.trim()}\nWallet: ${address}\nTimestamp: ${new Date().toISOString()}`,
      });
    } catch {
      setPhase("failed");
      setError("Wallet confirmation was rejected. Please approve the request to complete verification.");
      return;
    }

    await wait(800);
    setResult({
      entry: generateCode(),
      email: generateCode(),
      tx: generateTxHash(),
      block: 4_812_000 + Math.floor(Math.random() * 90_000),
      time: new Date().toLocaleString(),
    });
    setPhase("success");
  }, [address, code, phase, signMessageAsync, staffId]);

  const busy = phase === "validating" || phase === "verifying" || phase === "signing";
  const failed = phase === "failed";

  if (phase === "success" && result) {
    return (
      <SuccessView
        result={result}
        onAgain={() => {
          setResult(null);
          setPhase("idle");
          setStaffId("");
          setCode("");
        }}
      />
    );
  }

  return (
    <section
      className={cn(
        "glass animate-in fade-in slide-in-from-bottom-3 mx-auto w-full max-w-xl space-y-7 rounded-3xl p-6 duration-500 sm:p-8",
        failed && "shake border-destructive/50",
      )}
    >
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Identity Verification</h1>
        <p className="text-sm text-muted-foreground">Enter your credentials to proceed</p>
      </div>

      <div className="space-y-5">
        <Field
          label="Staff / Patient ID"
          helper="Your hospital-issued ID"
          error={failed}
          value={staffId}
          onChange={setStaffId}
          placeholder="e.g. HSP-STF-0091"
          mono
        />
        <Field
          label="Google Authenticator Code"
          helper="Enter any 6-digit code for demo purposes"
          error={failed}
          value={code}
          onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
          placeholder="6-digit code"
          inputMode="numeric"
          mono
        />
      </div>

      {failed && (
        <p className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-xs text-destructive">
          <AlertTriangle className="mt-px size-3.5 shrink-0" />
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-[oklch(0.72_0.13_215)] px-6 py-4 text-sm font-semibold text-background shadow-[0_18px_50px_-22px_var(--primary)] transition-transform duration-300 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-80"
      >
        {busy && <Loader2 className="size-4 animate-spin" />}
        {busy ? PHASE_TEXT[phase] : "Verify & Sign"}
      </button>

      {phase === "signing" && (
        <div className="animate-in fade-in space-y-1 rounded-2xl border border-border bg-white/[0.03] p-4 text-center">
          <p className="text-sm text-foreground">
            Please confirm the transaction in your wallet to complete verification
          </p>
          <p className="text-[11px] text-muted-foreground">
            This logs your verification on-chain. Gas fees apply.
          </p>
        </div>
      )}
    </section>
  );
}

function Field({
  label,
  helper,
  value,
  onChange,
  placeholder,
  error,
  inputMode,
  mono,
}: {
  label: string;
  helper: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  error?: boolean;
  inputMode?: "numeric";
  mono?: boolean;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={inputMode === "numeric" ? 6 : 32}
        className={cn(
          "w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/60",
          mono && "font-mono tracking-wide",
          error
            ? "border-destructive/60 focus:border-destructive focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--destructive)_18%,transparent)]"
            : "border-border focus:border-primary/60 focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_16%,transparent)]",
        )}
      />
      <span className="block text-[11px] text-muted-foreground">{helper}</span>
    </label>
  );
}

function SuccessView({
  result,
  onAgain,
}: {
  result: { entry: string; email: string; tx: string; block: number; time: string };
  onAgain: () => void;
}) {
  return (
    <section className="glass animate-in fade-in slide-in-from-bottom-4 mx-auto w-full max-w-xl space-y-7 rounded-3xl p-6 text-center duration-700 sm:p-8">
      <div className="flex flex-col items-center gap-4">
        <span className="pop grid size-20 place-items-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/40">
          <CheckCircle2 className="size-10" />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Verification Complete</h1>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <CodeBox title="Entry Code" code={result.entry} caption="Show this at the gate" delay="0ms" />
        <CodeBox
          title="Email Code"
          code={result.email}
          caption="Sent to your registered email"
          delay="120ms"
        />
      </div>

      <div className="space-y-3">
        <p className="text-[11px] text-muted-foreground">
          Transaction confirmed on Ritual Chain · Block #{result.block.toLocaleString()} · {result.time}
        </p>
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-white/[0.03] px-3 py-2 font-mono text-[11px] text-muted-foreground">
          <span className="truncate">{truncate(result.tx, 6, 4)}</span>
          <CopyButton value={result.tx} label="" className="h-7 px-2" />
          <a
            href={`${EXPLORER_URL}/tx/${result.tx}`}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-foreground"
          >
            <ExternalLink className="size-3.5" />
          </a>
        </div>
      </div>

      <button
        type="button"
        onClick={onAgain}
        className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
      >
        <RotateCcw className="size-3.5" /> Verify Again
      </button>
    </section>
  );
}

function CodeBox({
  title,
  code,
  caption,
  delay,
}: {
  title: string;
  code: string;
  caption: string;
  delay: string;
}) {
  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-4 space-y-2 rounded-2xl border border-primary/25 bg-primary/[0.06] p-5 duration-700"
      style={{ animationDelay: delay, animationFillMode: "backwards" }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </p>
      <p className="font-mono text-2xl font-semibold tracking-widest text-primary">{code}</p>
      <p className="text-[11px] text-muted-foreground">{caption}</p>
      <CopyButton value={code} className="mx-auto" />
    </div>
  );
}
