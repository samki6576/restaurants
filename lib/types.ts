export interface Restaurant {
  id: string
  name: string
  cuisine: string
  location: string
  rating: number
  emoji: string
}

export interface TimeSlot {
  id: string
  slot_time: string
  capacity: number
  booked_count: number
}

export interface Booking {
  name: string
  phone: string
  party_size: number
  restaurant_id: string
  slot_id: string
}
