import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'

const LIKED_PROPERTIES_STORAGE_KEY = 'cityploter_liked_properties'

function getPropertyStorageId(property) {
  return property?._id || property?.id || property?.slug || property?.title || ''
}

function readLikedProperties() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(LIKED_PROPERTIES_STORAGE_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveLikedProperties(list) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(LIKED_PROPERTIES_STORAGE_KEY, JSON.stringify(list))
}

function toCompactIndianPrice(value) {
  const amount = Number(String(value ?? '').replace(/[^0-9.]/g, ''))

  if (!Number.isFinite(amount) || amount <= 0) {
    return ''
  }

  const compact = (num, divisor, suffix) => {
    const shortValue = num / divisor
    const rounded = shortValue >= 100 ? Math.round(shortValue) : Math.round(shortValue * 10) / 10
    return `${Number.isInteger(rounded) ? rounded : rounded}${suffix}`
  }

  if (amount >= 10000000) {
    return compact(amount, 10000000, 'Cr')
  }

  if (amount >= 100000) {
    return compact(amount, 100000, 'L')
  }

  if (amount >= 1000) {
    return compact(amount, 1000, 'K')
  }

  return `${Math.round(amount)}`
}

function formatPrice(property) {
  if (!property) {
    return 'Price on request'
  }

  if (property.listingType === 'rent') {
    const monthlyRent = property?.rentDetails?.monthlyRent ?? property.price
    const compactRent = toCompactIndianPrice(monthlyRent)
    if (compactRent) {
      return `${compactRent}/month`
    }

    return monthlyRent ? `${monthlyRent}/month` : 'Rent on request'
  }

  if (property.priceLabel) {
    const compactLabel = toCompactIndianPrice(property.priceLabel)
    return compactLabel || property.priceLabel
  }

  if (typeof property.price === 'number') {
    const compactPrice = toCompactIndianPrice(property.price)
    return compactPrice || 'Price on request'
  }

  if (property.price) {
    const compactPrice = toCompactIndianPrice(property.price)
    return compactPrice || property.price
  }

  return 'Price on request'
}

function getPrimarySpecs(property) {
  const residential = property?.specifications?.residential
  const commercial = property?.specifications?.commercial
  const plot = property?.specifications?.plot

  const specs = []

  if (residential?.bhk) specs.push(`${residential.bhk} BHK`)
  if (residential?.bathrooms) specs.push(`${residential.bathrooms} Bath`)
  if (residential?.superBuiltUpArea) specs.push(`${residential.superBuiltUpArea} sq ft`)

  if (commercial?.propertyUse) specs.push(String(commercial.propertyUse).replace(/^./, (c) => c.toUpperCase()))
  if (commercial?.washrooms) specs.push(`${commercial.washrooms} Washroom`)

  if (plot?.plotArea) specs.push(`Plot ${plot.plotArea} sq ft`)

  return specs.slice(0, 3)
}

function formatPostedTime(value) {
  if (!value) {
    return 'Recently listed'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Recently listed'
  }

  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const PropertyCard = ({ property, onViewDetails }) => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const isCardClickable = typeof onViewDetails === 'function'
  const propertyId = getPropertyStorageId(property)
  const [isFavorite, setIsFavorite] = useState(() => {
    const liked = readLikedProperties()
    return liked.some((item) => item.id === propertyId)
  })
  const [authNotice, setAuthNotice] = useState('')
  const image = property.images && property.images.length > 0
    ? property.images[0]
    : property.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80'

  const location = property.location || [property.locality, property.city].filter(Boolean).join(', ') || property.city || 'Location not available'
  const postedBy = property.postedBy || (property.createdBy?.firstName ? `${property.createdBy.firstName} ${property.createdBy.lastName || ''}`.trim() : 'Verified Seller')
  const time = property.time || formatPostedTime(property.createdAt)
  const specs = getPrimarySpecs(property)
  const amenities = Array.isArray(property?.amenities) ? property.amenities.slice(0, 3) : []

  const handleFavoriteToggle = (event) => {
    event.preventDefault()
    event.stopPropagation()

    if (!isAuthenticated) {
      setAuthNotice('Please login to like this property.')
      const redirectTo = typeof window !== 'undefined'
        ? `${window.location.pathname}${window.location.search}`
        : '/'
      navigate(`/auth?redirect=${encodeURIComponent(redirectTo)}`)
      return
    }

    const liked = readLikedProperties()
    const alreadyLiked = liked.some((item) => item.id === propertyId)

    if (alreadyLiked) {
      const next = liked.filter((item) => item.id !== propertyId)
      saveLikedProperties(next)
      setIsFavorite(false)
      setAuthNotice('')
      return
    }

    const next = [
      {
        id: propertyId,
        title: property?.title || 'Property',
        city: property?.city || '',
        locality: property?.locality || '',
        propertyType: property?.propertyType || '',
        listingType: property?.listingType || '',
        price: property?.price,
        images: Array.isArray(property?.images) ? property.images : [],
        createdAt: property?.createdAt || new Date().toISOString(),
      },
      ...liked,
    ].slice(0, 100)

    saveLikedProperties(next)
    setIsFavorite(true)
    setAuthNotice('')
  }

  const handleCardOpen = () => {
    if (!isCardClickable) {
      return
    }

    onViewDetails(property)
  }

  return (
    <article
      className={`group relative w-72 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:w-80 lg:w-96 ${
        isCardClickable ? 'cursor-pointer' : 'cursor-default'
      }`}
      onClick={handleCardOpen}
      onKeyDown={(event) => {
        if (!isCardClickable) {
          return
        }

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onViewDetails(property)
        }
      }}
      role={isCardClickable ? 'button' : undefined}
      tabIndex={isCardClickable ? 0 : undefined}
      aria-label={isCardClickable ? `Open details for ${property?.title || 'property'}` : undefined}
    >
      <div className="pointer-events-none absolute inset-x-6 top-0 h-20 -translate-y-1/2 rounded-full bg-(--color-primary)/20 blur-2xl opacity-0 transition duration-300 group-hover:opacity-100" />

      <div className="block w-full text-left">
        <div className="relative h-52 overflow-hidden">
          <img
            src={image}
            alt={property.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
          />

          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-900/65 via-slate-900/15 to-transparent opacity-80 transition duration-300 group-hover:opacity-100" />

          <div className="absolute left-3 top-3 flex items-center gap-2">
            <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700 backdrop-blur">
              {property.listingType === 'rent' ? 'For Rent' : 'For Sale'}
            </span>
            <span className="rounded-full bg-(--color-primary)/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur">
              {property.propertyType || 'Property'}
            </span>
          </div>

          <button
            type="button"
            aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
            onClick={handleFavoriteToggle}
            className="absolute right-3 top-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm backdrop-blur transition duration-200 hover:bg-white"
          >
            <svg
              className={`h-5 w-5 transition ${isFavorite ? 'fill-rose-500 text-rose-500' : 'fill-none text-slate-700'}`}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>

          <span className="absolute bottom-3 left-3 rounded-lg bg-white px-3 py-1 text-sm font-bold text-slate-900 shadow-sm">
            {formatPrice(property)}
          </span>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onViewDetails?.(property)
            }}
            className="absolute bottom-3 right-3 cursor-pointer rounded-lg bg-(--color-cta-orange) px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-lg transition duration-200 hover:brightness-95 sm:opacity-0 sm:translate-y-2 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
          >
            View Details
          </button>
        </div>

        <div className="space-y-3 p-4">
          <h3
            className="text-base font-semibold text-slate-900"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {property.title}
          </h3>

          <p className="truncate text-sm text-(--color-secondary-text)">{location}</p>

          {specs.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {specs.map((item) => (
                <span key={item} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700">
                  {item}
                </span>
              ))}
            </div>
          ) : null}

          {amenities.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {amenities.map((amenity) => (
                <span key={amenity} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-700">
                  {String(amenity).replace(/-/g, ' ')}
                </span>
              ))}
            </div>
          ) : null}

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Posted by {postedBy}</span>
            <span>{time}</span>
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onViewDetails?.(property)
            }}
            className="w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition duration-200 hover:border-(--color-primary) hover:text-(--color-primary)"
          >
            View Complete Details
          </button>

          {authNotice ? <p className="text-xs font-medium text-amber-700">{authNotice}</p> : null}
        </div>
      </div>
    </article>
  )
}

export default PropertyCard
