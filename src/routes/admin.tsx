import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import {
  Copy,
  Download,
  ExternalLink,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { AuroraBackground } from "@/components/AuroraBackground";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EXPLORER_URL, truncate } from "@/lib/chain";
import {
  INITIAL_ACTIVITY,
  INITIAL_STAFF,
  type Role,
  type StaffRecord,
} from "@/lib/registry";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Hospital Verification System" },
      {
        name: "description",
        content:
          "Manage authorized staff and patients and review every on-chain verification event from one dashboard.",
      },
      { property: "og:title", content: "Admin Dashboard — Hospital Verification System" },
      {
        property: "og:description",
        content: "Authorized staff management and on-chain verification history.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

const STATUS_STYLE = {
  SUCCESS: "bg-primary/12 text-primary ring-primary/30",
  FAILED: "bg-destructive/12 text-destructive ring-destructive/30",
  PENDING: "bg-moderate/12 text-moderate ring-moderate/30",
} as const;

function AdminPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <AuroraBackground />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1100px] flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
        <TopBar adminLabel />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage access and review on-chain verification activity.
          </p>
        </div>
        <StaffSection />
        <ActivitySection />
      </div>
    </main>
  );
}

function StaffSection() {
  const [staff, setStaff] = useState<StaffRecord[]>(INITIAL_STAFF);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ wallet: "", staffId: "", email: "", role: "Staff" as Role });

  const add = () => {
    if (!form.wallet || !form.staffId) return;
    setStaff((s) => [
      {
        id: crypto.randomUUID(),
        wallet: form.wallet,
        staffId: form.staffId.toUpperCase(),
        email: form.email,
        role: form.role,
        addedOn: new Date().toISOString(),
        active: true,
      },
      ...s,
    ]);
    setForm({ wallet: "", staffId: "", email: "", role: "Staff" });
    setOpen(false);
  };

  return (
    <section className="glass space-y-5 rounded-3xl p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Authorized Staff &amp; Patients
          </h2>
          <p className="text-xs text-muted-foreground">{staff.length} records on chain</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 rounded-full">
              <Plus className="size-3.5" /> Add New
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border bg-popover sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add authorized identity</DialogTitle>
              <DialogDescription>Records are written to the Ritual Chain registry.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                label="Wallet Address"
                value={form.wallet}
                onChange={(v) => setForm((f) => ({ ...f, wallet: v }))}
                placeholder="0x…"
              />
              <Input
                label="Staff / Patient ID"
                value={form.staffId}
                onChange={(v) => setForm((f) => ({ ...f, staffId: v }))}
                placeholder="HSP-STF-0091"
              />
              <Input
                label="Associated Email"
                value={form.email}
                onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                placeholder="name@hospital.org"
              />
              <div className="space-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Role
                </span>
                <Select
                  value={form.role}
                  onValueChange={(v) => setForm((f) => ({ ...f, role: v as Role }))}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Staff">Staff</SelectItem>
                    <SelectItem value="Patient">Patient</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={add} className="w-full rounded-xl">
                Add to Chain
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="-mx-5 overflow-x-auto px-5 sm:-mx-6 sm:px-6">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              <Th>Wallet Address</Th>
              <Th>Staff/Patient ID</Th>
              <Th>Added On</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id} className="border-t border-border transition-colors hover:bg-white/[0.04]">
                <Td className="font-mono text-xs">{truncate(s.wallet)}</Td>
                <Td className="font-mono text-xs text-foreground">{s.staffId}</Td>
                <Td className="text-xs text-muted-foreground">
                  {new Date(s.addedOn).toLocaleDateString()}
                </Td>
                <Td>
                  <Badge
                    className={
                      s.active
                        ? "bg-primary/12 text-primary ring-primary/30"
                        : "bg-white/[0.06] text-muted-foreground ring-border"
                    }
                  >
                    {s.active ? "Active" : "Inactive"}
                  </Badge>
                </Td>
                <Td className="text-right">
                  <button
                    type="button"
                    onClick={() => setStaff((all) => all.filter((x) => x.id !== s.id))}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
                  >
                    <Trash2 className="size-3" /> Remove
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ActivitySection() {
  const [refreshed, setRefreshed] = useState(() => new Date());
  const [wallet, setWallet] = useState("");
  const [staffId, setStaffId] = useState("");
  const [date, setDate] = useState("");

  const rows = useMemo(
    () =>
      INITIAL_ACTIVITY.filter((r) => {
        if (wallet && !r.wallet.toLowerCase().includes(wallet.toLowerCase())) return false;
        if (staffId && !r.staffId.toLowerCase().includes(staffId.toLowerCase())) return false;
        if (date && !r.timestamp.startsWith(date)) return false;
        return true;
      }).slice(0, 20),
    [date, staffId, wallet],
  );

  const exportCsv = () => {
    const header = "Timestamp,Wallet,Staff ID,Gate,Tx Hash,Status";
    const body = rows
      .map((r) => [r.timestamp, r.wallet, r.staffId, r.gate, r.txHash, r.status].join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([`${header}\n${body}`], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "verification-history.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="glass space-y-5 rounded-3xl p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">Verification History</h2>
          <p className="text-xs text-muted-foreground">All on-chain verification events</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 rounded-full" onClick={exportCsv}>
            <Download className="size-3.5" /> Export CSV
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 rounded-full"
            onClick={() => setRefreshed(new Date())}
          >
            <RefreshCw className="size-3.5" /> Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <FilterInput icon value={wallet} onChange={setWallet} placeholder="Filter by wallet" />
        <FilterInput icon value={staffId} onChange={setStaffId} placeholder="Filter by staff ID" />
        <FilterInput type="date" value={date} onChange={setDate} placeholder="Filter by date" />
      </div>
      <p className="text-[10px] text-muted-foreground">
        Last refreshed {refreshed.toLocaleTimeString()}
      </p>

      <div className="-mx-5 overflow-x-auto px-5 sm:-mx-6 sm:px-6">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              <Th>Timestamp</Th>
              <Th>Wallet</Th>
              <Th>Staff ID</Th>
              <Th>Gate / Purpose</Th>
              <Th>Tx Hash</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border transition-colors hover:bg-white/[0.04]">
                <Td className="text-xs text-muted-foreground">
                  {new Date(r.timestamp).toLocaleString()}
                </Td>
                <Td className="font-mono text-xs">{truncate(r.wallet)}</Td>
                <Td className="font-mono text-xs text-foreground">{r.staffId}</Td>
                <Td className="text-xs">{r.gate}</Td>
                <Td>
                  <span className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground">
                    {truncate(r.txHash)}
                    <button
                      type="button"
                      onClick={() => navigator.clipboard?.writeText(r.txHash)}
                      className="transition-colors hover:text-foreground"
                      aria-label="Copy transaction hash"
                    >
                      <Copy className="size-3" />
                    </button>
                    <a
                      href={`${EXPLORER_URL}/tx/${r.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="transition-colors hover:text-foreground"
                      aria-label="View on explorer"
                    >
                      <ExternalLink className="size-3" />
                    </a>
                  </span>
                </Td>
                <Td>
                  <Badge className={STATUS_STYLE[r.status]}>{r.status}</Badge>
                </Td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-muted-foreground">
                  No verification events match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={cn("px-3 pb-3 font-medium", className)}>{children}</th>;
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-3 py-3 align-middle", className)}>{children}</td>;
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide ring-1",
        className,
      )}
    >
      {children}
    </span>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
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
        className="w-full rounded-xl border border-border bg-white/[0.03] px-3.5 py-2.5 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary/60 focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_16%,transparent)]"
      />
    </label>
  );
}

function FilterInput({
  value,
  onChange,
  placeholder,
  icon,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon?: boolean;
  type?: string;
}) {
  return (
    <div className="relative">
      {icon && (
        <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-xl border border-border bg-white/[0.03] py-2.5 pr-3 text-xs text-foreground outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary/60 focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_14%,transparent)]",
          icon ? "pl-9" : "pl-3",
        )}
      />
    </div>
  );
}
