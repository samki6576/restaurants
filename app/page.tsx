'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, MapPin, Star } from 'lucide-react'

// Types for our data
interface Restaurant {
  id: string
  name: string
  cuisine: string
  location: string
  rating: number
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch all restaurants on load
  useEffect(() => {
    fetchRestaurants()
  }, [])

  const fetchRestaurants = async (location?: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const url = location ? `/api/search?location=${encodeURIComponent(location)}` : '/api/search?location='
      const res = await fetch(url)
      const data = await res.json()
      
      if (res.ok) {
        setRestaurants(data)
        if (data.length === 0 && location) {
          setError('No restaurants found in that location')
        }
      } else {
        setError(data.error || 'Failed to load restaurants')
      }
    } catch (err) {
      setError('Network error. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      fetchRestaurants(searchQuery)
    }
  }

  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      fetchRestaurants(searchQuery)
    }
  }

  // Filter restaurants (optional - API already filters)
  const filteredRestaurants = restaurants

  // Get cuisine emoji
  const getEmoji = (cuisine: string) => {
    const map: { [key: string]: string } = {
      'Italian': '🍝',
      'Japanese': '🍣',
      'Mexican': '🌮',
      'American': '🍔',
      'Indian': '🍛',
      'French': '🥐',
      'Chinese': '🥢',
      default: '🍽️'
    }
    return map[cuisine] || map.default
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-success rounded-full pulse-dot"></div>
            <span className="text-sm font-medium text-text-muted">
              Live & Available
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-text-primary mb-2">
            Find your{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Perfect Table
            </span>
          </h1>
          <p className="text-text-muted text-lg">
            Discover amazing restaurants and book in seconds
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
              <input
                type="text"
                placeholder="Search by location, cuisine, or restaurant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="w-full bg-white border border-border rounded-lg pl-12 pr-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
            <button
              onClick={handleSearchClick}
              disabled={isLoading}
              className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-light transition-all hover:scale-105 active:scale-95 flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">{isLoading ? 'Searching...' : 'Search'}</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Results Grid */}
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg overflow-hidden animate-pulse">
                <div className="h-32 bg-muted"></div>
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text-muted text-lg mb-2">No restaurants found</p>
            <p className="text-text-muted">
              Try searching by location or cuisine type
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant, index) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                emoji={getEmoji(restaurant.cuisine)}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function RestaurantCard({
  restaurant,
  emoji,
  index,
}: {
  restaurant: Restaurant
  emoji: string
  index: number
}) {
  return (
    <Link href={`/restaurant/${restaurant.id}`}>
      <div
        className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer group"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        {/* Header with gradient and emoji */}
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-6 text-center border-b border-border">
          <div className="text-5xl mb-2">{emoji}</div>
          <h2 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors">
            {restaurant.name}
          </h2>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Cuisine tag */}
          <div className="inline-block">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
              {restaurant.cuisine}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-text-muted">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{restaurant.location}</span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(restaurant.rating)
                      ? 'fill-warning text-warning'
                      : 'text-border'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-text-primary ml-1">
              {restaurant.rating}
            </span>
          </div>

          {/* Button */}
          <button className="w-full mt-4 bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary-light transition-all active:scale-95">
            View Slots
          </button>
        </div>
      </div>
    </Link>
  )
}