import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

const sql = neon(process.env.POSTGRES_URL!);

export async function POST(request: Request) {
  const { slotId, customerName, customerPhone, partySize } = await request.json();

  try {
    // Start a transaction
    const result = await sql.begin(async (tx: any) => {
      // 1. Check availability with a lock
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
        throw new Error('This time slot is now fully booked!');
      }

      // 2. Insert the booking
      await tx`
        INSERT INTO bookings (slot_id, customer_name, customer_phone, party_size) 
        VALUES (${slotId}, ${customerName}, ${customerPhone}, ${partySize});
      `;

      // 3. Update the slot count
      await tx`
        UPDATE time_slots 
        SET booked_count = booked_count + 1 
        WHERE id = ${slotId};
      `;

      return { success: true };
    });

    return NextResponse.json({ success: true, message: 'Table reserved!' });
  } catch (error: any) {
    console.error('Booking error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 409 });
  }
}