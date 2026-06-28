import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

// 👇 THIS IS THE MAGIC FIX - Prevents build-time evaluation
export const dynamic = 'force-dynamic';

const sql = neon(process.env.POSTGRES_URL!);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location') || '';

  try {
    const rows = await sql`
      SELECT * FROM restaurants 
      WHERE location ILIKE ${'%' + location + '%'}
      ORDER BY rating DESC;
    `;
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Search error:', error.message);
    return NextResponse.json({ error: 'Failed to search restaurants' }, { status: 500 });
  }
}