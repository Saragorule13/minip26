import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const db = getDb();
    
    const scan = db.prepare('SELECT * FROM scans WHERE id = ?').get(id) as any;
    if (!scan) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
    }
    
    const findings = db.prepare('SELECT * FROM findings WHERE scan_id = ?').all(id) as any[];
    
    return NextResponse.json({ ...scan, findings });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
