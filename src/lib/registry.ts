export type Role = "Staff" | "Patient" | "Admin";

export type StaffRecord = {
  id: string;
  wallet: string;
  staffId: string;
  email: string;
  role: Role;
  addedOn: string;
  active: boolean;
};

export type ActivityRecord = {
  id: string;
  timestamp: string;
  wallet: string;
  staffId: string;
  gate: string;
  txHash: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
};

const day = 86_400_000;
const now = Date.now();

export const INITIAL_STAFF: StaffRecord[] = [
  {
    id: "s1",
    wallet: "0x8f2a1b74c9De3a55B0Ff41a2E6c7D9013aB4C291",
    staffId: "HSP-STF-0091",
    email: "a.mensah@hospital.org",
    role: "Staff",
    addedOn: new Date(now - 21 * day).toISOString(),
    active: true,
  },
  {
    id: "s2",
    wallet: "0x1c94E7aA02Bf5d16C8a3719dE45b6F0821Ac77b3",
    staffId: "HSP-DOC-0034",
    email: "r.okoye@hospital.org",
    role: "Staff",
    addedOn: new Date(now - 17 * day).toISOString(),
    active: true,
  },
  {
    id: "s3",
    wallet: "0xB37f60Dd91cA284e5b0193Aa77Ce41f2098DdE10",
    staffId: "ICU-NRS-0012",
    email: "l.hartman@hospital.org",
    role: "Staff",
    addedOn: new Date(now - 12 * day).toISOString(),
    active: true,
  },
  {
    id: "s4",
    wallet: "0x4aD1902fC7b8e650319aB27cE4f80D1b93A6E742",
    staffId: "HSP-PAT-1188",
    email: "j.silva@mail.com",
    role: "Patient",
    addedOn: new Date(now - 6 * day).toISOString(),
    active: true,
  },
  {
    id: "s5",
    wallet: "0x92Ff30bC1a48D7e5390C6b2fA1d8471Ee0Cb5931",
    staffId: "HSP-PAT-1204",
    email: "m.iqbal@mail.com",
    role: "Patient",
    addedOn: new Date(now - 3 * day).toISOString(),
    active: false,
  },
  {
    id: "s6",
    wallet: "0x0Fa7C1d5e63B8492aD70b21fE9c3480a5D71bB08",
    staffId: "HSP-ADM-0001",
    email: "admin@hospital.org",
    role: "Admin",
    addedOn: new Date(now - 30 * day).toISOString(),
    active: true,
  },
];

export const INITIAL_ACTIVITY: ActivityRecord[] = [
  {
    id: "a1",
    timestamp: new Date(now - 2 * 3600_000).toISOString(),
    wallet: "0x8f2a1b74c9De3a55B0Ff41a2E6c7D9013aB4C291",
    staffId: "HSP-STF-0091",
    gate: "Main Gate",
    txHash: "0x7f3a91c4e0b2d8571ae3f4620cbd91847e02a5f9c73b184dd2a06e51f9a3c291",
    status: "SUCCESS",
  },
  {
    id: "a2",
    timestamp: new Date(now - 9 * 3600_000).toISOString(),
    wallet: "0xB37f60Dd91cA284e5b0193Aa77Ce41f2098DdE10",
    staffId: "ICU-NRS-0012",
    gate: "ICU Access",
    txHash: "0x2b8de10fa4c95327b0e174ad9c3f28610bd47e05a91c3f6820de7154bb90aa17",
    status: "SUCCESS",
  },
  {
    id: "a3",
    timestamp: new Date(now - 1 * day - 4 * 3600_000).toISOString(),
    wallet: "0x1c94E7aA02Bf5d16C8a3719dE45b6F0821Ac77b3",
    staffId: "HSP-DOC-0034",
    gate: "Surgery Clearance",
    txHash: "0x59ca4b0187de23f6a0b5941cd7e3801fa62b45d09e18c7530ab4f2916dd0c7e4",
    status: "SUCCESS",
  },
  {
    id: "a4",
    timestamp: new Date(now - 2 * day - 6 * 3600_000).toISOString(),
    wallet: "0x92Ff30bC1a48D7e5390C6b2fA1d8471Ee0Cb5931",
    staffId: "HSP-PAT-1204",
    gate: "Pharmacy Entry",
    txHash: "0xa41c0be7592d3f8016ba475ce019d3f7280ab5619ce407f3d2a81b640957ee23",
    status: "FAILED",
  },
  {
    id: "a5",
    timestamp: new Date(now - 4 * day - 2 * 3600_000).toISOString(),
    wallet: "0x4aD1902fC7b8e650319aB27cE4f80D1b93A6E742",
    staffId: "HSP-PAT-1188",
    gate: "Lab Access",
    txHash: "0xd07e5a913cb426f80a1d5497e3b02fc681ad9450e27b1c93f60a8d215b4e7710",
    status: "SUCCESS",
  },
  {
    id: "a6",
    timestamp: new Date(now - 6 * day - 8 * 3600_000).toISOString(),
    wallet: "0x8f2a1b74c9De3a55B0Ff41a2E6c7D9013aB4C291",
    staffId: "HSP-STF-0091",
    gate: "ICU Access",
    txHash: "0x63b1fa027ce495d8103ab74f2609de5187ca03bd4f9e2170a58c6d3491bb02f5",
    status: "PENDING",
  },
];

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateCode() {
  const raw = (globalThis.crypto?.randomUUID?.() ?? `${Math.random()}${Math.random()}`).replace(
    /[^a-zA-Z0-9]/g,
    "",
  );
  let out = "";
  for (let i = 0; i < 8; i++) {
    const n = raw.charCodeAt(i % raw.length) + i * 7;
    out += ALPHABET[n % ALPHABET.length];
  }
  return `${out.slice(0, 4)}-${out.slice(4)}`;
}

export function generateTxHash() {
  const bytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(bytes);
  return `0x${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}

export const VALID_IDS = INITIAL_STAFF.filter((s) => s.active).map((s) => s.staffId);
