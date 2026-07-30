import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Mode } from "@/lib/verification";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

type Form = Record<string, string>;

interface Props {
  mode: Mode;
  form: Form;
  onChange: (patch: Form) => void;
}

const inputCls =
  "h-11 rounded-xl border-border bg-white/[0.03] text-foreground placeholder:text-muted-foreground/70 transition-all duration-200 focus-visible:border-[var(--mode-accent)] focus-visible:ring-[3px] focus-visible:ring-[color-mix(in_oklab,var(--mode-accent)_30%,transparent)]";

const labelCls = "text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground";

function Field({
  id,
  label,
  hint,
  className,
  ...rest
}: { id: string; label: string; hint?: string } & React.ComponentProps<typeof Input>) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className={labelCls}>
        {label}
      </Label>
      <Input id={id} {...rest} className={cn(inputCls, className)} />
      {hint && <p className="text-[11px] leading-snug text-muted-foreground/80">{hint}</p>}
    </div>
  );
}

export function ModeForm({ mode, form, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => onChange({ [k]: e.target.value });

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange({ document: String(reader.result ?? ""), documentName: file.name });
    reader.readAsDataURL(file);
  };

  if (mode === "easy") {
    return (
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="patientName" label="Patient name" placeholder="Jane Okafor" value={form.patientName ?? ""} onChange={set("patientName")} />
        <Field id="hospitalId" label="Hospital ID" placeholder="HSP-104-99283" hint="Format: HSP-###-#####" value={form.hospitalId ?? ""} onChange={set("hospitalId")} />
        <Field id="dob" label="Date of birth" type="date" value={form.dob ?? ""} onChange={set("dob")} />
        <Field id="phone" label="Phone number" placeholder="+1 555 0142" value={form.phone ?? ""} onChange={set("phone")} />
      </div>
    );
  }

  if (mode === "moderate") {
    return (
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="staffId" label="Staff ID" placeholder="STF-2210" value={form.staffId ?? ""} onChange={set("staffId")} />
        <div className="space-y-2">
          <Label className={labelCls}>Role</Label>
          <Select value={form.role ?? ""} onValueChange={(v) => onChange({ role: v })}>
            <SelectTrigger className={cn(inputCls, "w-full")}>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Doctor">Doctor</SelectItem>
              <SelectItem value="Nurse">Nurse</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Field id="department" label="Department" placeholder="Cardiology" value={form.department ?? ""} onChange={set("department")} />
        <Field
          id="licenseNumber"
          label="License number"
          placeholder="MD-88213"
          hint="Numbers starting with EXP resolve as expired credentials."
          value={form.licenseNumber ?? ""}
          onChange={set("licenseNumber")}
        />
        <div className="space-y-2 sm:col-span-2">
          <Label className={labelCls}>Credential document</Label>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full justify-start gap-2 rounded-xl border-border bg-white/[0.03] font-normal transition-all duration-200 hover:bg-white/[0.06]"
            onClick={() => fileRef.current?.click()}
          >
            <UploadCloud className="size-4" />
            {form.documentName ? form.documentName : "Upload document image (encoded base64)"}
          </Button>
          <p className="text-[11px] leading-snug text-muted-foreground/80">
            Image is base64-encoded client-side before the authenticity model runs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field id="subjectId" label="Patient / Staff ID" placeholder="ICU-STF-0091" value={form.subjectId ?? ""} onChange={set("subjectId")} />
      <Field
        id="biometricHash"
        label="Biometric hash"
        placeholder="b7f2a91c0d…"
        hint="Under 10 characters is flagged as low-entropy → HIGH RISK."
        value={form.biometricHash ?? ""}
        onChange={set("biometricHash")}
        className="font-mono"
      />
      <Field
        id="behavioral"
        label="Behavioral pattern"
        placeholder="0.12, 0.87, 0.34, 0.05"
        hint="Comma-separated float tensor fed to the deep net."
        value={form.behavioral ?? ""}
        onChange={set("behavioral")}
        className="font-mono"
      />
      <Field
        id="wallet"
        label="Ritual Chain wallet (optional)"
        placeholder="0x…"
        hint="Used to anchor the attestation on-chain."
        value={form.wallet ?? ""}
        onChange={set("wallet")}
        className="font-mono"
      />
    </div>
  );
}
