interface Props {
  value: number;
  accent: string;
  size?: number;
}

export function ScoreRing({ value, accent, size = 136 }: Props) {
  const r = size / 2 - 9;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <div
        className="absolute inset-3 rounded-full blur-2xl"
        style={{ background: `color-mix(in oklab, ${accent} 22%, transparent)` }}
      />
      <svg width={size} height={size} className="relative -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={9} className="stroke-border" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={9}
          fill="none"
          stroke={accent}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * value) / 100}
          style={{ transition: "stroke-dashoffset 1200ms cubic-bezier(.2,.8,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold tabular-nums text-foreground">{value}%</span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">confidence</span>
      </div>
    </div>
  );
}
