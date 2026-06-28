import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const sql = neon(process.env.POSTGRES_URL!);

export async function POST(request: Request) {
  try {
    const { slotId, customerName, customerPhone, partySize } = await request.json();

    if (!slotId || !customerName || !customerPhone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await sql.begin(async (tx: any) => {
      const slotCheck = await tx`
        SELECT capacity, booked_count 
        FROM time_slots 
        WHERE id = ${slotId} 
        FOR UPDATE;
      `;
      
      if (slotCheck.length === 0) {
        throw new Error('Slot does not exist');
      }
      
      const current = slotCheck[0];
      if (current.booked_count >= current.capacity) {
        throw new Error('This time slot is fully booked!');
      }

      await tx`
        INSERT INTO bookings (slot_id, customer_name, customer_phone, party_size) 
        VALUES (${slotId}, ${customerName}, ${customerPhone}, ${partySize});
      `;

      await tx`
        UPDATE time_slots 
        SET booked_count = booked_count + 1 
        WHERE id = ${slotId};
      `;

      return { success: true };
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Table reserved successfully!' 
    });

  } catch (error: any) {
    console.error('Booking error:', error.message);
    const status = error.message.includes('fully booked') ? 409 : 500;
    return NextResponse.json({ 
      error: error.message || 'Booking failed' 
    }, { status });
  }
}