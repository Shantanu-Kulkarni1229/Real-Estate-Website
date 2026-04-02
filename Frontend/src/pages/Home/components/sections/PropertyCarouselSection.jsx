import { useRef } from 'react'
import PropertyCard from '../PropertyCard'

const PropertyCarouselSection = ({ title, subtitle, filters, properties }) => {
  const carouselRef = useRef(null)

  const scrollCards = (direction) => {
    if (!carouselRef.current) {
      return
    }

    const scrollDistance = direction === 'left' ? -340 : 340
    carouselRef.current.scrollBy({ left: scrollDistance, behavior: 'smooth' })
  }

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-(--color-secondary-text)">{subtitle}</p>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {filters.map((filterLabel) => (
            <span
              key={filterLabel}
              className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
            >
              {filterLabel}
            </span>
          ))}
        </div>
      </div>

      <div className="relative">
        <div
          ref={carouselRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2 sm:gap-6"
        >
          {properties.map((property) => (
            <div key={property.id} className="snap-start">
              <PropertyCard property={property} />
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center justify-between sm:flex">
          <button
            type="button"
            onClick={() => scrollCards('left')}
            aria-label="Scroll left"
            className="pointer-events-auto -ml-4 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition duration-200 hover:border-(--color-primary) hover:text-(--color-primary)"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => scrollCards('right')}
            aria-label="Scroll right"
            className="pointer-events-auto -mr-4 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition duration-200 hover:border-(--color-primary) hover:text-(--color-primary)"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default PropertyCarouselSection
