import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const repositories = db.prepare('SELECT * FROM repositories').all();
    return NextResponse.json(repositories);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Repository name required' }, { status: 400 });
    }

    const db = getDb();
    // Default starting health score for newly added repos to something healthy
    const initHealth = 100;
    
    db.prepare('INSERT INTO repositories (name, health_score) VALUES (?, ?)').run(name, initHealth);
    
    return NextResponse.json({ success: true, name, health_score: initHealth });
  } catch (error: any) {
    if (error?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return NextResponse.json({ error: 'Repository already exists' }, { status: 400 });
    }
    console.error('Add repo error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
