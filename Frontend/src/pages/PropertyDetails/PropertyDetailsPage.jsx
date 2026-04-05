import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../Home/components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { apiRequest } from '../../lib/api'
import LoadingScreen from '../../components/LoadingScreen'
import { getPropertySpecCategory } from '../../constants/propertyTypes'

function formatPrice(property) {
  if (!property) return 'Price on request'
  if (typeof property.price === 'number') return `INR ${Number(property.price).toLocaleString('en-IN')}`
  return property.price || 'Price on request'
}

function getSpecRows(property) {
  if (!property?.specifications) {
    return []
  }

  const specCategory = getPropertySpecCategory(property.propertyType)

  if (specCategory === 'plot' && property.specifications.plot) {
    const plot = property.specifications.plot
    return [
      ['Plot Area', plot.plotArea],
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
      ['Super Built-up Area', residential.superBuiltUpArea],
      ['Carpet Area', residential.carpetArea],
      ['Furnishing', residential.furnishing],
      ['Floor Number', residential.floorNumber],
      ['Total Floors', residential.totalFloors],
      ['Property Age', residential.propertyAge],
      ['Facing', residential.facing],
      ['Parking Available', residential.parking?.available ? 'Yes' : 'No'],
      ['Parking Type', residential.parking?.type]
    ]
  }

  return []
}

const PropertyDetailsPage = () => {
  const { propertyId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, token, user } = useAuth()

  const [property, setProperty] = useState(null)
  const [activeImage, setActiveImage] = useState('')
  const [message, setMessage] = useState('')
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

  const handleGetConnected = async () => {
    if (!property) {
      return
    }

    if (!isAuthenticated) {
      window.alert('Please login to get connected with this property.')
      navigate(`/auth?redirect=${encodeURIComponent(`/properties/${property._id}`)}`)
      return
    }

    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim()
    const contactName = fullName || user?.firstName || user?.email || 'Buyer'
    const contactEmail = user?.email
    const contactPhone = user?.phone
    const whatsapp = user?.whatsappNumber || user?.phone

    if (!contactEmail || !contactPhone) {
      setStatusMessage('Please update your profile with both email and phone number to get connected.')
      return
    }

    setIsSubmittingLead(true)
    setStatusMessage('')

    try {
      await apiRequest('/interests', {
        method: 'POST',
        token,
        body: {
          name: contactName,
          mobileNumber: contactPhone,
          email: contactEmail,
          whatsappNumber: whatsapp,
          message: message || `Interested in ${property.title}`,
          propertyId: property._id
        }
      })

      setStatusMessage('Interest submitted. Admin will connect you manually with this property owner.')
      setMessage('')
    } catch (leadError) {
      setStatusMessage(leadError.message || 'Could not submit your interest')
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
    <div className="min-h-screen bg-(--color-surface)">
      <Navbar />

      <section className="mx-auto w-[92%] max-w-7xl py-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--color-secondary-text)">Verified Listing</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900 lg:text-4xl">{property.title}</h1>
              <p className="mt-2 text-sm text-slate-600">{property.locality || 'Locality not listed'}, {property.city}, {property.state}</p>
            </div>

            <div className="rounded-2xl bg-(--color-secondary-bg) px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-wide text-(--color-secondary-text)">Price</p>
              <p className="mt-1 text-2xl font-semibold text-(--color-primary)">{formatPrice(property)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-[92%] max-w-7xl gap-6 pb-14 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
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

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
            <h2 className="text-xl font-semibold text-slate-900">Description</h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">{property.description || 'No description provided.'}</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
            <h2 className="text-xl font-semibold text-slate-900">Specifications</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {specRows.length > 0 ? specRows
                .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
                .map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 capitalize">{String(value)}</p>
                  </div>
                )) : (
                <p className="text-sm text-slate-600">Specification details are not available.</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
            <h2 className="text-xl font-semibold text-slate-900">Amenities</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {amenities.length > 0 ? amenities.map((amenity) => (
                <span key={amenity} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700">
                  {amenity}
                </span>
              )) : <p className="text-sm text-slate-600">No amenities were listed.</p>}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
            <h2 className="text-xl font-semibold text-slate-900">Videos and Virtual Tour</h2>

            {property.virtualTourUrl ? (
              <a
                href={property.virtualTourUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex rounded-xl bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95"
              >
                Open Virtual Tour
              </a>
            ) : null}

            <div className="mt-4 space-y-3">
              {videoList.length > 0 ? videoList.map((videoUrl) => (
                <a
                  key={videoUrl}
                  href={videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-(--color-primary) hover:bg-slate-100"
                >
                  {videoUrl}
                </a>
              )) : (
                <p className="text-sm text-slate-600">No videos have been added for this property.</p>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-xl font-semibold text-slate-900">Location</h2>
            <p className="mt-3 text-sm text-slate-700">{property.address}</p>
            <p className="text-sm text-slate-700">{property.locality || 'Locality not listed'}, {property.city}</p>
            <p className="text-sm text-slate-700">{property.state} - {property.pincode}</p>
            {property.landmark ? <p className="mt-1 text-sm text-slate-700">Landmark: {property.landmark}</p> : null}

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Listing Info</p>
              <p className="mt-2 capitalize">Type: {property.propertyType}</p>
              <p className="capitalize">Purpose: {property.listingType}</p>
              <p>Views: {property.viewsCount ?? 0}</p>
              <p>Posted: {property.createdAt ? new Date(property.createdAt).toLocaleDateString() : 'N/A'}</p>
            </div>

            <div className="mt-5">
              <label className="text-sm font-medium text-slate-700">Message for CityPloter</label>
              <textarea
                rows="4"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Share your preference, budget flexibility, or move-in timeline"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-(--color-primary)"
              />

              <button
                type="button"
                onClick={handleGetConnected}
                disabled={isSubmittingLead}
                className="mt-3 w-full rounded-2xl bg-(--color-cta-orange) px-4 py-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isAuthenticated ? 'Get Connected' : 'Login to Get Connected'}
              </button>

              {statusMessage ? <p className="mt-2 text-sm text-slate-600">{statusMessage}</p> : null}
            </div>
          </div>
        </aside>
      </section>
    </div>
  )
}

export default PropertyDetailsPage
