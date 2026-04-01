import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const repo = searchParams.get('repo');
    
    const db = getDb();
    let query = 'SELECT * FROM scans ORDER BY timestamp DESC';
    let params: any[] = [];
    
    if (repo) {
      query = 'SELECT * FROM scans WHERE repo = ? ORDER BY timestamp DESC';
      params.push(repo);
    }
    
    const scans = db.prepare(query).all(...params) as any[];
    
    const enrichedScans = scans.map(scan => {
      const findingsCount = db.prepare('SELECT COUNT(*) as count FROM findings WHERE scan_id = ?').get(scan.id) as { count: number };
      const criticalCount = db.prepare("SELECT COUNT(*) as count FROM findings WHERE scan_id = ? AND severity='critical'").get(scan.id) as { count: number };
      return { ...scan, total_findings: findingsCount.count, critical_findings: criticalCount.count };
    });

    return NextResponse.json(enrichedScans);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
