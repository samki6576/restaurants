'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { restaurants, getTimeSlots } from '@/lib/mockData'
import { TimeSlot } from '@/lib/types'
import { ArrowLeft, Clock, Check } from 'lucide-react'

export default function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const restaurant = restaurants.find((r) => r.id === id)
  const timeSlots = getTimeSlots(id)

  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    party_size: '2',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  if (!restaurant) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-muted text-lg mb-4">Restaurant not found</p>
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

  const handleBooking = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))
    setIsSubmitting(false)
    setBookingSuccess(true)

    setTimeout(() => {
      setShowModal(false)
      setBookingSuccess(false)
      setFormData({ name: '', phone: '', party_size: '2' })
      setSelectedSlot(null)
    }, 1500)
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
            <div className="text-5xl">{restaurant.emoji}</div>
            <div>
              <h1 className="text-4xl font-bold text-text-primary mb-2">
                {restaurant.name}
              </h1>
              <div className="flex items-center gap-4 text-text-muted">
                <span className="text-lg">{restaurant.cuisine}</span>
                <span>•</span>
                <span>{restaurant.location}</span>
              </div>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2 mt-6">
            <div className="w-2 h-2 bg-success rounded-full pulse-dot"></div>
            <span className="font-medium text-text-primary">
              Available tables
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
                      {slot.slot_time}
                    </span>
                  </div>

                  <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusColor} mb-3`}>
                    {status}
                  </div>

                  <div className="text-sm text-text-muted mb-3">
                    {availableSeats} of {slot.capacity}
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
                  Booking Confirmed!
                </h3>
                <p className="text-text-muted">
                  Your table at{' '}
                  <span className="font-semibold">{restaurant.name}</span> is
                  reserved.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-text-primary mb-1">
                  Confirm Booking
                </h3>
                <p className="text-text-muted text-sm mb-6">
                  We&apos;ll hold this table for 15 minutes.
                </p>

                <div className="space-y-4 mb-6">
                  {/* Name */}
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

                  {/* Phone */}
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

                  {/* Party Size */}
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

                  {/* Booking Details */}
                  <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
                    <div className="text-sm text-text-muted mb-2">
                      <strong className="text-text-primary">Restaurant:</strong>{' '}
                      {restaurant.name}
                    </div>
                    <div className="text-sm text-text-muted mb-2">
                      <strong className="text-text-primary">Time:</strong>{' '}
                      {selectedSlot?.slot_time}
                    </div>
                    <div className="text-sm text-text-muted">
                      <strong className="text-text-primary">Duration:</strong>{' '}
                      15 minutes hold
                    </div>
                  </div>
                </div>

                {/* Buttons */}
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

