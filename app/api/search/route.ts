import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // ✅ Check if the environment variable exists
  if (!process.env.POSTGRES_URL) {
    console.error('❌ POSTGRES_URL is not defined in environment variables');
    return NextResponse.json(
      { error: 'Database connection string is missing. Please set POSTGRES_URL in Vercel environment variables.' },
      { status: 500 }
    );
  }

  const sql = neon(process.env.POSTGRES_URL!);
  
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