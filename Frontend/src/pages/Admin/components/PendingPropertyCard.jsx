const detailLabelClass = 'text-xs uppercase tracking-wide text-slate-500'

const PendingPropertyCard = ({ property, onReview, onOpenDetails, loadingAction }) => {
  const primaryImage = property.images && property.images.length > 0
    ? property.images[0]
    : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80'

  const createdBy = property.createdBy || {}
  const sellerName = [createdBy.firstName, createdBy.lastName].filter(Boolean).join(' ').trim() || 'Unknown Seller'

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[280px_1fr]">
        <button type="button" onClick={() => onOpenDetails(property)} className="h-56 w-full bg-slate-100 text-left lg:h-full">
          <img src={primaryImage} alt={property.title} className="h-full w-full object-cover" />
        </button>

        <div className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <button type="button" onClick={() => onOpenDetails(property)} className="text-left">
              <h3 className="text-xl font-semibold text-slate-900 hover:text-(--color-primary)">{property.title}</h3>
              <p className="mt-1 text-sm text-slate-600">
                {property.city}, {property.state}
              </p>
            </button>

            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
              property.status === 'approved'
                ? 'bg-emerald-100 text-emerald-700'
                : property.status === 'rejected'
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-amber-100 text-amber-700'
            }`}>
              {property.status}
            </span>
          </div>

          <p className="mt-3 line-clamp-2 text-sm text-slate-700">{property.description}</p>

          <button
            type="button"
            onClick={() => onOpenDetails(property)}
            className="mt-3 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            View full details
          </button>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onReview(property._id, 'approved')}
              disabled={loadingAction}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Approve
            </button>
            <button
              type="button"
              onClick={() => onOpenDetails(property)}
              disabled={loadingAction}
              className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Reject (add reason)
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

export default PendingPropertyCard
