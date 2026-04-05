import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../../../../lib/api'
import LoadingScreen from '../../../../components/LoadingScreen'
import PropertyCard from '../PropertyCard'
import { normalizePropertyType, PROPERTY_TYPE_GROUPS } from '../../../../constants/propertyTypes'

const METRO_CITIES = new Set([
  'Mumbai',
  'Delhi',
  'Bengaluru',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Pune',
  'Kolkata',
  'Ahmedabad',
  'Surat',
  'Jaipur',
  'Noida',
  'Delhi NCR',
  'Thane',
  'Navi Mumbai'
])

const ApprovedPropertiesSection = ({ filters }) => {
  const navigate = useNavigate()
  const rowRefs = useRef({})
  const [properties, setProperties] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedMetroCity, setSelectedMetroCity] = useState('All Cities')

  useEffect(() => {
    const loadProperties = async () => {
      setIsLoading(true)
      setError('')

      try {
        const response = await apiRequest('/properties?status=approved&limit=100')
        setProperties(response?.data || [])
      } catch (loadError) {
        setError(loadError.message || 'Failed to load properties')
      } finally {
        setIsLoading(false)
      }
    }

    loadProperties()
  }, [])

  const visibleProperties = useMemo(() => {
    const activeFilters = filters || {}
    const selectedCity = activeFilters.city || 'All India'
    const selectedPropertyType = activeFilters.propertyType || ''
    const queryText = (activeFilters.queryText || '').toLowerCase()

    return properties.filter((property) => {
      const matchesCity = selectedCity === 'All India' || property.city === selectedCity
      const matchesPropertyType = !selectedPropertyType || property.propertyType?.toLowerCase().includes(selectedPropertyType.toLowerCase()) || property.listingType?.toLowerCase().includes(selectedPropertyType.toLowerCase())
      const haystack = [property.title, property.description, property.city, property.locality, property.propertyType, property.listingType].filter(Boolean).join(' ').toLowerCase()
      const matchesQuery = !queryText || haystack.includes(queryText)

      return matchesCity && matchesPropertyType && matchesQuery
    })
  }, [filters, properties])

  const groupedProperties = useMemo(() => {
    const typeToGroup = new Map()
    PROPERTY_TYPE_GROUPS.forEach((group) => {
      group.options.forEach((option) => {
        typeToGroup.set(option, group.title)
      })
    })

    const grouped = PROPERTY_TYPE_GROUPS.map((group) => ({
      title: group.title,
      properties: []
    }))

    const fallbackGroupTitle = PROPERTY_TYPE_GROUPS[PROPERTY_TYPE_GROUPS.length - 1]?.title || 'Other Property Types'

    visibleProperties.forEach((property) => {
      const normalizedType = normalizePropertyType(property.propertyType)
      const groupTitle = typeToGroup.get(normalizedType) || fallbackGroupTitle
      const targetGroup = grouped.find((group) => group.title === groupTitle)

      if (targetGroup) {
        targetGroup.properties.push(property)
      }
    })

    return grouped
  }, [visibleProperties])

  const metroProperties = useMemo(() => {
    return visibleProperties.filter((property) => METRO_CITIES.has(property.city))
  }, [visibleProperties])

  const metroCitiesInResults = useMemo(() => {
    return [...new Set(metroProperties.map((property) => property.city).filter(Boolean))]
  }, [metroProperties])

  const metroPropertiesToShow = useMemo(() => {
    if (selectedMetroCity === 'All Cities') {
      return metroProperties
    }

    return metroProperties.filter((property) => property.city === selectedMetroCity)
  }, [metroProperties, selectedMetroCity])

  useEffect(() => {
    if (selectedMetroCity === 'All Cities') {
      return
    }

    if (!metroCitiesInResults.includes(selectedMetroCity)) {
      setSelectedMetroCity('All Cities')
    }
  }, [metroCitiesInResults, selectedMetroCity])

  const scrollRow = (rowTitle, direction) => {
    const row = rowRefs.current[rowTitle]
    if (!row) {
      return
    }

    row.scrollBy({
      left: direction === 'left' ? -360 : 360,
      behavior: 'smooth'
    })
  }

  const openPropertyDetails = (property) => {
    if (!property?._id) {
      return
    }

    navigate(`/properties/${property._id}`)
  }

  return (
    <section className="mx-auto w-[92%] max-w-7xl pb-14 pt-10">
      <div className="relative mb-7 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="pointer-events-none absolute -left-16 -top-20 h-52 w-52 rounded-full bg-(--color-primary)/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-6 h-56 w-56 rounded-full bg-(--color-cta-orange)/10 blur-3xl" />

        <div className="relative flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-(--color-secondary-text)">Approved Properties</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Premium live listings showcase</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">Explore verified listings with enriched preview cards. Complete details open only through the View Details action.</p>
          </div>
          <div className="rounded-full bg-(--color-secondary-bg) px-4 py-2 text-sm font-semibold text-(--color-primary)">
            {visibleProperties.length} listings
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Browse by category</h3>
          <p className="mt-1 text-sm text-slate-600">Owner contact details stay hidden until a buyer gets connected through admin.</p>
        </div>
      </div>

      {isLoading ? (
        <LoadingScreen
          label="Loading Listings"
          sublabel="Fetching approved properties from CityPloter"
        />
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 shadow-sm">{error}</div>
      ) : visibleProperties.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">No approved properties match your filters yet.</div>
      ) : (
        <div className="space-y-10">
          {groupedProperties.map((group) => (
            <div key={group.title}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{group.title}</h3>
                  <p className="text-sm text-slate-600">{group.properties.length} listings</p>
                </div>

                <div className="hidden items-center gap-2 sm:flex">
                  <button
                    type="button"
                    aria-label={`Scroll ${group.title} left`}
                    onClick={() => scrollRow(group.title, 'left')}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition duration-200 hover:border-(--color-primary) hover:text-(--color-primary)"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    aria-label={`Scroll ${group.title} right`}
                    onClick={() => scrollRow(group.title, 'right')}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition duration-200 hover:border-(--color-primary) hover:text-(--color-primary)"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              <div
                ref={(node) => {
                  rowRefs.current[group.title] = node
                }}
                className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto rounded-2xl bg-linear-to-r from-slate-100/60 via-white to-slate-100/60 p-3 pb-4"
              >
                {group.properties.length > 0 ? (
                  group.properties.map((property) => (
                    <div key={property._id} className="snap-start">
                      <PropertyCard
                        property={property}
                        onViewDetails={openPropertyDetails}
                      />
                    </div>
                  ))
                ) : (
                  <div className="w-full rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-6 text-sm text-slate-600">
                    No approved listings are available in {group.title} right now.
                  </div>
                )}
              </div>
            </div>
          ))}

          {metroProperties.length > 0 ? (
            <div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Popular Properties In Top Tier Cities</h3>
                  <p className="text-sm text-slate-600">{metroPropertiesToShow.length} metro listings</p>
                </div>

                <div className="hidden items-center gap-2 sm:flex">
                  <button
                    type="button"
                    aria-label="Scroll Top Tier Cities left"
                    onClick={() => scrollRow('top-tier-cities', 'left')}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition duration-200 hover:border-(--color-primary) hover:text-(--color-primary)"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    aria-label="Scroll Top Tier Cities right"
                    onClick={() => scrollRow('top-tier-cities', 'right')}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition duration-200 hover:border-(--color-primary) hover:text-(--color-primary)"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setSelectedMetroCity('All Cities')}
                  className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition duration-150 ${
                    selectedMetroCity === 'All Cities'
                      ? 'border-(--color-primary) bg-(--color-secondary-bg) text-(--color-primary)'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  All Cities
                </button>

                {metroCitiesInResults.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setSelectedMetroCity(city)}
                    className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition duration-150 ${
                      selectedMetroCity === city
                        ? 'border-(--color-primary) bg-(--color-secondary-bg) text-(--color-primary)'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>

              <div
                ref={(node) => {
                  rowRefs.current['top-tier-cities'] = node
                }}
                className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto rounded-2xl bg-linear-to-r from-slate-100/60 via-white to-slate-100/60 p-3 pb-4"
              >
                {metroPropertiesToShow.map((property) => (
                  <div key={`metro-${property._id}`} className="snap-start">
                    <PropertyCard
                      property={property}
                      onViewDetails={openPropertyDetails}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}

export default ApprovedPropertiesSection
