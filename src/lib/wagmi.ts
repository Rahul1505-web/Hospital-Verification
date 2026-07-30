import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { ritualChain } from "./chain";

export const wagmiConfig = getDefaultConfig({
  appName: "Hospital Verification System",
  projectId:
    (import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined) ??
    "3a8170812b534d0ff9d794f19a901d64",
  chains: [ritualChain],
  ssr: true,
});
