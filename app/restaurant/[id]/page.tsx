'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Clock, Check } from 'lucide-react'

// Types for our data
interface Restaurant {
  id: string
  name: string
  cuisine: string
  location: string
  rating: number
}

interface TimeSlot {
  id: string
  slot_time: string
  capacity: number
  booked_count: number
  name?: string
}

export default function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  
  // State for real data
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    party_size: '2',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  // Fetch restaurant and slots data
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        // 1. Fetch restaurant details from search API (filter by ID)
        const searchRes = await fetch(`/api/search?location=`)
        const allRestaurants = await searchRes.json()
        const found = allRestaurants.find((r: Restaurant) => r.id === id)
        
        if (!found) {
          setError('Restaurant not found')
          setLoading(false)
          return
        }
        setRestaurant(found)

        // 2. Fetch time slots for this restaurant
        const slotsRes = await fetch(`/api/slots?restaurantId=${id}`)
        const slotsData = await slotsRes.json()
        
        if (slotsRes.ok) {
          setTimeSlots(slotsData)
        } else {
          setError(slotsData.error || 'Failed to load slots')
        }
      } catch (err) {
        setError('Failed to load restaurant data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  // Handle booking
  const handleBooking = async () => {
    if (!selectedSlot) return
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: selectedSlot.id,
          customerName: formData.name,
          customerPhone: formData.phone,
          partySize: parseInt(formData.party_size),
        }),
      })

      const result = await res.json()

      if (res.ok) {
        setBookingSuccess(true)
        // Refresh slots after booking
        const slotsRes = await fetch(`/api/slots?restaurantId=${id}`)
        const slotsData = await slotsRes.json()
        if (slotsRes.ok) {
          setTimeSlots(slotsData)
        }
        setTimeout(() => {
          setShowModal(false)
          setBookingSuccess(false)
          setFormData({ name: '', phone: '', party_size: '2' })
          setSelectedSlot(null)
        }, 1500)
      } else {
        setError(result.error || 'Booking failed')
        setTimeout(() => setError(null), 3000)
      }
    } catch (err) {
      setError('Network error. Please try again.')
      console.error(err)
      setTimeout(() => setError(null), 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-text-muted mt-4">Loading restaurant...</p>
        </div>
      </main>
    )
  }

  // Error state
  if (error || !restaurant) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error || 'Restaurant not found'}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-light transition-all"
          >
            Back to Home
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-primary hover:text-primary-light transition-colors mb-6 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-start gap-4">
            <div className="text-5xl">
              {restaurant.cuisine === 'Italian' ? '🍝' :
               restaurant.cuisine === 'Japanese' ? '🍣' :
               restaurant.cuisine === 'American' ? '🍔' :
               restaurant.cuisine === 'Indian' ? '🍛' :
               restaurant.cuisine === 'French' ? '🥐' :
               restaurant.cuisine === 'Chinese' ? '🥢' : '🍽️'}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-text-primary mb-2">
                {restaurant.name}
              </h1>
              <div className="flex items-center gap-4 text-text-muted">
                <span className="text-lg">{restaurant.cuisine}</span>
                <span>•</span>
                <span>{restaurant.location}</span>
                <span>•</span>
                <span className="text-yellow-500">⭐ {restaurant.rating}</span>
              </div>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2 mt-6">
            <div className="w-2 h-2 bg-success rounded-full pulse-dot"></div>
            <span className="font-medium text-text-primary">
              {timeSlots.length > 0 ? 'Available tables' : 'No tables available'}
            </span>
          </div>
        </div>
      </div>

      {/* Time Slots Grid */}
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-text-primary mb-6">
          Select a Time Slot
        </h2>

        {timeSlots.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-lg">
            <p className="text-text-muted text-lg mb-2">
              No available slots
            </p>
            <p className="text-text-muted">
              Please check back later or try another restaurant
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {timeSlots.map((slot, index) => {
              const availableSeats = slot.capacity - slot.booked_count
              const percentageBooked =
                (slot.booked_count / slot.capacity) * 100
              const status =
                availableSeats === 0
                  ? 'Full'
                  : availableSeats <= slot.capacity / 2
                    ? 'Few left'
                    : 'Available'
              const statusColor =
                availableSeats === 0
                  ? 'bg-red-100 text-red-700'
                  : availableSeats <= slot.capacity / 2
                    ? 'bg-warning/10 text-warning'
                    : 'bg-success/10 text-success'

              return (
                <button
                  key={slot.id}
                  onClick={() => {
                    if (availableSeats > 0) {
                      setSelectedSlot(slot)
                      setShowModal(true)
                    }
                  }}
                  disabled={availableSeats === 0}
                  className={`p-4 border border-border rounded-lg transition-all ${
                    availableSeats === 0
                      ? 'bg-muted opacity-50 cursor-not-allowed'
                      : 'bg-card hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer'
                  } slide-in`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-text-muted" />
                    <span className="font-bold text-text-primary">
                      {new Date(slot.slot_time).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>

                  <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusColor} mb-3`}>
                    {status}
                  </div>

                  <div className="text-sm text-text-muted mb-3">
                    {availableSeats} of {slot.capacity} seats
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent progress-animate"
                      style={{ width: `${percentageBooked}%` }}
                    ></div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 fade-in">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 shadow-lg fade-in">
            {bookingSuccess ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-success" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">
                  Booking Confirmed! 🎉
                </h3>
                <p className="text-text-muted">
                  Your table at{' '}
                  <span className="font-semibold">{restaurant.name}</span> is
                  reserved for{' '}
                  {selectedSlot && new Date(selectedSlot.slot_time).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-text-primary mb-1">
                  Confirm Booking
                </h3>
                <p className="text-text-muted text-sm mb-6">
                  We'll hold this table for 15 minutes.
                </p>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="John Doe"
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Party Size
                    </label>
                    <select
                      value={formData.party_size}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          party_size: e.target.value,
                        })
                      }
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((size) => (
                        <option key={size} value={size}>
                          {size} {size === 1 ? 'person' : 'people'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
                    <div className="text-sm text-text-muted mb-2">
                      <strong className="text-text-primary">Restaurant:</strong>{' '}
                      {restaurant.name}
                    </div>
                    <div className="text-sm text-text-muted mb-2">
                      <strong className="text-text-primary">Time:</strong>{' '}
                      {selectedSlot && new Date(selectedSlot.slot_time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="text-sm text-text-muted">
                      <strong className="text-text-primary">Duration:</strong>{' '}
                      15 minutes hold
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 border border-border text-text-primary py-2 rounded-lg font-medium hover:bg-muted transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBooking}
                    disabled={
                      isSubmitting ||
                      !formData.name.trim() ||
                      !formData.phone.trim()
                    }
                    className={`flex-1 bg-primary text-white py-2 rounded-lg font-medium transition-all active:scale-95 ${
                      isSubmitting ||
                      !formData.name.trim() ||
                      !formData.phone.trim()
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-primary-light'
                    }`}
                  >
                    {isSubmitting ? 'Confirming...' : 'Confirm'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  )
}