import { getDb } from '@/lib/db';

export type DashboardSummary = {
  totalScans: number;
  openFindings: number;
  criticalFindings: number;
  resolvedFindings: number;
};

export type DashboardTrendPoint = {
  date: string;
  findings: number;
};

export type DashboardLaneBreakdown = {
  lane: string;
  count: number;
};

export type DashboardData = {
  summary: DashboardSummary;
  severityBreakdown: Array<{ severity: string; count: number }>;
  laneBreakdown: DashboardLaneBreakdown[];
  trend: DashboardTrendPoint[];
};

export function getDashboardData(): DashboardData {
  const db = getDb();
  const totalScans = db.prepare('SELECT COUNT(*) as count FROM scans').get() as { count: number };
  const openFindings = db.prepare("SELECT COUNT(*) as count FROM findings WHERE status = 'open'").get() as { count: number };
  const criticalFindings = db.prepare("SELECT COUNT(*) as count FROM findings WHERE severity = 'critical' AND status = 'open'").get() as { count: number };
  const resolvedFindings = db.prepare("SELECT COUNT(*) as count FROM findings WHERE status = 'resolved'").get() as { count: number };

  const severityBreakdown = db.prepare("SELECT severity, COUNT(*) as count FROM findings WHERE status = 'open' GROUP BY severity").all() as Array<{
    severity: string;
    count: number;
  }>;
  const laneBreakdown = db.prepare("SELECT lane, COUNT(*) as count FROM findings WHERE status = 'open' GROUP BY lane").all() as DashboardLaneBreakdown[];

  const trend: DashboardTrendPoint[] = [
    { date: 'Mon', findings: 12 },
    { date: 'Tue', findings: 19 },
    { date: 'Wed', findings: 15 },
    { date: 'Thu', findings: 22 },
    { date: 'Fri', findings: 18 },
    { date: 'Sat', findings: 25 },
    { date: 'Sun', findings: 30 },
  ];

  return {
    summary: {
      totalScans: totalScans.count,
      openFindings: openFindings.count,
      criticalFindings: criticalFindings.count,
      resolvedFindings: resolvedFindings.count,
    },
    severityBreakdown,
    laneBreakdown,
    trend,
  };
}
