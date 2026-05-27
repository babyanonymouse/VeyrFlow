import { getDashboardSummary } from "@/lib/actions/summary.actions";
import NerveCenterClient, { type DashboardSummary } from "@/components/dashboard/NerveCenterClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();
  return <NerveCenterClient initialData={summary as unknown as DashboardSummary} />;
}
