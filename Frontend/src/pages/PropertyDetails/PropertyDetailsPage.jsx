import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../Home/components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { apiRequest } from '../../lib/api'
import LoadingScreen from '../../components/LoadingScreen'
import { getPropertySpecCategory } from '../../constants/propertyTypes'

function IconBadge({ children }) {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-(--color-secondary-bg) text-(--color-primary)">
      {children}
    </span>
  )
}

function SpecIcon({ label }) {
  const normalized = String(label || '').toLowerCase()

  if (normalized.includes('bhk') || normalized.includes('unit')) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z" />
      </svg>
    )
  }

  if (normalized.includes('bath') || normalized.includes('washroom')) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 12h16" />
        <path d="M7 12V6a3 3 0 1 1 6 0v1" />
        <path d="M5 12v4a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-4" />
      </svg>
    )
  }

  if (normalized.includes('balcon') || normalized.includes('facing')) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 6h16M6 6v12m12-12v12" />
        <path d="M4 18h16" />
      </svg>
    )
  }

  if (normalized.includes('area') || normalized.includes('plot') || normalized.includes('length') || normalized.includes('width')) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M8 8h8v8H8z" />
      </svg>
    )
  }

  if (normalized.includes('floor')) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 20h16" />
        <path d="M6 20V6h12v14" />
        <path d="M9 10h2m4 0h-2m-4 4h2m4 0h-2" />
      </svg>
    )
  }

  if (normalized.includes('parking') || normalized.includes('car')) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 19V9a3 3 0 0 1 3-3h3a4 4 0 0 1 0 8H9" />
        <path d="M6 19h12" />
      </svg>
    )
  }

  if (normalized.includes('furnish') || normalized.includes('pantry')) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 20V9h12v11" />
        <path d="M8 9V5h8v4" />
        <path d="M6 20h12" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l2.5 2.5" />
    </svg>
  )
}

function AmenityIcon({ amenity }) {
  const normalized = String(amenity || '').toLowerCase().replace(/[_-]+/g, ' ').trim()

  if (normalized.includes('gym')) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 10v4m18-4v4M7 8v8m10-8v8" />
        <path d="M3 12h4m10 0h4M7 12h10" />
      </svg>
    )
  }

  if (normalized.includes('pool')) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 16c1 0 1.5-1 3-1s2 1 3 1 1.5-1 3-1 2 1 3 1 1.5-1 3-1" />
        <path d="M7 11V6h4" />
      </svg>
    )
  }

  if (normalized.includes('park') || normalized.includes('garden') || normalized.includes('green')) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 20v-6" />
        <path d="M12 14c-3 0-5-2.2-5-5 0-1.7 1-3.4 2.5-4.2C10.3 6.5 11 8 12 8c1 0 1.7-1.5 2.5-3.2C16 5.6 17 7.3 17 9c0 2.8-2 5-5 5Z" />
      </svg>
    )
  }

  if (normalized.includes('security') || normalized.includes('cctv')) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="m12 3 7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" />
      </svg>
    )
  }

  if (normalized.includes('lift') || normalized.includes('elevator')) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="6" y="4" width="12" height="16" rx="2" />
        <path d="M10 8h4m-4 4h4m-2 4v-1" />
      </svg>
    )
  }

  if (normalized.includes('parking') || normalized.includes('car')) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 19V9a3 3 0 0 1 3-3h3a4 4 0 0 1 0 8H9" />
        <path d="M6 19h12" />
      </svg>
    )
  }

  if (normalized.includes('power')) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M13 2 7 13h5l-1 9 6-11h-5Z" />
      </svg>
    )
  }

  if (normalized.includes('water') || normalized.includes('rainwater')) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3c3 4 5 6.5 5 9a5 5 0 1 1-10 0c0-2.5 2-5 5-9Z" />
      </svg>
    )
  }

  if (normalized.includes('wifi') || normalized.includes('internet')) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 9a12 12 0 0 1 16 0" />
        <path d="M7 12a8 8 0 0 1 10 0" />
        <path d="M10 15a4 4 0 0 1 4 0" />
        <circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" />
      </svg>
    )
  }

  if (normalized.includes('ac') || normalized.includes('air conditioning')) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="6" width="16" height="4" rx="1" />
        <path d="M8 14v4m4-4v6m4-6v4" />
      </svg>
    )
  }

  if (normalized.includes('play') || normalized.includes('kids')) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 18h14" />
        <path d="M7 18V8m10 10V8" />
        <path d="M7 8h10" />
        <path d="M12 8V5" />
      </svg>
    )
  }

  if (normalized.includes('club') || normalized.includes('party')) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 4v16" />
        <path d="M6 5c3 0 3-2 6-2s3 2 6 2v8c-3 0-3-2-6-2s-3 2-6 2" />
      </svg>
    )
  }

  if (normalized.includes('fire')) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3c2 2.3 4 4.3 4 7a4 4 0 1 1-8 0c0-1.4.6-2.6 1.5-3.8" />
        <path d="M12 12c1.4 1.2 2 2.3 2 3.5a2 2 0 1 1-4 0c0-.8.3-1.5.9-2.3" />
      </svg>
    )
  }

  if (normalized.includes('ev')) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 5h6l2 4v7a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V9l2-4Z" />
        <path d="M12 9v3m0 0 2-2m-2 2-2-2" />
      </svg>
    )
  }

  if (normalized.includes('pet')) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 19c3 0 5-2 5-4 0-1.7-1-2.8-2.5-2.8-.9 0-1.7.4-2.5 1.1-.8-.7-1.6-1.1-2.5-1.1C8 12.2 7 13.3 7 15c0 2 2 4 5 4Z" />
        <circle cx="8" cy="8" r="1.4" />
        <circle cx="11" cy="6.5" r="1.4" />
        <circle cx="13" cy="6.5" r="1.4" />
        <circle cx="16" cy="8" r="1.4" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3 14.8 8.7 21 9.6l-4.5 4.4 1.1 6.2L12 17.2 6.4 20.2 7.5 14 3 9.6l6.2-.9Z" />
    </svg>
  )
}

function formatPriceValue(value) {
  if (value === undefined || value === null || value === '') {
    return 'Price on request'
  }

  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return String(value)
  }

  return `INR ${parsed.toLocaleString('en-IN')}`
}

function formatPrice(property) {
  if (!property) return 'Price on request'

  if (property.listingType === 'rent') {
    const monthlyRent = property?.rentDetails?.monthlyRent ?? property.price
    const formatted = formatPriceValue(monthlyRent)
    return formatted === 'Price on request' ? formatted : `${formatted} / month`
  }

  return formatPriceValue(property.price)
}

function formatSecurityDeposit(property) {
  const deposit = property?.rentDetails?.securityDeposit
  if (deposit === undefined || deposit === null || deposit === '') {
    return 'N/A'
  }

  return formatPriceValue(deposit)
}

function formatPossessionStatus(status) {
  if (status === 'under_construction') {
    return 'Under Construction'
  }

  return 'Ready To Move'
}

function getSpecRows(property) {
  if (!property?.specifications) {
    return []
  }

  const specCategory = getPropertySpecCategory(property.propertyType)

  if (specCategory === 'plot' && property.specifications.plot) {
    const plot = property.specifications.plot
    return [
      ['Plot Area', plot.plotArea ? `${plot.plotArea} sq ft` : ''],
      ['Length', plot.length],
      ['Width', plot.width],
      ['Boundary Wall', plot.boundaryWall ? 'Yes' : 'No'],
      ['Corner Plot', plot.cornerPlot ? 'Yes' : 'No']
    ]
  }

  if (specCategory === 'commercial' && property.specifications.commercial) {
    const commercial = property.specifications.commercial
    return [
      ['Property Use', commercial.propertyUse],
      ['Floor', commercial.floor],
      ['Washrooms', commercial.washrooms],
      ['Pantry', commercial.pantry ? 'Yes' : 'No'],
      ['Furnished Status', commercial.furnishedStatus]
    ]
  }

  if (property.specifications.residential) {
    const residential = property.specifications.residential
    return [
      ['BHK', residential.bhk],
      ['Bathrooms', residential.bathrooms],
      ['Balconies', residential.balconies],
      ['Super Built-up Area', residential.superBuiltUpArea ? `${residential.superBuiltUpArea} sq ft` : ''],
      ['Carpet Area', residential.carpetArea ? `${residential.carpetArea} sq ft` : ''],
      ['Furnishing', residential.furnishing],
      ['Floor Number', residential.floorNumber],
      ['Total Floors', residential.totalFloors],
      ['Property Age', residential.propertyAge ? `${residential.propertyAge} year(s)` : ''],
      ['Facing', residential.facing],
      ['Parking Available', residential.parking?.available ? 'Yes' : 'No'],
      ['Parking Type', residential.parking?.type]
    ]
  }

  return []
}

function getAddressLine(property) {
  return [
    property?.address,
    property?.locality,
    property?.city,
    property?.state,
    property?.pincode,
  ]
    .filter(Boolean)
    .join(', ')
}

function buildGoogleMapEmbedUrl(googleMapsLink, addressLine) {
  const rawLink = String(googleMapsLink || '').trim()

  if (rawLink) {
    if (rawLink.includes('/maps/embed')) {
      return rawLink
    }

    try {
      const parsedUrl = new URL(rawLink)
      const q = parsedUrl.searchParams.get('q')
      if (q) {
        return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`
      }
    } catch {
      // Fall through and treat the entire value as search query
    }

    return `https://www.google.com/maps?q=${encodeURIComponent(rawLink)}&output=embed`
  }

  if (!addressLine) {
    return ''
  }

  return `https://www.google.com/maps?q=${encodeURIComponent(addressLine)}&output=embed`
}

function getYoutubeEmbedUrl(rawUrl) {
  const source = String(rawUrl || '').trim()
  if (!source) return ''

  try {
    const parsed = new URL(source)

    if (parsed.hostname.includes('youtu.be')) {
      const videoId = parsed.pathname.slice(1).split('/')[0]
      return videoId ? `https://www.youtube.com/embed/${videoId}` : ''
    }

    if (parsed.hostname.includes('youtube.com')) {
      if (parsed.pathname.includes('/embed/')) {
        return source
      }

      if (parsed.pathname.includes('/shorts/')) {
        const videoId = parsed.pathname.split('/shorts/')[1]?.split('/')[0]
        return videoId ? `https://www.youtube.com/embed/${videoId}` : ''
      }

      const videoId = parsed.searchParams.get('v')
      return videoId ? `https://www.youtube.com/embed/${videoId}` : ''
    }
  } catch {
    return ''
  }

  return ''
}

function getEmbeddableMedia(rawUrl) {
  const source = String(rawUrl || '').trim()
  if (!source) {
    return { type: 'none', src: '' }
  }

  const lowerUrl = source.toLowerCase()
  if (lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg') || lowerUrl.endsWith('.png') || lowerUrl.endsWith('.webp') || lowerUrl.endsWith('.gif')) {
    return { type: 'image', src: source }
  }

  const youtubeEmbedUrl = getYoutubeEmbedUrl(source)
  if (youtubeEmbedUrl) {
    return { type: 'youtube', src: youtubeEmbedUrl }
  }

  if (lowerUrl.endsWith('.mp4') || lowerUrl.endsWith('.webm') || lowerUrl.endsWith('.ogg')) {
    return { type: 'video', src: source }
  }

  try {
    const parsed = new URL(source)
    if (parsed.hostname.includes('drive.google.com') && parsed.pathname.includes('/file/d/')) {
      const fileId = parsed.pathname.split('/file/d/')[1]?.split('/')[0]
      if (fileId) {
        return { type: 'iframe', src: `https://drive.google.com/file/d/${fileId}/preview` }
      }
    }
  } catch {
    return { type: 'link', src: source }
  }

  return { type: 'iframe', src: source }
}

const PropertyDetailsPage = () => {
  const { propertyId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, token, user } = useAuth()

  const [property, setProperty] = useState(null)
  const [activeImage, setActiveImage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [isSubmittingLead, setIsSubmittingLead] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadProperty = async () => {
      setIsLoading(true)
      setError('')

      try {
        const response = await apiRequest(`/properties/${propertyId}`)
        const propertyData = response?.data || null

        if (!isMounted) {
          return
        }

        setProperty(propertyData)
        const firstImage = Array.isArray(propertyData?.images) && propertyData.images.length > 0
          ? propertyData.images[0]
          : ''
        setActiveImage(firstImage)
      } catch (loadError) {
        if (!isMounted) {
          return
        }
        setError(loadError.message || 'Failed to load property details')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProperty()

    return () => {
      isMounted = false
    }
  }, [propertyId])

  const specRows = useMemo(() => getSpecRows(property), [property])

  const imageList = useMemo(() => {
    if (!Array.isArray(property?.images)) {
      return []
    }

    return property.images.filter(Boolean)
  }, [property])

  const videoList = useMemo(() => {
    if (!Array.isArray(property?.videos)) {
      return []
    }

    return property.videos.filter(Boolean)
  }, [property])

  const amenities = useMemo(() => {
    if (!Array.isArray(property?.amenities)) {
      return []
    }

    return property.amenities.filter(Boolean)
  }, [property])

  const unitConfigurations = useMemo(() => {
    if (!Array.isArray(property?.unitConfigurations)) {
      return []
    }

    return property.unitConfigurations
      .filter((unit) => unit && unit.price !== undefined && unit.price !== null)
  }, [property])

  const addressLine = useMemo(() => getAddressLine(property), [property])

  const mapsSrc = useMemo(() => {
    return buildGoogleMapEmbedUrl(property?.googleMapsLink, addressLine)
  }, [property?.googleMapsLink, addressLine])

  const embeddedVideos = useMemo(() => {
    return videoList.map((videoUrl) => ({
      originalUrl: videoUrl,
      ...getEmbeddableMedia(videoUrl),
    }))
  }, [videoList])

  const handleLoginForCallback = () => {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`)
    navigate(`/auth?redirect=${redirect}`)
  }

  const handleGetConnected = async () => {
    if (!property) {
      return
    }

    if (!isAuthenticated || !token) {
      handleLoginForCallback()
      return
    }

    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim()
    const mobileNumber = String(user?.phone || '').replace(/\D/g, '').slice(0, 10)
    const whatsappNumber = String(user?.whatsappNumber || user?.phone || '').replace(/\D/g, '').slice(0, 10)
    const email = String(user?.email || '').trim()

    if (!fullName) {
      setStatusMessage('Please update your profile name before requesting callback.')
      return
    }

    if (!/^[0-9]{10}$/.test(mobileNumber)) {
      setStatusMessage('Please update a valid 10-digit phone number in your profile.')
      return
    }

    setIsSubmittingLead(true)
    setStatusMessage('')

    try {
      await apiRequest('/interests', {
        method: 'POST',
        token,
        body: {
          name: fullName,
          mobileNumber,
          email: email || undefined,
          whatsappNumber: /^[0-9]{10}$/.test(whatsappNumber) ? whatsappNumber : mobileNumber,
          message: `Interested in ${property.title} (${property.listingType})`,
          propertyId: property._id
        }
      })

      setStatusMessage('Your details were shared successfully. Seller/admin will contact you soon.')
    } catch (leadError) {
      setStatusMessage(leadError.message || 'Could not submit your request')
    } finally {
      setIsSubmittingLead(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-(--color-surface)">
        <Navbar />
        <div className="mx-auto w-[92%] max-w-6xl py-10">
          <LoadingScreen label="Loading Property" sublabel="Preparing complete property details" />
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-(--color-surface)">
        <Navbar />
        <div className="mx-auto w-[92%] max-w-6xl py-10">
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700 shadow-sm">{error || 'Property not found'}</div>
          <Link to="/" className="mt-4 inline-block rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-[#f8fbff] to-[#eef4ff]">
      <Navbar />

      <section className="mx-auto w-[92%] max-w-7xl py-8">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] lg:p-7">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-(--color-primary)/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-20 h-44 w-44 rounded-full bg-(--color-secondary-bg) blur-3xl" />

          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--color-secondary-text)">Verified Listing</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900 lg:text-4xl">{property.title}</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">{addressLine || 'Address not available'}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white">
                  {property.listingType === 'rent' ? 'For Rent' : 'For Sale'}
                </span>
                <span className="rounded-full bg-(--color-secondary-bg) px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-(--color-primary)">
                  {property.propertyType}
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                  {unitConfigurations.length > 0 ? `${unitConfigurations.length} Unit Options` : 'Single Unit'}
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-(--color-secondary-bg) px-4 py-3 text-right shadow-sm">
              <p className="text-xs uppercase tracking-wide text-(--color-secondary-text)">{property.listingType === 'rent' ? 'Rent / month' : (unitConfigurations.length > 0 ? 'Starting from' : 'Price')}</p>
              <p className="mt-1 text-2xl font-semibold text-(--color-primary)">{formatPrice(property)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-[92%] max-w-7xl gap-6 pb-8 lg:h-[calc(100vh-5.5rem)] lg:grid-cols-[1.4fr_0.8fr] lg:items-start lg:overflow-hidden">
        <div className="space-y-6 lg:h-full lg:overflow-y-auto lg:pr-2 lg:pb-6">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="aspect-video bg-slate-100">
              {activeImage ? (
                <img src={activeImage} alt={property.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">No images available</div>
              )}
            </div>

            {imageList.length > 0 ? (
              <div className="grid grid-cols-3 gap-3 p-4 sm:grid-cols-5 lg:grid-cols-6">
                {imageList.map((image) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setActiveImage(image)}
                    className={`overflow-hidden rounded-xl border transition ${activeImage === image ? 'border-(--color-primary) ring-2 ring-(--color-secondary-bg)' : 'border-slate-200'}`}
                  >
                    <img src={image} alt="Property" className="h-20 w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-7">
            <h2 className="text-2xl font-semibold text-slate-900">Description</h2>
            <p className="mt-4 text-base leading-8 text-slate-700">{property.description || 'No description provided.'}</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-7">
            <h2 className="text-2xl font-semibold text-slate-900">Listing Info</h2>
            <div className="mt-4 grid gap-3 text-base text-slate-700 sm:grid-cols-2">
              <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 capitalize"><span className="font-semibold text-slate-900">Type:</span> {property.propertyType}</p>
              <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 capitalize"><span className="font-semibold text-slate-900">Purpose:</span> {property.listingType === 'rent' ? 'rent' : 'sell'}</p>
              {property.listingType === 'rent' ? (
                <>
                  <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"><span className="font-semibold text-slate-900">Monthly Rent:</span> {formatPrice(property)}</p>
                  <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"><span className="font-semibold text-slate-900">Deposit Required:</span> {property?.rentDetails?.depositRequired ? 'Yes' : 'No'}</p>
                  <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:col-span-2"><span className="font-semibold text-slate-900">Security Deposit:</span> {property?.rentDetails?.depositRequired ? formatSecurityDeposit(property) : 'Not required'}</p>
                </>
              ) : null}
              <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"><span className="font-semibold text-slate-900">Ownership:</span> {property.ownershipType || 'N/A'}</p>
              <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"><span className="font-semibold text-slate-900">Possession Status:</span> {formatPossessionStatus(property.possessionStatus)}</p>
              <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:col-span-2"><span className="font-semibold text-slate-900">Expected Possession Date:</span> {property.possessionDate ? new Date(property.possessionDate).toLocaleDateString() : 'N/A'}</p>
              <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:col-span-2"><span className="font-semibold text-slate-900">Available From:</span> {property.availableFrom ? new Date(property.availableFrom).toLocaleDateString() : 'Immediate / Not specified'}</p>
              <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"><span className="font-semibold text-slate-900">Views:</span> {property.viewsCount ?? 0}</p>
              <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"><span className="font-semibold text-slate-900">Posted:</span> {property.createdAt ? new Date(property.createdAt).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>

          {unitConfigurations.length > 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-7">
              <h2 className="text-2xl font-semibold text-slate-900">Unit Options and Pricing</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-2 text-base text-slate-700">
                  <thead>
                    <tr className="text-left text-sm uppercase tracking-wide text-slate-500">
                      <th className="px-3 py-1">Unit</th>
                      <th className="px-3 py-1">BHK</th>
                      <th className="px-3 py-1">Size</th>
                      <th className="px-3 py-1">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unitConfigurations.map((unit, index) => (
                      <tr key={`${unit.unitLabel || 'unit'}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50">
                        <td className="rounded-l-xl px-3 py-2.5 font-semibold text-slate-900">{unit.unitLabel || `Unit ${index + 1}`}</td>
                        <td className="px-3 py-2.5">{unit.bhk ? `${unit.bhk} BHK` : '-'}</td>
                        <td className="px-3 py-2.5">{unit.sizeSqFt ? `${unit.sizeSqFt} sq ft` : '-'}</td>
                        <td className="rounded-r-xl px-3 py-2.5 font-semibold text-(--color-primary)">{formatPriceValue(unit.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-7">
            <h2 className="text-2xl font-semibold text-slate-900">Specifications</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {specRows.length > 0 ? specRows
                .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
                .map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
                    <div className="flex items-start gap-3">
                      <IconBadge>
                        <SpecIcon label={label} />
                      </IconBadge>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
                        <p className="mt-1 text-base font-semibold text-slate-900 capitalize">{String(value)}</p>
                      </div>
                    </div>
                  </div>
                )) : (
                <p className="text-sm text-slate-600">Specification details are not available.</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-7">
            <h2 className="text-2xl font-semibold text-slate-900">Amenities</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {amenities.length > 0 ? amenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-base text-slate-700">
                  <span className="text-(--color-primary)">
                    <AmenityIcon amenity={amenity} />
                  </span>
                  <span className="font-medium">{amenity}</span>
                </div>
              )) : <p className="text-sm text-slate-600">No amenities were listed.</p>}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-7">
            <h2 className="text-2xl font-semibold text-slate-900">Videos</h2>

            <div className="mt-5 space-y-4">
              {embeddedVideos.length > 0 ? embeddedVideos.map((video, index) => (
                <div key={`${video.originalUrl}-${index}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  {video.type === 'video' ? (
                    <video src={video.src} className="aspect-video w-full bg-black object-cover" controls preload="metadata" />
                  ) : video.type === 'image' ? (
                    <img src={video.src} alt={`Property media ${index + 1}`} className="aspect-video w-full bg-slate-100 object-cover" />
                  ) : video.type === 'youtube' || video.type === 'iframe' ? (
                    <iframe
                      title={`Property video ${index + 1}`}
                      src={video.src}
                      className="aspect-video w-full bg-white"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <div className="p-4">
                      <p className="text-sm text-slate-600">This video cannot be embedded. Open it in a new tab.</p>
                    </div>
                  )}

                  <div className="border-t border-slate-200 px-4 py-2.5 text-right">
                    <a
                      href={video.originalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-(--color-primary) hover:underline"
                    >
                      Open Source Link
                    </a>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-slate-600">No videos have been added for this property.</p>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-6 lg:h-full lg:overflow-hidden">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:h-full lg:overflow-hidden">
            <h2 className="text-2xl font-semibold text-slate-900">Location and Map</h2>
            <p className="mt-3 text-base text-slate-700">{addressLine || 'Address not available'}</p>

            {mapsSrc ? (
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                <iframe
                  title="Property location map"
                  src={mapsSrc}
                  className="h-72 w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ) : null}

            <div className="mt-5 rounded-2xl border border-(--color-secondary-bg) bg-(--color-secondary-bg) p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-(--color-primary)">Instant Callback</p>

              {!isAuthenticated ? (
                <>
                  <p className="mt-2 text-base text-slate-700">Please login first. Your profile details will be shared directly, so no form is needed.</p>
                  <button
                    type="button"
                    onClick={handleLoginForCallback}
                    className="mt-3 w-full rounded-2xl bg-(--color-primary) px-4 py-3 text-base font-semibold text-white transition hover:brightness-95"
                  >
                    Login to Get Connected
                  </button>
                </>
              ) : (
                <>
                  <p className="mt-2 text-base text-slate-700">Click once and we will share your account details with seller/admin instantly.</p>
                  <button
                    type="button"
                    onClick={handleGetConnected}
                    disabled={isSubmittingLead}
                    className="mt-3 w-full rounded-2xl bg-(--color-cta-orange) px-4 py-3 text-base font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmittingLead ? 'Submitting...' : 'Get Connected Now'}
                  </button>
                </>
              )}

              {statusMessage ? <p className="mt-2 text-base text-slate-700">{statusMessage}</p> : null}
            </div>
          </div>
        </aside>
      </section>
    </div>
  )
}

export default PropertyDetailsPage