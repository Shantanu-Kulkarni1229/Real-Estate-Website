import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CITY_OPTIONS } from '../../../constants/cities'
import { PROPERTY_TYPE_GROUPS } from '../../../constants/propertyTypes'
import { useAuth } from '../../../context/AuthContext'
import { apiRequest } from '../../../lib/api'

const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 0,
}

const CITY_ALIASES = {
  aurangabad: 'Chhatrapati Sambhajinagar',
  'chhatrapati sambhaji nagar': 'Chhatrapati Sambhajinagar',
  'chhatrapati sambhajinagr': 'Chhatrapati Sambhajinagar',
}

const categoryTabs = [
  { key: 'buy', label: 'Buy', searchType: 'buy' },
  { key: 'rental', label: 'Rental', searchType: 'rent' },
  { key: 'projects', label: 'Projects', searchType: 'buy', defaultQuery: 'projects' },
  { key: 'pg', label: 'PG / Hostels', searchType: 'rent', defaultQuery: 'pg hostels' },
  { key: 'plot', label: 'Plot & Land', searchType: 'buy', defaultPropertyType: 'Plot' },
  { key: 'commercial', label: 'Commercial', searchType: 'buy', defaultPropertyType: 'Commercial' },
  { key: 'agents', label: 'Agents', searchType: 'buy', defaultQuery: 'agent listed properties' },
]

const budgetOptions = [
  '',
  '₹5 Lac',
  '₹10 Lac',
  '₹20 Lac',
  '₹30 Lac',
  '₹40 Lac',
  '₹50 Lac',
  '₹60 Lac',
  '₹70 Lac',
  '₹80 Lac',
  '₹90 Lac',
  '₹1 Cr',
  '₹1.2 Cr',
  '₹1.4 Cr',
  '₹1.6 Cr',
  '₹1.8 Cr',
  '₹2 Cr',
  '₹2.3 Cr',
  '₹2.6 Cr',
  '₹3 Cr',
  '₹3.5 Cr',
  '₹4 Cr',
  '₹4.5 Cr',
  '₹5 Cr',
  '₹10 Cr',
  '₹20 Cr',
]

function normalizeCityKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
}

function canonicalizeCityName(rawCity) {
  if (!rawCity) {
    return ''
  }

  const normalizedKey = normalizeCityKey(rawCity)
  if (CITY_ALIASES[normalizedKey]) {
    return CITY_ALIASES[normalizedKey]
  }

  const exactMatch = CITY_OPTIONS.find((city) => normalizeCityKey(city) === normalizedKey)
  return exactMatch || String(rawCity).trim()
}

const getDetectedCity = async (latitude, longitude) => {
  const response = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
  )

  if (!response.ok) {
    throw new Error('Failed to fetch city')
  }

  const data = await response.json()
  const administrativeNames = Array.isArray(data?.localityInfo?.administrative)
    ? data.localityInfo.administrative.map((item) => item?.name).filter(Boolean)
    : []

  const candidates = [
    data?.city,
    data?.locality,
    ...administrativeNames,
    data?.principalSubdivision,
  ].filter(Boolean)

  for (const candidate of candidates) {
    const canonical = canonicalizeCityName(candidate)
    if (CITY_OPTIONS.includes(canonical)) {
      return canonical
    }
  }

  return canonicalizeCityName(candidates[0] || 'All India') || 'All India'
}

const DropdownPanel = ({ title, children, className = '' }) => (
  <div className={`absolute left-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_22px_45px_rgba(15,23,42,0.18)] ${className}`}>
    <div className="border-b border-slate-100 bg-linear-to-r from-slate-50 to-white px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">{title}</p>
    </div>
    {children}
  </div>
)

const TriggerChevron = () => (
  <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

const IconPin = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const IconHome = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10.75L12 4l9 6.75V20a1 1 0 01-1 1h-5.5v-6h-5V21H4a1 1 0 01-1-1v-9.25z" />
  </svg>
)

const IconCurrency = () => (
  <span className="text-xs font-bold">₹</span>
)

const TabIcon = ({ tabKey }) => {
  if (tabKey === 'buy') {
    return (
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10.75L12 4l9 6.75V20a1 1 0 01-1 1h-5.5v-6h-5V21H4a1 1 0 01-1-1v-9.25z" />
      </svg>
    )
  }

  if (tabKey === 'rental') {
    return (
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V5a4 4 0 118 0v2m-9 0h10a2 2 0 012 2v9a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2z" />
      </svg>
    )
  }

  if (tabKey === 'projects') {
    return (
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 20V8m5 12V4m5 16v-7m5 7V10" />
      </svg>
    )
  }

  if (tabKey === 'pg') {
    return (
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 20V6a2 2 0 012-2h12a2 2 0 012 2v14M9 20v-4h6v4M8 9h.01M12 9h.01M16 9h.01" />
      </svg>
    )
  }

  if (tabKey === 'plot') {
    return (
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7l8-4 8 4v10l-8 4-8-4V7z" />
      </svg>
    )
  }

  if (tabKey === 'commercial') {
    return (
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6M9 10h.01M12 10h.01M15 10h.01" />
      </svg>
    )
  }

  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 14a4 4 0 10-8 0M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0" />
    </svg>
  )
}

const SearchBar = ({ onSearch }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const rootRef = useRef(null)

  const geolocationSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator

  const [activeTab, setActiveTab] = useState('buy')
  const [selectedCity, setSelectedCity] = useState('All India')
  const [queryText, setQueryText] = useState('')
  const [selectedProperty, setSelectedProperty] = useState('all')
  const [minBudget, setMinBudget] = useState('')
  const [maxBudget, setMaxBudget] = useState('')

  const [locationQuery, setLocationQuery] = useState('')
  const [openMenu, setOpenMenu] = useState(null)
  const [locationStatus, setLocationStatus] = useState('idle')

  const activeCategory = categoryTabs.find((tab) => tab.key === activeTab) || categoryTabs[0]

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpenMenu(null)
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [])

  useEffect(() => {
    if (!geolocationSupported) {
      return
    }

    const fetchInitialLocation = () => {
      setLocationStatus('loading')

      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          try {
            const detectedCity = await getDetectedCity(coords.latitude, coords.longitude)
            setSelectedCity(detectedCity)
            setLocationStatus('done')
          } catch {
            setLocationStatus('error')
          }
        },
        () => {
          setLocationStatus('error')
        },
        GEOLOCATION_OPTIONS,
      )
    }

    fetchInitialLocation()
  }, [geolocationSupported])

  const filteredCities = useMemo(() => {
    const query = locationQuery.trim().toLowerCase()
    if (!query) {
      return CITY_OPTIONS
    }

    return CITY_OPTIONS.filter((city) => city.toLowerCase().includes(query))
  }, [locationQuery])

  const allPropertyOptions = useMemo(() => {
    return PROPERTY_TYPE_GROUPS.flatMap((group) => group.options)
  }, [])

  const useCurrentLocation = () => {
    if (!geolocationSupported) {
      return
    }

    setLocationStatus('loading')

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const detectedCity = await getDetectedCity(coords.latitude, coords.longitude)
          setSelectedCity(detectedCity)
          setLocationStatus('done')
          setOpenMenu(null)
        } catch {
          setLocationStatus('error')
        }
      },
      () => {
        setLocationStatus('error')
      },
      GEOLOCATION_OPTIONS,
    )
  }

  const handleSearch = async () => {
    const resolvedPropertyType = selectedProperty === 'all'
      ? activeCategory.defaultPropertyType || 'all'
      : selectedProperty

    const resolvedQuery = queryText.trim() || activeCategory.defaultQuery || `${activeCategory.label} in ${selectedCity}`

    const payload = {
      searchType: activeCategory.searchType,
      city: selectedCity,
      propertyType: resolvedPropertyType,
      budgetMin: minBudget,
      budgetMax: maxBudget,
      queryText: resolvedQuery,
      sourcePage: 'home-search',
    }

    onSearch?.(payload)

    const searchParams = new URLSearchParams()
    searchParams.set('searchType', payload.searchType)
    searchParams.set('city', payload.city)
    if (payload.propertyType && payload.propertyType !== 'all') {
      searchParams.set('propertyType', payload.propertyType)
    }
    if (payload.budgetMin) {
      searchParams.set('budgetMin', payload.budgetMin)
    }
    if (payload.budgetMax) {
      searchParams.set('budgetMax', payload.budgetMax)
    }
    if (payload.queryText) {
      searchParams.set('q', payload.queryText)
    }

    navigate(`/search?${searchParams.toString()}`)

    try {
      await apiRequest('/search-activities', {
        method: 'POST',
        body: {
          ...payload,
          userId: user?._id || user?.userId,
        },
      })
    } catch {
      // Search activity logging is best-effort.
    }
  }

  return (
    <div ref={rootRef} className="mx-auto w-full max-w-368 overflow-visible rounded-[1.2rem] border border-slate-200 bg-white shadow-[0_28px_70px_rgba(15,23,42,0.14)]">
      <div className="grid grid-cols-2 overflow-hidden rounded-t-[1.15rem] bg-[#07223b] text-white sm:grid-cols-4 lg:grid-cols-7">
        {categoryTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`relative border-r border-white/10 px-3 py-4 text-sm font-semibold transition duration-200 last:border-r-0 ${
              activeTab === tab.key ? 'bg-[#001a31] text-white' : 'text-white/90 hover:bg-white/10'
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-md border border-white/20 bg-white/10">
                <TabIcon tabKey={tab.key} />
              </span>
              <span>{tab.label}</span>
            </span>
            {activeTab === tab.key ? <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#ffd400]" /> : null}
          </button>
        ))}
      </div>

      <div className="grid gap-2 bg-white p-2 lg:grid-cols-[1.2fr_1.8fr_1.2fr_1fr_1fr_1.1fr]">
        <div className="relative min-w-0">
          <button
            type="button"
            onClick={() => setOpenMenu(openMenu === 'location' ? null : 'location')}
            className={`flex h-14 w-full items-center justify-between rounded-xl border px-4 transition ${
              openMenu === 'location'
                ? 'border-(--color-primary) bg-slate-50 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-800">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><IconPin /></span>
              <span className="block truncate">{selectedCity}</span>
            </span>
            <TriggerChevron />
          </button>

          {openMenu === 'location' ? (
            <DropdownPanel title="Choose Location" className="w-96 max-w-[92vw]">
              <div className="border-b border-slate-100 p-4">
                <div className="relative">
                  <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={(event) => setLocationQuery(event.target.value)}
                    placeholder="Search city or locality"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-(--color-primary) focus:bg-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={useCurrentLocation}
                  className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-(--color-secondary-bg) text-sm font-semibold text-(--color-primary) transition hover:brightness-95"
                >
                  <IconPin />
                  {locationStatus === 'loading' ? 'Detecting location...' : 'Use current location'}
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto p-2">
                {filteredCities.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      setSelectedCity(city)
                      setOpenMenu(null)
                      setLocationQuery('')
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      selectedCity === city
                        ? 'bg-(--color-secondary-bg) font-semibold text-(--color-primary)'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{city}</span>
                    {selectedCity === city ? <span className="text-xs font-semibold">Selected</span> : null}
                  </button>
                ))}
              </div>
            </DropdownPanel>
          ) : null}
        </div>

        <label className="relative flex h-14 min-w-0 items-center rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-(--color-primary)">
          <span className="mr-3 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.85-5.15a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={queryText}
            onChange={(event) => setQueryText(event.target.value)}
            placeholder="Search by locality, landmark, project"
            className="w-full bg-transparent text-base text-slate-700 placeholder:text-slate-400 outline-none"
          />
        </label>

        <div className="relative min-w-0">
          <button
            type="button"
            onClick={() => setOpenMenu(openMenu === 'property' ? null : 'property')}
            className={`flex h-14 w-full items-center justify-between rounded-xl border px-4 transition ${
              openMenu === 'property'
                ? 'border-(--color-primary) bg-slate-50 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-800">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><IconHome /></span>
              <span className="block truncate">{selectedProperty === 'all' ? 'All Property Types' : selectedProperty}</span>
            </span>
            <TriggerChevron />
          </button>

          {openMenu === 'property' ? (
            <DropdownPanel title="Property Type" className="w-lg max-w-[92vw]">
              <div className="grid gap-4 p-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProperty('all')
                    setOpenMenu(null)
                  }}
                  className={`rounded-xl border px-3 py-2 text-left text-sm font-semibold transition ${
                    selectedProperty === 'all'
                      ? 'border-(--color-primary) bg-(--color-secondary-bg) text-(--color-primary)'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  All Types
                </button>
                <p className="hidden text-xs text-slate-500 md:block">Pick a property type for more focused search results.</p>
              </div>

              <div className="max-h-72 overflow-y-auto border-t border-slate-100 p-4">
                {PROPERTY_TYPE_GROUPS.map((group) => (
                  <div key={group.title} className="mb-4 last:mb-0">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{group.title}</p>
                    <div className="flex flex-wrap gap-2">
                      {group.options.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setSelectedProperty(option)
                            setOpenMenu(null)
                          }}
                          className={`rounded-full border px-3 py-1.5 text-sm transition ${
                            selectedProperty === option
                              ? 'border-(--color-primary) bg-(--color-secondary-bg) font-semibold text-(--color-primary)'
                              : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-xs text-slate-500">
                Browse {allPropertyOptions.length} property types
              </div>
            </DropdownPanel>
          ) : null}
        </div>

        <div className="relative min-w-0">
          <button
            type="button"
            onClick={() => setOpenMenu(openMenu === 'minBudget' ? null : 'minBudget')}
            className={`flex h-14 w-full items-center justify-between rounded-xl border px-3 transition ${
              openMenu === 'minBudget'
                ? 'border-(--color-primary) bg-slate-50 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-700">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><IconCurrency /></span>
              <span className="block truncate">{minBudget || 'Min Budget'}</span>
            </span>
            <TriggerChevron />
          </button>

          {openMenu === 'minBudget' ? (
            <DropdownPanel title="Minimum Budget" className="w-64 max-w-[92vw]">
              <div className="max-h-72 overflow-y-auto p-3">
                {budgetOptions.map((budget) => (
                  <button
                    key={`min-${budget || 'any'}`}
                    type="button"
                    onClick={() => {
                      setMinBudget(budget)
                      setOpenMenu(null)
                    }}
                    className={`mb-2 mr-2 rounded-full border px-3 py-1.5 text-sm transition ${
                      minBudget === budget
                        ? 'border-(--color-primary) bg-(--color-secondary-bg) font-semibold text-(--color-primary)'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {budget || 'No Min'}
                  </button>
                ))}
              </div>
            </DropdownPanel>
          ) : null}
        </div>

        <div className="relative min-w-0">
          <button
            type="button"
            onClick={() => setOpenMenu(openMenu === 'maxBudget' ? null : 'maxBudget')}
            className={`flex h-14 w-full items-center justify-between rounded-xl border px-3 transition ${
              openMenu === 'maxBudget'
                ? 'border-(--color-primary) bg-slate-50 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-700">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><IconCurrency /></span>
              <span className="block truncate">{maxBudget || 'Max Budget'}</span>
            </span>
            <TriggerChevron />
          </button>

          {openMenu === 'maxBudget' ? (
            <DropdownPanel title="Maximum Budget" className="w-64 max-w-[92vw]">
              <div className="max-h-72 overflow-y-auto p-3">
                {budgetOptions.map((budget) => (
                  <button
                    key={`max-${budget || 'any'}`}
                    type="button"
                    onClick={() => {
                      setMaxBudget(budget)
                      setOpenMenu(null)
                    }}
                    className={`mb-2 mr-2 rounded-full border px-3 py-1.5 text-sm transition ${
                      maxBudget === budget
                        ? 'border-(--color-primary) bg-(--color-secondary-bg) font-semibold text-(--color-primary)'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {budget || 'No Max'}
                  </button>
                ))}
              </div>
            </DropdownPanel>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleSearch}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#f6d400] px-4 text-lg font-semibold text-slate-900 transition hover:brightness-95"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.85-5.15a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
          Search
        </button>
      </div>

      <div className="px-3 pb-3 text-xs text-slate-500">
        {locationStatus === 'loading' ? 'Detecting your location for faster city search...' : null}
        {locationStatus === 'error' ? 'Auto-location unavailable right now. You can still choose city manually.' : null}
      </div>
    </div>
  )
}

export default SearchBar