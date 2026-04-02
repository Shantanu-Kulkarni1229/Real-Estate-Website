import { useState } from 'react'

const PropertyCard = ({ property }) => {
  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <article className="group w-72 shrink-0 overflow-hidden rounded-xl bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg sm:w-80 lg:w-96">
      <a href="#" className="block">
        <div className="relative h-48 overflow-hidden">
          <img
            src={property.image}
            alt={property.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />

          <button
            type="button"
            aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
            onClick={(event) => {
              event.preventDefault()
              setIsFavorite((prev) => !prev)
            }}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm backdrop-blur transition duration-200 hover:bg-white"
          >
            <svg
              className={`h-5 w-5 transition ${isFavorite ? 'fill-rose-500 text-rose-500' : 'fill-none text-slate-700'}`}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>

          <span className="absolute bottom-3 left-3 rounded-md bg-white px-3 py-1 text-sm font-bold text-slate-900 shadow-sm">
            {property.price}
          </span>
        </div>

        <div className="space-y-2 p-4">
          <h3
            className="text-base font-semibold text-slate-900"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {property.title}
          </h3>

          <p className="truncate text-sm text-(--color-secondary-text)">{property.location}</p>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Posted by {property.postedBy}</span>
            <span>{property.time}</span>
          </div>
        </div>
      </a>
    </article>
  )
}

export default PropertyCard
