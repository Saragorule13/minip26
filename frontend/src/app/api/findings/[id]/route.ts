import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const db = getDb();
    const finding = db.prepare('SELECT * FROM findings WHERE id = ?').get(id);
    
    if (!finding) {
      return NextResponse.json({ error: 'Finding not found' }, { status: 404 });
    }
    
    return NextResponse.json(finding);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
