import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../Home/components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { apiRequest } from '../../lib/api'
import LoadingScreen from '../../components/LoadingScreen'
import { getPropertySpecCategory } from '../../constants/propertyTypes'

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
  return formatPriceValue(property.price)
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
    if (!addressLine) {
      return ''
    }

    return `https://www.google.com/maps?q=${encodeURIComponent(addressLine)}&output=embed`
  }, [addressLine])

  const isDirectContactEnabled = Boolean(property?.directContactEnabled && property?.publicContactNumber)

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
              <p className="text-xs uppercase tracking-wide text-(--color-secondary-text)">{unitConfigurations.length > 0 ? 'Starting from' : 'Price'}</p>
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

          {unitConfigurations.length > 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
              <h2 className="text-xl font-semibold text-slate-900">Unit Options and Pricing</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-2 text-sm text-slate-700">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
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
            <h2 className="text-xl font-semibold text-slate-900">Location and Map</h2>
            <p className="mt-3 text-sm text-slate-700">{addressLine || 'Address not available'}</p>

            {mapsSrc ? (
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                <iframe
                  title="Property location map"
                  src={mapsSrc}
                  className="h-64 w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ) : null}

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Listing Info</p>
              <p className="mt-2 capitalize">Type: {property.propertyType}</p>
              <p className="capitalize">Purpose: {property.listingType}</p>
              <p>Owner Name: {property.ownerName || 'N/A'}</p>
              <p>Ownership: {property.ownershipType || 'N/A'}</p>
              <p>Available From: {property.availableFrom ? new Date(property.availableFrom).toLocaleDateString() : 'Immediate / Not specified'}</p>
              <p>Views: {property.viewsCount ?? 0}</p>
              <p>Posted: {property.createdAt ? new Date(property.createdAt).toLocaleDateString() : 'N/A'}</p>
            </div>

            {isDirectContactEnabled && isAuthenticated ? (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Direct Contact Available</p>
                <p className="mt-2 text-sm text-slate-700">This listing is managed by a paid agent. You can directly contact now.</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{property.publicContactNumber}</p>
                <div className="mt-3 flex gap-2">
                  <a
                    href={`tel:${property.publicContactNumber}`}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Call Now
                  </a>
                  <a
                    href={`https://wa.me/91${property.publicContactNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            ) : null}

            <div className="mt-5 rounded-2xl border border-(--color-secondary-bg) bg-(--color-secondary-bg) p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-(--color-primary)">Instant Callback</p>

              {!isAuthenticated ? (
                <>
                  <p className="mt-2 text-sm text-slate-700">Please login first. Your profile details will be shared directly, so no form is needed.</p>
                  <button
                    type="button"
                    onClick={handleLoginForCallback}
                    className="mt-3 w-full rounded-2xl bg-(--color-primary) px-4 py-3 text-sm font-semibold text-white transition hover:brightness-95"
                  >
                    Login to Get Connected
                  </button>
                </>
              ) : (
                <>
                  <p className="mt-2 text-sm text-slate-700">Click once and we will share your account details with seller/admin instantly.</p>
                  <button
                    type="button"
                    onClick={handleGetConnected}
                    disabled={isSubmittingLead}
                    className="mt-3 w-full rounded-2xl bg-(--color-cta-orange) px-4 py-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmittingLead ? 'Submitting...' : 'Get Connected Now'}
                  </button>
                </>
              )}

              {statusMessage ? <p className="mt-2 text-sm text-slate-700">{statusMessage}</p> : null}
            </div>
          </div>
        </aside>
      </section>
    </div>
  )
}

export default PropertyDetailsPage