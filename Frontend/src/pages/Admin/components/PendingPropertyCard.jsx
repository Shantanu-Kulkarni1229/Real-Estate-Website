const detailLabelClass = 'text-xs uppercase tracking-wide text-slate-500'

const PendingPropertyCard = ({ property, onReview, onOpenDetails, onDelete, onViewDetails, loadingAction, loadingActionType }) => {
  const primaryImage = property.images && property.images.length > 0
    ? property.images[0]
    : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80'

  const createdBy = property.createdBy || {}
  const sellerName = [createdBy.firstName, createdBy.lastName].filter(Boolean).join(' ').trim() || 'Unknown Seller'
  const isPending = property.status === 'pending'
  const isApproved = property.status === 'approved'
  const isRejected = property.status === 'rejected'

  const statusToneMap = {
    approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    rejected: 'border-rose-200 bg-rose-50 text-rose-700',
    pending: 'border-amber-200 bg-amber-50 text-amber-700',
  }

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
      <div className="grid lg:grid-cols-[300px_1fr]">
        <button type="button" onClick={() => onOpenDetails(property)} className="relative h-56 w-full bg-slate-100 text-left lg:h-full">
          <img src={primaryImage} alt={property.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent" />
        </button>

        <div className="p-5 lg:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <button type="button" onClick={() => onOpenDetails(property)} className="text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Property Review</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-950 transition hover:text-(--color-primary)">{property.title}</h3>
              <p className="mt-1 text-sm text-slate-600">
                {property.city}, {property.state}
              </p>
            </button>

            <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${statusToneMap[property.status] || statusToneMap.pending}`}>
              {property.status}
            </span>
          </div>

          <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-700">{property.description}</p>

          <button
            type="button"
            onClick={onViewDetails}
            className="mt-4 rounded-full border border-(--color-primary) bg-(--color-secondary-bg) px-4 py-2 text-xs font-semibold text-(--color-primary) transition hover:brightness-95"
          >
            View details
          </button>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className={detailLabelClass}>Price</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">INR {Number(property.price || 0).toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className={detailLabelClass}>Type</p>
              <p className="mt-1 text-sm font-semibold capitalize text-slate-900">{property.propertyType}</p>
            </div>
            <div>
              <p className={detailLabelClass}>Listing</p>
              <p className="mt-1 text-sm font-semibold capitalize text-slate-900">{property.listingType}</p>
            </div>
            <div>
              <p className={detailLabelClass}>Seller</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{sellerName}</p>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Available Actions</p>
                <p className="mt-1 text-sm text-slate-600">
                  {isPending
                    ? 'Approve or reject this new submission.'
                    : isApproved
                      ? 'Reject this approved property or delete it if needed.'
                      : 'Approve this rejected property to bring it back live.'}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              {isPending || isRejected ? (
                <button
                  type="button"
                  onClick={() => onReview(property._id, 'approved')}
                  disabled={loadingAction}
                  className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loadingAction && loadingActionType === 'approved' ? 'Approving...' : 'Approve'}
                </button>
              ) : null}

              {isPending || isApproved ? (
                <button
                  type="button"
                  onClick={() => onOpenDetails(property)}
                  disabled={loadingAction}
                  className="rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loadingAction && loadingActionType === 'rejected' ? 'Rejecting...' : 'Reject'}
                </button>
              ) : null}

              {isApproved ? (
                <button
                  type="button"
                  onClick={() => onDelete(property._id)}
                  disabled={loadingAction}
                  className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loadingAction && loadingActionType === 'delete' ? 'Deleting...' : 'Delete'}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export default PendingPropertyCard
