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

const PropertyDetailsModal = ({ property, isOpen, onClose, onReview, onDelete, loadingActionType, isSubmitting }) => {
  const [approveMessage, setApproveMessage] = useState('')
  const [rejectMessage, setRejectMessage] = useState('')
  const [localError, setLocalError] = useState('')

  const spec = useMemo(() => formatSpec(property?.specifications), [property])

  if (!isOpen || !property) {
    return null
  }

  const createdBy = property.createdBy || {}
  const sellerName = [createdBy.firstName, createdBy.lastName].filter(Boolean).join(' ').trim() || 'Unknown Seller'
  const isPending = property.status === 'pending'
  const isApproved = property.status === 'approved'
  const isRejected = property.status === 'rejected'

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

  const handleDelete = () => {
    setLocalError('')
    onDelete(property._id)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="my-6 w-full max-w-5xl rounded-3xl border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.28)]">
        <div className="flex items-start justify-between border-b border-slate-200/80 p-5 lg:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Property Details</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">{property.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{property.city}, {property.state}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-[1.15fr_0.85fr] lg:p-6">
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(property.images || []).slice(0, 6).map((image, index) => (
                <img key={`${image}-${index}`} src={image} alt={`Property ${index + 1}`} className="h-32 w-full rounded-2xl object-cover" />
              ))}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className={labelClass}>Description</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{property.description}</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className={labelClass}>{spec.title}</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {spec.entries
                  .filter(([, value]) => value !== undefined && value !== null && value !== '')
                  .map(([key, value]) => (
                    <div key={key} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <p className="text-xs text-slate-500">{key}</p>
                      <p className="text-sm font-semibold text-slate-900">{String(value)}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className={labelClass}>Seller</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{sellerName}</p>
              <p className="mt-1 text-sm text-slate-600">{createdBy.email || 'No email'}</p>
              <p className="text-sm text-slate-600">{createdBy.phone || property.contactNumber || 'No contact'}</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
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

            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Review Actions</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                {isPending
                  ? 'Approve or reject the pending listing.'
                  : isApproved
                    ? 'Approved properties can be rejected again or deleted.'
                    : 'Rejected properties can be approved back into the marketplace.'}
              </p>

              {isPending || isRejected ? (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm font-semibold text-emerald-800">Approve Property</p>
                  <textarea
                    rows="3"
                    value={approveMessage}
                    onChange={(event) => setApproveMessage(event.target.value)}
                    placeholder="Optional note for seller"
                    className="mt-2 w-full rounded-2xl border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400"
                  />
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleApprove}
                    className="mt-3 w-full rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting && loadingActionType === 'approved' ? 'Approving...' : 'Approve and notify seller'}
                  </button>
                </div>
              ) : null}

              {isPending || isApproved ? (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                  <p className="text-sm font-semibold text-rose-800">Reject Property</p>
                  <textarea
                    rows="4"
                    value={rejectMessage}
                    onChange={(event) => setRejectMessage(event.target.value)}
                    placeholder="Required: explain why this property is rejected"
                    className="mt-2 w-full rounded-2xl border border-rose-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-rose-400"
                  />
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleReject}
                    className="mt-3 w-full rounded-full bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting && loadingActionType === 'rejected' ? 'Rejecting...' : 'Reject and notify seller'}
                  </button>
                </div>
              ) : null}

              {isApproved ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">Delete Property</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Remove this property completely from the platform.
                  </p>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleDelete}
                    className="mt-3 w-full rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting && loadingActionType === 'delete' ? 'Deleting...' : 'Delete property'}
                  </button>
                </div>
              ) : null}

              {localError ? (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {localError}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertyDetailsModal
