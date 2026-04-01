import { NextResponse } from 'next/server';
import { getDashboardData } from '@/lib/dashboard';

export async function GET() {
  try {
    return NextResponse.json(getDashboardData());
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
