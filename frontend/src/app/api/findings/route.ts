import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const db = getDb();
    
    let query = 'SELECT * FROM findings';
    const conditions: string[] = [];
    const queryParams: any[] = [];
    
    const status = searchParams.get('status');
    if (status) { conditions.push('status = ?'); queryParams.push(status); }
    
    const lane = searchParams.get('lane');
    if (lane) { conditions.push('lane = ?'); queryParams.push(lane); }
    
    const severity = searchParams.get('severity');
    if (severity) { conditions.push('severity = ?'); queryParams.push(severity); }
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    const findings = db.prepare(query).all(...queryParams);
    return NextResponse.json(findings);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;
    
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }
    
    const db = getDb();
    const result = db.prepare('UPDATE findings SET status = ? WHERE id = ?').run(status, id);
    
    if (result.changes === 0) {
      return NextResponse.json({ error: 'Finding not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, id, status });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
