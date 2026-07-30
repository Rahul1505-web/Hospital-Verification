export function AuroraBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        className="aurora absolute -top-[30%] left-[-15%] size-[70vw] rounded-full blur-[120px]"
        style={{ background: "oklch(0.5 0.13 250 / 34%)" }}
      />
      <div
        className="aurora absolute bottom-[-25%] right-[-12%] size-[65vw] rounded-full blur-[140px]"
        style={{ background: "oklch(0.42 0.16 22 / 34%)", animationDelay: "-9s" }}
      />
      <div
        className="aurora absolute left-[30%] top-[40%] size-[45vw] rounded-full blur-[150px]"
        style={{ background: "oklch(0.45 0.1 200 / 22%)", animationDelay: "-16s" }}
      />
    </div>
  );
}
