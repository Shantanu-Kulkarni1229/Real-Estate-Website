import { useEffect, useMemo, useState } from 'react'

const topTabs = ['Buy', 'Rent']

const majorCities = [
  'All India',
  'Mumbai',
  'Delhi NCR',
  'Bengaluru',
  'Pune',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
  'Chandigarh',
  'Indore',
  'Surat',
  'Noida',
  'Navi Mumbai',
]

const propertyGroups = [
  {
    title: 'Residential',
    options: ['Flat', 'House/Villa', 'Plot'],
  },
  {
    title: 'Commercial',
    options: ['Office Space', 'Shop/Showroom', 'Commercial Land', 'Warehouse/Godown', 'Industrial Building', 'Industrial Shed'],
  },
  {
    title: 'Other Property Types',
    options: ['Agricultural Land', 'Farm House'],
  },
]

const budgetOptions = [
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

const getDetectedCity = async (latitude, longitude) => {
  const response = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
  )

  if (!response.ok) {
    throw new Error('Failed to fetch city')
  }

  const data = await response.json()
  return data.city || data.locality || data.principalSubdivision || 'All India'
}

const DropdownPanel = ({ title, children, className = '' }) => (
  <div
    className={`absolute left-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl ${className}`}
  >
    <div className="border-b border-slate-100 bg-linear-to-r from-white to-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-secondary-text)">{title}</p>
    </div>
    {children}
  </div>
)

const FilterTrigger = ({ label, value, onClick, isOpen, icon }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition duration-200 ${
      isOpen
        ? 'border-(--color-primary) bg-white shadow-md'
        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
    }`}
  >
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--color-secondary-bg) text-(--color-primary)">
        {icon}
      </span>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-(--color-secondary-text)">{label}</p>
        <p className="text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </button>
)

const SearchBar = () => {
  const geolocationSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator
  const [activeTab, setActiveTab] = useState('Buy')
  const [selectedCity, setSelectedCity] = useState('All India')
  const [citySearch, setCitySearch] = useState('')
  const [selectedProperty, setSelectedProperty] = useState('Residential')
  const [minBudget, setMinBudget] = useState('₹5 Lac')
  const [maxBudget, setMaxBudget] = useState('₹20 Cr')
  const [openMenu, setOpenMenu] = useState(null)

  useEffect(() => {
    if (!geolocationSupported) {
      return
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const detectedCity = await getDetectedCity(coords.latitude, coords.longitude)
          setSelectedCity(detectedCity)
        } catch {
          // Keep manual selection available
        }
      },
      () => {
        // User can still search manually
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    )
  }, [geolocationSupported])

  const filteredCities = useMemo(() => {
    const query = citySearch.trim().toLowerCase()
    if (!query) {
      return majorCities
    }

    return majorCities.filter((city) => city.toLowerCase().includes(query))
  }, [citySearch])

  const propertyOptions = useMemo(() => {
    return propertyGroups.flatMap((group) => group.options)
  }, [])

  const selectCurrentLocation = () => {
    if (!geolocationSupported) {
      return
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const detectedCity = await getDetectedCity(coords.latitude, coords.longitude)
          setSelectedCity(detectedCity)
          setCitySearch('')
          setOpenMenu(null)
        } catch {
          setOpenMenu(null)
        }
      },
      () => {
        setOpenMenu(null)
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    )
  }

  const renderLocationMenu = () => (
    <DropdownPanel title="Choose Location" className="w-96 max-w-[92vw]">
      <div className="border-b border-slate-100 p-4">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={citySearch}
            onChange={(event) => setCitySearch(event.target.value)}
            placeholder="Search city, locality..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 transition duration-200 focus:border-(--color-primary) focus:bg-white focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={selectCurrentLocation}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-(--color-secondary-bg) px-3 py-2 text-sm font-semibold text-(--color-primary) transition duration-200 hover:brightness-95"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Use current location
        </button>
      </div>

      <div className="max-h-56 overflow-y-auto p-2">
        {filteredCities.map((city) => (
          <button
            key={city}
            type="button"
            onClick={() => {
              setSelectedCity(city)
              setOpenMenu(null)
              setCitySearch('')
            }}
            className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition duration-150 ${
              selectedCity === city
                ? 'bg-(--color-secondary-bg) font-semibold text-(--color-primary)'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>{city}</span>
            {selectedCity === city ? (
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-(--color-primary)">
                Selected
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </DropdownPanel>
  )

  const renderPropertyMenu = () => (
    <DropdownPanel title="Property Type" className="w-176 max-w-[92vw]">
      <div className="grid gap-4 p-4 lg:grid-cols-3">
        {propertyGroups.map((group) => (
          <div key={group.title}>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-(--color-secondary-text)">
              {group.title}
            </h4>
            <div className="flex flex-wrap gap-2">
              {group.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setSelectedProperty(option)
                    setOpenMenu(null)
                  }}
                  className={`rounded-full border px-3 py-2 text-sm transition duration-150 ${
                    selectedProperty === option
                      ? 'border-(--color-primary) bg-(--color-secondary-bg) font-semibold text-(--color-primary)'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span>{option}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 text-xs text-(--color-secondary-text)">
        Browse {propertyOptions.length} property types
      </div>
    </DropdownPanel>
  )

  const renderBudgetMenu = () => (
    <DropdownPanel title="Budget" className="w-184 max-w-[92vw]">
      <div className="grid gap-4 p-4 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-(--color-secondary-text)">Minimum</p>
          <div className="flex max-h-56 flex-wrap gap-2 overflow-y-auto rounded-2xl border border-slate-100 p-2">
            {budgetOptions.map((budget) => (
              <button
                key={`min-${budget}`}
                type="button"
                onClick={() => setMinBudget(budget)}
                className={`rounded-full px-4 py-2 text-sm transition duration-150 ${
                  minBudget === budget
                    ? 'bg-(--color-secondary-bg) font-semibold text-(--color-primary)'
                    : 'border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>{budget}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-(--color-secondary-text)">Maximum</p>
          <div className="flex max-h-56 flex-wrap gap-2 overflow-y-auto rounded-2xl border border-slate-100 p-2">
            {budgetOptions.map((budget) => (
              <button
                key={`max-${budget}`}
                type="button"
                onClick={() => setMaxBudget(budget)}
                className={`rounded-full px-4 py-2 text-sm transition duration-150 ${
                  maxBudget === budget
                    ? 'bg-(--color-secondary-bg) font-semibold text-(--color-primary)'
                    : 'border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>{budget}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-4 py-3">
        <p className="text-xs text-(--color-secondary-text)">
          {minBudget} to {maxBudget}
        </p>
        <button
          type="button"
          onClick={() => setOpenMenu(null)}
          className="rounded-full bg-(--color-primary) px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition duration-200 hover:brightness-95"
        >
          Apply
        </button>
      </div>
    </DropdownPanel>
  )

  return (
    <div className="mx-auto w-full max-w-6xl overflow-visible rounded-[1.75rem] border border-white/70 bg-white p-4 shadow-[0_24px_80px_rgba(15,23,42,0.12)] sm:p-5 lg:p-6">
      <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-1 shadow-inner">
        {topTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition duration-200 sm:text-base ${
              activeTab === tab
                ? 'bg-white text-(--color-primary) shadow-md'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-5 grid items-start gap-3 lg:grid-cols-[1.35fr_1.35fr_1.35fr_0.95fr]">
        <div className="relative">
          <FilterTrigger
            label="Location"
            value={selectedCity}
            isOpen={openMenu === 'location'}
            onClick={() => setOpenMenu(openMenu === 'location' ? null : 'location')}
            icon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
          {openMenu === 'location' ? renderLocationMenu() : null}
        </div>

        <div className="relative">
          <FilterTrigger
            label="Property Type"
            value={selectedProperty}
            isOpen={openMenu === 'property'}
            onClick={() => setOpenMenu(openMenu === 'property' ? null : 'property')}
            icon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 21V8a2 2 0 012-2h3l2-3h4l2 3h3a2 2 0 012 2v13M9 21V11h6v10" />
              </svg>
            }
          />
          {openMenu === 'property' ? renderPropertyMenu() : null}
        </div>

        <div className="relative">
          <FilterTrigger
            label="Budget"
            value={`${minBudget} - ${maxBudget}`}
            isOpen={openMenu === 'budget'}
            onClick={() => setOpenMenu(openMenu === 'budget' ? null : 'budget')}
            icon={<span className="text-sm font-bold">₹</span>}
          />
          {openMenu === 'budget' ? renderBudgetMenu() : null}
        </div>

        <button className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-(--color-primary) px-6 py-4 text-sm font-semibold text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:brightness-95 hover:shadow-xl">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.85-5.15a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
          Search
        </button>
      </div>
    </div>
  )
}

export default SearchBar
