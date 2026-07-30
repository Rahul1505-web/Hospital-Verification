import { CopyButton } from "./CopyButton";

const snippets = [
  {
    title: "Discord bot command",
    hint: "Slash command registered on your guild",
    code: `/verify mode:high id:ICU-STF-0091
# → bot replies with an embed containing
#   status, trust score, model + tx hash`,
  },
  {
    title: "iFrame embed (hospital portal)",
    hint: "Drop into any intranet page",
    code: `<iframe
  src="https://hospital-verify.bot/embed?mode=moderate"
  width="100%" height="720" frameborder="0"
  allow="clipboard-write"
  title="Hospital Verification Bot"></iframe>`,
  },
  {
    title: "REST API",
    hint: "Server-to-server verification",
    code: `POST /api/verify
Content-Type: application/json

{
  "mode": "easy",
  "payload": {
    "patientName": "Jane Okafor",
    "hospitalId": "HSP-104-99283",
    "dob": "1988-02-14",
    "phone": "+15550142"
  }
}`,
  },
];

export function EmbedSection() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Embed This Bot</h2>
        <p className="text-sm text-muted-foreground">
          The same verification engine, available anywhere your staff already works.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {snippets.map((s) => (
          <div key={s.title} className="flex flex-col rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-medium">{s.title}</h3>
                <p className="text-xs text-muted-foreground">{s.hint}</p>
              </div>
              <CopyButton value={s.code} />
            </div>
            <pre className="mt-3 flex-1 overflow-x-auto rounded-lg bg-secondary/60 p-3 text-[11px] leading-relaxed text-foreground">
              <code>{s.code}</code>
            </pre>
          </div>
        ))}
      </div>
    </section>
  );
}
