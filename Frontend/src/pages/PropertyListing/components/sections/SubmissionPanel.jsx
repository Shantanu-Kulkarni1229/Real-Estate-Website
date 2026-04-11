const SubmissionPanel = ({ form, imageCount, isSubmitting, onReset, roleLabel }) => {
  return (
    <aside className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.25)] lg:sticky lg:top-24">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Listing summary</p>
      <h2 className="mt-3 text-2xl font-semibold">Ready to publish</h2>
      <p className="mt-3 text-sm leading-6 text-slate-300">
        Review the listing details, upload the images, and submit. The backend will keep the property in pending state until it is approved.
      </p>

      <div className="mt-6 space-y-3 rounded-3xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-slate-400">Title</span>
          <span className="max-w-[60%] truncate font-medium text-white">{form.title || 'Untitled property'}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-slate-400">Property type</span>
          <span className="font-medium text-white capitalize">{form.propertyType}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-slate-400">Listing type</span>
          <span className="font-medium text-white capitalize">{form.listingType}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-slate-400">Images</span>
          <span className="font-medium text-white">{imageCount} selected</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-slate-400">Current role</span>
          <span className="font-medium text-white">{roleLabel}</span>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-(--color-cta-orange)/30 bg-(--color-cta-orange)/10 p-4 text-sm text-orange-100">
        Upload images first, then the property payload will be sent with the returned Cloudinary URLs.
      </div>

      <button
        type="submit"
        form="property-listing-form"
        disabled={isSubmitting}
        className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-(--color-cta-orange) px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition duration-200 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? 'Publishing property...' : 'Publish property'}
      </button>

      <button
        type="button"
        onClick={onReset}
        className="mt-3 inline-flex w-full items-center justify-center rounded-2xl border border-white/15 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-white/5"
      >
        Reset form
      </button>

      <p className="mt-6 text-xs leading-5 text-slate-400">
        Owner, agent, builder, and admin accounts can publish listings. Switch to a commercial account if posting is blocked.
      </p>
    </aside>
  )
}

export default SubmissionPanel
