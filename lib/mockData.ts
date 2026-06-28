import { Restaurant, TimeSlot } from './types'

export const restaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Pasta Paradise',
    cuisine: 'Italian',
    location: 'Downtown',
    rating: 4.8,
    emoji: '🍝',
  },
  {
    id: '2',
    name: 'Sushi Dreams',
    cuisine: 'Japanese',
    location: 'Midtown',
    rating: 4.9,
    emoji: '🍣',
  },
  {
    id: '3',
    name: 'Burger Haven',
    cuisine: 'American',
    location: 'Riverside',
    rating: 4.6,
    emoji: '🍔',
  },
  {
    id: '4',
    name: 'Spice Route',
    cuisine: 'Indian',
    location: 'Arts District',
    rating: 4.7,
    emoji: '🍛',
  },
  {
    id: '5',
    name: 'Le Petit Bistro',
    cuisine: 'French',
    location: 'Downtown',
    rating: 4.9,
    emoji: '🥐',
  },
  {
    id: '6',
    name: 'Dragon Wok',
    cuisine: 'Chinese',
    location: 'Chinatown',
    rating: 4.5,
    emoji: '🥢',
  },
]

export const getTimeSlots = (restaurantId: string): TimeSlot[] => {
  const baseSlots = [
    { id: '1', slot_time: '6:00 PM', capacity: 4, booked_count: 1 },
    { id: '2', slot_time: '6:15 PM', capacity: 4, booked_count: 3 },
    { id: '3', slot_time: '6:30 PM', capacity: 4, booked_count: 2 },
    { id: '4', slot_time: '6:45 PM', capacity: 4, booked_count: 0 },
    { id: '5', slot_time: '7:00 PM', capacity: 4, booked_count: 2 },
    { id: '6', slot_time: '7:15 PM', capacity: 4, booked_count: 1 },
    { id: '7', slot_time: '7:30 PM', capacity: 4, booked_count: 3 },
    { id: '8', slot_time: '7:45 PM', capacity: 4, booked_count: 0 },
    { id: '9', slot_time: '8:00 PM', capacity: 4, booked_count: 2 },
    { id: '10', slot_time: '8:30 PM', capacity: 4, booked_count: 4 },
  ]

  // Vary availability slightly per restaurant for realism
  return baseSlots.map((slot) => ({
    ...slot,
    booked_count: Math.floor(Math.random() * 5),
  }))
}
