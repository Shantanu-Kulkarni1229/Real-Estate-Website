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

function isValidEmail(value) {
  if (!value) return true
  return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(String(value))
}

function isValidMobile(value) {
  return /^[0-9]{10}$/.test(String(value || ''))
}

const PropertyDetailsModal = ({ property, isOpen, onClose }) => {
  const navigate = useNavigate()
  const { isAuthenticated, token, user } = useAuth()
  const [callbackForm, setCallbackForm] = useState({
    name: '',
    mobileNumber: '',
    email: '',
    whatsappNumber: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setCallbackForm({
        name: '',
        mobileNumber: '',
        email: '',
        whatsappNumber: '',
        message: ''
      })
      setStatusMessage('')
      setIsSubmitting(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || !isAuthenticated || !user) {
      return
    }

    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
    setCallbackForm((current) => ({
      ...current,
      name: current.name || fullName || user.email || '',
      mobileNumber: current.mobileNumber || user.phone || '',
      email: current.email || user.email || '',
      whatsappNumber: current.whatsappNumber || user.whatsappNumber || user.phone || ''
    }))
  }, [isAuthenticated, isOpen, user])

  if (!isOpen || !property) {
    return null
  }

  const amenities = Array.isArray(property.amenities) ? property.amenities : []
  const images = Array.isArray(property.images) && property.images.length > 0 ? property.images : []
  const specCategory = getPropertySpecCategory(property.propertyType)
  const isDirectContactEnabled = Boolean(property.directContactEnabled && property.publicContactNumber)

  const handleGetConnected = async () => {
    if (!callbackForm.name.trim()) {
      setStatusMessage('Name is required for callback requests.')
      return
    }

    if (!isValidMobile(callbackForm.mobileNumber)) {
      setStatusMessage('Please enter a valid 10-digit mobile number.')
      return
    }

    if (callbackForm.whatsappNumber && !isValidMobile(callbackForm.whatsappNumber)) {
      setStatusMessage('Please enter a valid 10-digit WhatsApp number or keep it empty.')
      return
    }

    if (!isValidEmail(callbackForm.email)) {
      setStatusMessage('Please enter a valid email or keep it empty.')
      return
    }

    setIsSubmitting(true)
    setStatusMessage('')

    try {
      await apiRequest('/interests', {
        method: 'POST',
        token: isAuthenticated ? token : undefined,
        body: {
          name: callbackForm.name.trim(),
          mobileNumber: callbackForm.mobileNumber.trim(),
          email: callbackForm.email.trim() || undefined,
          whatsappNumber: callbackForm.whatsappNumber.trim() || callbackForm.mobileNumber.trim(),
          message: callbackForm.message || `Interested in ${property.title}`,
          propertyId: property._id
        }
      })

      setStatusMessage('Your callback request has been sent. We will contact you soon.')
      setCallbackForm((current) => ({
        ...current,
        message: ''
      }))
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
              {isDirectContactEnabled ? (
                <div className="mt-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Paid Agent Listing</p>
                  <p className="mt-1 text-sm text-slate-700">Direct contact is enabled for this property.</p>
                  <p className="mt-1 text-base font-semibold text-slate-900">{property.publicContactNumber}</p>
                  <div className="mt-2 flex gap-2">
                    <a
                      href={`tel:${property.publicContactNumber}`}
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                    >
                      Call
                    </a>
                    <a
                      href={`https://wa.me/91${property.publicContactNumber}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                    >
                      WhatsApp
                    </a>
                    <button
                      type="button"
                      onClick={() => navigate(`/properties/${property._id}`)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Full Details
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mt-2 space-y-2">
                    <input
                      type="text"
                      value={callbackForm.name}
                      onChange={(event) => setCallbackForm((current) => ({ ...current, name: event.target.value }))}
                      placeholder="Your name"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-(--color-primary)"
                    />
                    <input
                      type="tel"
                      value={callbackForm.mobileNumber}
                      onChange={(event) => setCallbackForm((current) => ({ ...current, mobileNumber: event.target.value.replace(/\D/g, '').slice(0, 10) }))}
                      placeholder="Mobile number (required)"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-(--color-primary)"
                    />
                    <input
                      type="email"
                      value={callbackForm.email}
                      onChange={(event) => setCallbackForm((current) => ({ ...current, email: event.target.value }))}
                      placeholder="Email (optional)"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-(--color-primary)"
                    />
                    <textarea
                      rows="3"
                      value={callbackForm.message}
                      onChange={(event) => setCallbackForm((current) => ({ ...current, message: event.target.value }))}
                      placeholder="Tell the admin what you are looking for"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-(--color-primary)"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleGetConnected}
                    disabled={isSubmitting}
                    className="mt-3 w-full rounded-2xl bg-(--color-cta-orange) px-4 py-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? 'Submitting...' : 'Request Callback'}
                  </button>
                </>
              )}
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
