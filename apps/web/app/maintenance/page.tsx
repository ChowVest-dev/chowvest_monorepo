import type { Metadata } from "next";
import { getMaintenanceMessage } from "@/lib/feature-flags";
import MaintenanceContent from "./MaintenanceContent";

export const metadata: Metadata = {
  title: "Chowvest — Maintenance",
  description: "We're currently performing scheduled maintenance. We'll be back shortly.",
};

export default function MaintenancePage() {
  const message = getMaintenanceMessage();

  return <MaintenanceContent message={message} />;
}
