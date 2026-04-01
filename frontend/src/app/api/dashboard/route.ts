import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const totalScans = db.prepare('SELECT COUNT(*) as count FROM scans').get() as { count: number };
    const openFindings = db.prepare("SELECT COUNT(*) as count FROM findings WHERE status = 'open'").get() as { count: number };
    const criticalFindings = db.prepare("SELECT COUNT(*) as count FROM findings WHERE severity = 'critical' AND status = 'open'").get() as { count: number };
    const resolvedFindings = db.prepare("SELECT COUNT(*) as count FROM findings WHERE status = 'resolved'").get() as { count: number };
    
    const severityBreakdown = db.prepare('SELECT severity, COUNT(*) as count FROM findings WHERE status = "open" GROUP BY severity').all();
    const laneBreakdown = db.prepare('SELECT lane, COUNT(*) as count FROM findings WHERE status = "open" GROUP BY lane').all();
    
    // Mock trend data for the last 7 days
    const trend = [
      { date: 'Mon', findings: 12 },
      { date: 'Tue', findings: 19 },
      { date: 'Wed', findings: 15 },
      { date: 'Thu', findings: 22 },
      { date: 'Fri', findings: 18 },
      { date: 'Sat', findings: 25 },
      { date: 'Sun', findings: 30 },
    ];

    return NextResponse.json({
      summary: {
        totalScans: totalScans.count,
        openFindings: openFindings.count,
        criticalFindings: criticalFindings.count,
        resolvedFindings: resolvedFindings.count,
      },
      severityBreakdown,
      laneBreakdown,
      trend
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
