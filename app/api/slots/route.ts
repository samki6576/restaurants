import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

const sql = neon(process.env.POSTGRES_URL!);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get('restaurantId');
  
  if (!restaurantId) {
    return NextResponse.json({ error: 'Missing restaurant ID' }, { status: 400 });
  }

  try {
    const rows = await sql`
      SELECT ts.*, r.name 
      FROM time_slots ts
      JOIN restaurants r ON r.id = ts.restaurant_id
      WHERE ts.restaurant_id = ${restaurantId}
      AND ts.slot_time > NOW()
      AND ts.booked_count < ts.capacity;
    `;
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Slots error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}