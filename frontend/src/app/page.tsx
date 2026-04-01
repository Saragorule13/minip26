import { DashboardCharts } from '@/components/DashboardCharts';
import { StatCard } from '@/components/StatCard';
import { Target, ShieldCheck, AlertTriangle, Bug } from 'lucide-react';
import { getDashboardData } from '@/lib/dashboard';

export default function Dashboard() {
  const data = getDashboardData();
  const { summary, trend, laneBreakdown } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-neutral-400 mt-2">Repository security and artifact exposure summary.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Scans"
          value={summary.totalScans}
          icon={<Target size={20} />}
          trend={{ value: "+12%", isPositive: true }}
        />
        <StatCard
          title="Open Findings"
          value={summary.openFindings}
          icon={<Bug size={20} />}
          trend={{ value: "+3", isPositive: false }}
        />
        <StatCard
          title="Critical Alerts"
          value={summary.criticalFindings}
          icon={<AlertTriangle size={20} className="text-red-500" />}
          className="border-red-500/20"
        />
        <StatCard
          title="Resolved"
          value={summary.resolvedFindings}
          icon={<ShieldCheck size={20} className="text-teal-500" />}
        />
      </div>

      <DashboardCharts laneBreakdown={laneBreakdown} trend={trend} />
    </div>
  );
}
