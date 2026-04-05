import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { getPropertySpecCategory } from '../../../constants/propertyTypes'
import { apiRequest } from '../../../lib/api'

const detailRowClass = 'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3'

function formatPrice(property) {
  if (!property) return 'Price on request'
  if (typeof property.price === 'number') return `INR ${Number(property.price).toLocaleString('en-IN')}`
  return property.price || 'Price on request'
}

const PropertyDetailsModal = ({ property, isOpen, onClose }) => {
  const navigate = useNavigate()
  const { isAuthenticated, token, user } = useAuth()
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setMessage('')
      setStatusMessage('')
      setIsSubmitting(false)
    }
  }, [isOpen])

  if (!isOpen || !property) {
    return null
  }

  const amenities = Array.isArray(property.amenities) ? property.amenities : []
  const images = Array.isArray(property.images) && property.images.length > 0 ? property.images : []
  const specCategory = getPropertySpecCategory(property.propertyType)

  const handleGetConnected = async () => {
    if (!isAuthenticated) {
      window.alert('Please login to get connected with this property.')
      navigate(`/auth?redirect=${encodeURIComponent('/')}`)
      return
    }

    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim()
    const contactName = fullName || user?.firstName || user?.email || 'Buyer'
    const contactEmail = user?.email
    const contactPhone = user?.phone
    const whatsapp = user?.whatsappNumber || user?.phone

    if (!contactEmail || !contactPhone) {
      setStatusMessage('Your profile needs email and phone number before getting connected.')
      return
    }

    setIsSubmitting(true)
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

      setStatusMessage('Your interest has been sent. The admin will connect you manually with the seller.')
      setMessage('')
    } catch (error) {
      setStatusMessage(error.message || 'Failed to connect with this property')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/70 p-4">
      <div className="my-6 w-full max-w-5xl rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Verified Property</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">{property.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{property.city}, {property.state}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
            Close
          </button>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {images.slice(0, 6).map((image, index) => (
                <img key={`${image}-${index}`} src={image} alt={`${property.title} ${index + 1}`} className="h-32 w-full rounded-xl object-cover" />
              ))}
            </div>

            <div className={detailRowClass}>
              <p className="text-xs uppercase tracking-wide text-slate-500">Description</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{property.description}</p>
            </div>

            <div className={detailRowClass}>
              <p className="text-xs uppercase tracking-wide text-slate-500">Property Specifications</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {specCategory === 'plot' && property.specifications?.plot ? (
                  <>
                    <div><p className="text-xs text-slate-500">Plot Area</p><p className="font-semibold">{property.specifications.plot.plotArea || 'N/A'}</p></div>
                    <div><p className="text-xs text-slate-500">Length</p><p className="font-semibold">{property.specifications.plot.length || 'N/A'}</p></div>
                    <div><p className="text-xs text-slate-500">Width</p><p className="font-semibold">{property.specifications.plot.width || 'N/A'}</p></div>
                    <div><p className="text-xs text-slate-500">Corner Plot</p><p className="font-semibold">{property.specifications.plot.cornerPlot ? 'Yes' : 'No'}</p></div>
                  </>
                ) : null}

                {specCategory === 'residential' && property.specifications?.residential ? (
                  <>
                    <div><p className="text-xs text-slate-500">BHK</p><p className="font-semibold">{property.specifications.residential.bhk || 'N/A'}</p></div>
                    <div><p className="text-xs text-slate-500">Bathrooms</p><p className="font-semibold">{property.specifications.residential.bathrooms || 'N/A'}</p></div>
                    <div><p className="text-xs text-slate-500">Super Built-up Area</p><p className="font-semibold">{property.specifications.residential.superBuiltUpArea || 'N/A'}</p></div>
                    <div><p className="text-xs text-slate-500">Furnishing</p><p className="font-semibold capitalize">{property.specifications.residential.furnishing || 'N/A'}</p></div>
                  </>
                ) : null}

                {specCategory === 'commercial' && property.specifications?.commercial ? (
                  <>
                    <div><p className="text-xs text-slate-500">Property Use</p><p className="font-semibold capitalize">{property.specifications.commercial.propertyUse || 'N/A'}</p></div>
                    <div><p className="text-xs text-slate-500">Floor</p><p className="font-semibold">{property.specifications.commercial.floor || 'N/A'}</p></div>
                    <div><p className="text-xs text-slate-500">Washrooms</p><p className="font-semibold">{property.specifications.commercial.washrooms || 'N/A'}</p></div>
                    <div><p className="text-xs text-slate-500">Furnished Status</p><p className="font-semibold capitalize">{property.specifications.commercial.furnishedStatus || 'N/A'}</p></div>
                  </>
                ) : null}
              </div>
            </div>

            <div className={detailRowClass}>
              <p className="text-xs uppercase tracking-wide text-slate-500">Amenities</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {amenities.length > 0 ? amenities.map((amenity) => (
                  <span key={amenity} className="rounded-full bg-white px-3 py-1 text-sm text-slate-700 shadow-sm">
                    {amenity}
                  </span>
                )) : <span className="text-sm text-slate-500">No amenities listed.</span>}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className={detailRowClass}>
              <p className="text-xs uppercase tracking-wide text-slate-500">Price</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{formatPrice(property)}</p>
              <p className="mt-1 text-sm text-slate-600 capitalize">{property.listingType} listing · {property.propertyType}</p>
            </div>

            <div className={detailRowClass}>
              <p className="text-xs uppercase tracking-wide text-slate-500">Location</p>
              <p className="mt-2 text-sm text-slate-700">{property.address}</p>
              <p className="text-sm text-slate-700">{property.locality || 'Locality not listed'}, {property.city}</p>
              <p className="text-sm text-slate-700">{property.state} - {property.pincode}</p>
              {property.landmark ? <p className="text-sm text-slate-700">Landmark: {property.landmark}</p> : null}
            </div>

            <div className={detailRowClass}>
              <p className="text-xs uppercase tracking-wide text-slate-500">Connect</p>
              <textarea
                rows="4"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Tell the admin what you are looking for"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-(--color-primary)"
              />
              <button
                type="button"
                onClick={handleGetConnected}
                disabled={isSubmitting}
                className="mt-3 w-full rounded-2xl bg-(--color-cta-orange) px-4 py-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isAuthenticated ? 'Get Connected' : 'Login to Get Connected'}
              </button>
              {statusMessage ? <p className="mt-2 text-sm text-slate-600">{statusMessage}</p> : null}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Owner details are intentionally hidden for buyers.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertyDetailsModal
