import { useMemo, useState } from 'react'

const labelClass = 'text-xs uppercase tracking-wide text-slate-500'

function formatSpec(specifications = {}) {
  const residential = specifications.residential || {}
  const plot = specifications.plot || {}
  const commercial = specifications.commercial || {}

  if (Object.keys(residential).length > 0) {
    return {
      title: 'Residential Specifications',
      entries: [
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
        ['Parking Available', residential.parking?.available === undefined ? undefined : residential.parking.available ? 'Yes' : 'No'],
        ['Parking Type', residential.parking?.type]
      ]
    }
  }

  if (Object.keys(plot).length > 0) {
    return {
      title: 'Plot Specifications',
      entries: [
        ['Plot Area', plot.plotArea],
        ['Length', plot.length],
        ['Width', plot.width],
        ['Boundary Wall', plot.boundaryWall === undefined ? undefined : plot.boundaryWall ? 'Yes' : 'No'],
        ['Corner Plot', plot.cornerPlot === undefined ? undefined : plot.cornerPlot ? 'Yes' : 'No']
      ]
    }
  }

  return {
    title: 'Commercial Specifications',
    entries: [
      ['Property Use', commercial.propertyUse],
      ['Floor', commercial.floor],
      ['Washrooms', commercial.washrooms],
      ['Pantry', commercial.pantry === undefined ? undefined : commercial.pantry ? 'Yes' : 'No'],
      ['Furnished Status', commercial.furnishedStatus]
    ]
  }
}

const PropertyDetailsModal = ({ property, isOpen, onClose, onReview, isSubmitting }) => {
  const [approveMessage, setApproveMessage] = useState('')
  const [rejectMessage, setRejectMessage] = useState('')
  const [localError, setLocalError] = useState('')

  const spec = useMemo(() => formatSpec(property?.specifications), [property])

  if (!isOpen || !property) {
    return null
  }

  const createdBy = property.createdBy || {}
  const sellerName = [createdBy.firstName, createdBy.lastName].filter(Boolean).join(' ').trim() || 'Unknown Seller'

  const handleApprove = () => {
    setLocalError('')
    onReview(property._id, 'approved', approveMessage)
  }

  const handleReject = () => {
    if (!rejectMessage.trim()) {
      setLocalError('Please provide a rejection reason before rejecting this property.')
      return
    }

    setLocalError('')
    onReview(property._id, 'rejected', rejectMessage)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/70 p-4">
      <div className="my-6 w-full max-w-5xl rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Property Details</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">{property.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{property.city}, {property.state}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(property.images || []).slice(0, 6).map((image, index) => (
                <img key={`${image}-${index}`} src={image} alt={`Property ${index + 1}`} className="h-32 w-full rounded-xl object-cover" />
              ))}
            </div>

            <div>
              <p className={labelClass}>Description</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{property.description}</p>
            </div>

            <div>
              <p className={labelClass}>{spec.title}</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {spec.entries
                  .filter(([, value]) => value !== undefined && value !== null && value !== '')
                  .map(([key, value]) => (
                    <div key={key} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-xs text-slate-500">{key}</p>
                      <p className="text-sm font-semibold text-slate-900">{String(value)}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className={labelClass}>Seller</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{sellerName}</p>
              <p className="mt-1 text-sm text-slate-600">{createdBy.email || 'No email'}</p>
              <p className="text-sm text-slate-600">{createdBy.phone || property.contactNumber || 'No contact'}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className={labelClass}>Property Summary</p>
              <p className="mt-2 text-sm text-slate-700">Price: INR {Number(property.price || 0).toLocaleString('en-IN')}</p>
              <p className="text-sm text-slate-700">Type: <span className="capitalize">{property.propertyType}</span></p>
              <p className="text-sm text-slate-700">Listing: <span className="capitalize">{property.listingType}</span></p>
              <p className="text-sm text-slate-700">Address: {property.address}</p>
              <p className="text-sm text-slate-700">Pincode: {property.pincode}</p>
              {property.locality ? <p className="text-sm text-slate-700">Locality: {property.locality}</p> : null}
              {property.landmark ? <p className="text-sm text-slate-700">Landmark: {property.landmark}</p> : null}
              {property.reviewNotes ? (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  Previous review note: {property.reviewNotes}
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-800">Approve Property</p>
              <textarea
                rows="3"
                value={approveMessage}
                onChange={(event) => setApproveMessage(event.target.value)}
                placeholder="Optional note for seller"
                className="mt-2 w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400"
              />
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleApprove}
                className="mt-3 w-full rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Approve and notify seller
              </button>
            </div>

            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-sm font-semibold text-rose-800">Reject Property</p>
              <textarea
                rows="4"
                value={rejectMessage}
                onChange={(event) => setRejectMessage(event.target.value)}
                placeholder="Required: explain why this property is rejected"
                className="mt-2 w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-rose-400"
              />
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleReject}
                className="mt-3 w-full rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Reject and notify seller
              </button>
            </div>

            {localError ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {localError}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertyDetailsModal
