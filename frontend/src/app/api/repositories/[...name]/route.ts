import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request, context: { params: Promise<{ name: string[] }> }) {
  try {
    const params = await context.params;
    const name = decodeURIComponent(params.name.join('/'));
    const db = getDb();

    // 1. Get Repo Details
    const repo = db.prepare('SELECT * FROM repositories WHERE name = ?').get(name) as any;
    if (!repo) return NextResponse.json({ error: 'Repository not found' }, { status: 404 });

    // 2. Get Open Findings for this repo
    // We join with scans to filter by the repo
    const openFindings = db.prepare(`
      SELECT f.*, s.commit_hash, s.branch 
      FROM findings f 
      JOIN scans s ON f.scan_id = s.id 
      WHERE s.repo = ? AND f.status = 'open'
      ORDER BY f.id DESC
    `).all(name);

    // 3. Get Scans History for Timeline
    const scans = db.prepare('SELECT * FROM scans WHERE repo = ? ORDER BY timestamp DESC LIMIT 15').all(name) as any[];
    
    // 4. Enrich Scans to create Health Trend (Mocked calculation based on findings for demonstration)
    const trend = scans.map(scan => {
      const findingsCount = db.prepare('SELECT COUNT(*) as count FROM findings WHERE scan_id = ?').get(scan.id) as { count: number };
      const criticalCount = db.prepare("SELECT COUNT(*) as count FROM findings WHERE scan_id = ? AND severity='critical'").get(scan.id) as { count: number };
      
      // Synthesize a score point for the chart
      const pointHealth = Math.max(0, 100 - (findingsCount.count * 2) - (criticalCount.count * 10));
      return {
        date: new Date(scan.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        health: pointHealth,
        commit: scan.commit_hash.substring(0, 7),
        findings: findingsCount.count
      };
    }).reverse(); // chronological

    return NextResponse.json({
      repo,
      openFindings,
      scans,
      trend
    });
  } catch (error: any) {
    console.error('Repo detail API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
