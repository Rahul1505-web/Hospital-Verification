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

type Form = Record<string, string>;

interface Props {
  mode: Mode;
  form: Form;
  onChange: (patch: Form) => void;
}

function Field({
  id,
  label,
  ...rest
}: { id: string; label: string } & React.ComponentProps<typeof Input>) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <Input id={id} {...rest} />
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
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="patientName" label="Patient name" placeholder="Jane Okafor" value={form.patientName ?? ""} onChange={set("patientName")} />
        <Field id="hospitalId" label="Hospital ID" placeholder="HSP-104-99283" value={form.hospitalId ?? ""} onChange={set("hospitalId")} />
        <Field id="dob" label="Date of birth" type="date" value={form.dob ?? ""} onChange={set("dob")} />
        <Field id="phone" label="Phone number" placeholder="+1 555 0142" value={form.phone ?? ""} onChange={set("phone")} />
      </div>
    );
  }

  if (mode === "moderate") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="staffId" label="Staff ID" placeholder="STF-2210" value={form.staffId ?? ""} onChange={set("staffId")} />
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Role</Label>
          <Select value={form.role ?? ""} onValueChange={(v) => onChange({ role: v })}>
            <SelectTrigger>
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
        <Field id="licenseNumber" label="License number" placeholder="MD-88213 (EXP… = expired)" value={form.licenseNumber ?? ""} onChange={set("licenseNumber")} />
        <div className="space-y-2 sm:col-span-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Credential document</Label>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
          <Button type="button" variant="outline" className="w-full justify-start gap-2" onClick={() => fileRef.current?.click()}>
            <UploadCloud className="size-4" />
            {form.documentName ? form.documentName : "Upload document image (encoded base64)"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field id="subjectId" label="Patient / Staff ID" placeholder="ICU-STF-0091" value={form.subjectId ?? ""} onChange={set("subjectId")} />
      <Field id="biometricHash" label="Biometric hash" placeholder="b7f2a91c0d…" value={form.biometricHash ?? ""} onChange={set("biometricHash")} />
      <Field
        id="behavioral"
        label="Behavioral pattern (float array)"
        placeholder="0.12, 0.87, 0.34, 0.05"
        value={form.behavioral ?? ""}
        onChange={set("behavioral")}
        className="font-mono"
      />
      <Field id="wallet" label="Ritual Chain wallet (optional)" placeholder="0x…" value={form.wallet ?? ""} onChange={set("wallet")} className="font-mono" />
    </div>
  );
}
