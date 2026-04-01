import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const settings = db.prepare('SELECT * FROM settings').all() as { key: string, value: string }[];
    const result = settings.reduce((acc, curr) => ({...acc, [curr.key]: curr.value }), {});
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const db = getDb();
    
    const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    
    const transaction = db.transaction((settings: { key: string, value: string }[]) => {
      for (const { key, value } of settings) {
        stmt.run(key, value);
      }
    });

    const settingsUpdate = Object.entries(body).map(([key, value]) => ({ key, value: String(value) }));
    transaction(settingsUpdate);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
