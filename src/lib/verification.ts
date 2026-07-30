export type Mode = "easy" | "moderate" | "high";

export type VerificationStatus = "VERIFIED" | "FAILED" | "REVIEW REQUIRED";

export interface VerificationResult {
  id: string;
  mode: Mode;
  status: VerificationStatus;
  score: number;
  subject: string;
  timestamp: string;
  latencyMs: number;
  model: string;
  details: Record<string, string | number | string[]>;
}

export const MODEL_REGISTRY: Record<Mode, string> = {
  easy: "hf/ritual/id-classify-lite/model.onnx@8c31af2",
  moderate: "hf/ritual/doc-authenticity-v3/model.onnx@1f90bd7",
  high: "hf/ritual/behavioral-deepnet-xl/model.onnx@a47e0c9",
};

export const MODE_META = {
  easy: {
    label: "Easy",
    title: "Basic Identity Verification",
    emoji: "🟢",
    useCase: "Reception desk, visitor entry, appointment check-in",
    target: "< 1s",
  },
  moderate: {
    label: "Moderate",
    title: "Credential & Document Verification",
    emoji: "🟡",
    useCase: "Staff onboarding, pharmacy access, lab entry",
    target: "2–3s",
  },
  high: {
    label: "High Security",
    title: "Deep ML Verification",
    emoji: "🔴",
    useCase: "ICU access, controlled substance dispensing, surgery clearance",
    target: "3–5s",
  },
} as const;

const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const hex = (n: number) =>
  Array.from({ length: n }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

export const inferenceStages: Record<Mode, string[]> = {
  easy: ["Loading ONNX runtime", "Tokenizing identity fields", "Running classification", "Scoring"],
  moderate: [
    "Loading ONNX runtime",
    "Decoding document (base64)",
    "Running authenticity model",
    "Extracting credential metadata",
    "Scoring trust",
  ],
  high: [
    "Loading ONNX runtime",
    "Encoding behavioral tensor",
    "Dispatching to Ritual precompile 0x0800",
    "Deep neural inference",
    "Anomaly detection pass",
    "Anchoring result on-chain",
  ],
};

export function buildResult(mode: Mode, form: Record<string, string>, latencyMs: number): VerificationResult {
  const base = {
    id: hex(8),
    mode,
    timestamp: new Date().toISOString(),
    latencyMs,
    model: MODEL_REGISTRY[mode],
  };

  if (mode === "easy") {
    const review = Math.random() < 0.25;
    const score = review ? Math.round(rand(60, 70)) : Math.round(rand(85, 99));
    return {
      ...base,
      status: review ? "REVIEW REQUIRED" : "VERIFIED",
      score,
      subject: form.patientName || form.hospitalId || "Unknown patient",
      details: {
        "Patient name": form.patientName || "—",
        "Hospital ID": form.hospitalId || "—",
        "Date of birth": form.dob || "—",
        Phone: form.phone || "—",
        "ID format check": form.hospitalId ? "PASS" : "MISSING",
        "Cross-field consistency": review ? "PARTIAL" : "PASS",
      },
    };
  }

  if (mode === "moderate") {
    const expired = (form.licenseNumber || "").toUpperCase().startsWith("EXP");
    const suspicious = !form.document && Math.random() < 0.2;
    const status: VerificationStatus = expired ? "FAILED" : suspicious ? "REVIEW REQUIRED" : "VERIFIED";
    const score = expired ? Math.round(rand(18, 34)) : suspicious ? Math.round(rand(55, 68)) : Math.round(rand(88, 98));
    return {
      ...base,
      status,
      score,
      subject: form.staffId || "Unknown staff",
      details: {
        "Staff ID": form.staffId || "—",
        Role: form.role || "—",
        Department: form.department || "—",
        "License number": form.licenseNumber || "—",
        "Credential status": expired ? "Expired" : suspicious ? "Suspicious" : "Valid",
        "Issuing authority": "National Medical Council — Region 4",
        "Expiry date": expired ? "2023-04-18" : "2028-11-02",
        "Document attached": form.document ? `${form.document.length} bytes (base64)` : "none",
      },
    };
  }

  const bio = form.biometricHash || "";
  const highRisk = bio.length < 10;
  const risk = highRisk
    ? Math.random() < 0.3
      ? "CRITICAL"
      : "HIGH"
    : Math.random() < 0.5
      ? "LOW"
      : "MEDIUM";
  const score = risk === "CRITICAL" ? Math.round(rand(8, 20)) : highRisk ? Math.round(rand(25, 45)) : risk === "MEDIUM" ? Math.round(rand(66, 80)) : Math.round(rand(90, 99));
  const flags = highRisk
    ? ["short_biometric_entropy", "unverified_device", "off_hours_access"]
    : risk === "MEDIUM"
      ? ["new_geo_location"]
      : [];
  return {
    ...base,
    status: highRisk ? "FAILED" : risk === "MEDIUM" ? "REVIEW REQUIRED" : "VERIFIED",
    score,
    subject: form.subjectId || "Unknown subject",
    details: {
      "Subject ID": form.subjectId || "—",
      "Risk classification": risk,
      "Anomaly flags": flags.length ? flags : ["none"],
      "Behavioral vector": form.behavioral || "—",
      "Biometric hash": bio || "—",
      "Wallet address": form.wallet || "not linked",
      Precompile: "0x0800 (Ritual ONNX)",
      "Tx hash": `0x${hex(64)}`,
      "Block number": 4_820_000 + Math.floor(Math.random() * 90000),
    },
  };
}
