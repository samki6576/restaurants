import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // ✅ Lazy load the database driver ONLY at request time
  const { neon } = await import('@neondatabase/serverless');
  
  // ✅ Check environment variable exists
  if (!process.env.POSTGRES_URL) {
    return NextResponse.json(
      { error: 'POSTGRES_URL environment variable is not set' },
      { status: 500 }
    );
  }

  const sql = neon(process.env.POSTGRES_URL!);
  
  try {
    const { slotId, customerName, customerPhone, partySize } = await request.json();

    // Validate input
    if (!slotId || !customerName || !customerPhone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if slot exists and has capacity
    const slotCheck = await sql`
      SELECT capacity, booked_count 
      FROM time_slots 
      WHERE id = ${slotId}
    `;
    
    if (slotCheck.length === 0) {
      return NextResponse.json({ error: 'Slot does not exist' }, { status: 404 });
    }
    
    const current = slotCheck[0];
    
    // Check if there's room
    if (current.booked_count >= current.capacity) {
      return NextResponse.json({ error: 'This time slot is fully booked!' }, { status: 409 });
    }

    // Insert the booking
    await sql`
      INSERT INTO bookings (slot_id, customer_name, customer_phone, party_size) 
      VALUES (${slotId}, ${customerName}, ${customerPhone}, ${partySize});
    `;

    // Update the booked count
    await sql`
      UPDATE time_slots 
      SET booked_count = booked_count + 1 
      WHERE id = ${slotId};
    `;

    return NextResponse.json({ 
      success: true, 
      message: 'Table reserved successfully!' 
    });

  } catch (error: any) {
    console.error('Booking error:', error.message);
    return NextResponse.json({ 
      error: error.message || 'Booking failed' 
    }, { status: 500 });
  }
}