import { Card, CardContent, CardHeader, CardTitle } from "@chowvest/ui";
import { Target, CheckCircle2, XCircle, PauseCircle, Activity, PiggyBank, RefreshCcw } from "lucide-react";

interface SavingCycleStatsProps {
  totalActiveValue: number;
  autoSaveAdoptionRate: number;
  cycleStatusData: { status: string; count: number }[];
  averageProgress: number;
}

export function SavingCycleStats({
  totalActiveValue,
  autoSaveAdoptionRate,
  cycleStatusData,
  averageProgress,
}: SavingCycleStatsProps) {
  const getStatusCount = (status: string) => cycleStatusData.find(c => c.status === status)?.count || 0;
  
  const activeCount = getStatusCount("ACTIVE");
  const completedCount = getStatusCount("COMPLETED");
  const cancelledCount = getStatusCount("CANCELLED") + getStatusCount("EXPIRED");
  const pausedCount = getStatusCount("PAUSED");
  
  const totalCycles = activeCount + completedCount + cancelledCount + pausedCount;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Active Value */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Locked in Savings</CardTitle>
          <PiggyBank className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₦{totalActiveValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <p className="text-xs text-muted-foreground mt-1">Across {activeCount} active cycles</p>
        </CardContent>
      </Card>

      {/* Average Progress */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Avg Cycle Progress</CardTitle>
          <Target className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{(averageProgress * 100).toFixed(1)}%</div>
          <div className="w-full bg-secondary h-2 mt-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full" style={{ width: `${Math.min(100, Math.max(0, averageProgress * 100))}%` }} />
          </div>
        </CardContent>
      </Card>

      {/* Auto-Save Adoption */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Auto-Save Adoption</CardTitle>
          <RefreshCcw className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{autoSaveAdoptionRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground mt-1">Of active cycles use auto-save</p>
        </CardContent>
      </Card>

      {/* Status Breakdown */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Cycle Status</CardTitle>
          <Activity className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 mt-1">
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground"><CheckCircle2 className="w-3.5 h-3.5 text-green-500"/> Completed</span>
              <span className="font-medium">{completedCount}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground"><Activity className="w-3.5 h-3.5 text-blue-500"/> Active</span>
              <span className="font-medium">{activeCount}</span>
            </div>
             <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground"><XCircle className="w-3.5 h-3.5 text-red-500"/> Cancelled</span>
              <span className="font-medium">{cancelledCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
