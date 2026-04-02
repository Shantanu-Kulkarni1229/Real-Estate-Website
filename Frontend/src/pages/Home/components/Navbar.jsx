import { useEffect, useState } from 'react'

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

const navItems = [
  {
    label: 'For Buyers',
    details: ['New Launches', 'Ready to Move Homes', 'Verified Listings'],
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m2 3l2-3m2 3l2-3m2 3l2-3m2 3l2-3M3 20h18a2 2 0 002-2V8a2 2 0 00-2-2H3a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: 'For Tenants',
    details: ['Rental Homes', 'PG & Coliving', 'Owner Verified Rentals'],
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
  },
  {
    label: 'For Owners/Sellers',
    details: ['List Property Fast', 'Get Qualified Leads', 'Seller Dashboard'],
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 0a2 2 0 100 4m0-4a2 2 0 110 4m0 0h.01M5 15a3 3 0 110-6 3 3 0 010 6z" />
      </svg>
    ),
  },
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

const NavMenuItem = ({ label, details, icon }) => {
  return (
    <li className="group relative">
      <button
        type="button"
        className="relative flex items-center gap-2 pb-2 text-sm font-medium text-slate-700 transition duration-200 hover:text-(--color-primary)"
      >
        <span className="transition duration-200 group-hover:text-(--color-primary)">{icon}</span>
        {label}
        <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-(--color-primary) transition-all duration-200 group-hover:w-full" />
      </button>

      <div className="pointer-events-none absolute left-1/2 top-full z-40 mt-3 w-80 -translate-x-1/2 translate-y-2 rounded-2xl border border-slate-100 bg-white p-5 opacity-0 shadow-xl transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
        <h4 className="text-base font-semibold text-slate-900">{label}</h4>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          {details.map((item) => (
            <li key={item} className="rounded-md px-2 py-1 transition duration-200 hover:bg-slate-50 hover:text-(--color-primary)">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </li>
  )
}

const CitySelector = ({ selectedCity, onCityChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCities = majorCities.filter((city) =>
    city.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCitySelect = (city) => {
    onCityChange(city)
    setIsDropdownOpen(false)
    setSearchQuery('')
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="group flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition duration-200 hover:border-slate-300 hover:bg-slate-50 focus:border-(--color-primary) focus:outline-none"
      >
        <svg
          className="h-4 w-4 text-slate-500 transition duration-200 group-hover:text-slate-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="font-medium">{selectedCity}</span>
        <svg
          className="h-4 w-4 transition duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7-7m0 0l-7 7m7-7v14" />
        </svg>
      </button>

      {isDropdownOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 w-72 rounded-xl border border-slate-100 bg-white shadow-2xl">
          <div className="border-b border-slate-100 p-3">
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
                placeholder="Search city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 transition duration-200 focus:border-(--color-primary) focus:bg-white focus:outline-none"
                autoFocus
              />
            </div>
          </div>
          <ul className="max-h-64 overflow-y-auto py-2">
            {filteredCities.length > 0 ? (
              filteredCities.map((city) => (
                <li key={city}>
                  <button
                    type="button"
                    onClick={() => handleCitySelect(city)}
                    className={`w-full px-4 py-2.5 text-left text-sm transition duration-150 ${
                      selectedCity === city
                        ? 'bg-(--color-secondary-bg) text-(--color-primary) font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {city}
                  </button>
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-center text-sm text-slate-500">
                No cities found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

const Navbar = () => {
  const geolocationSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCity, setSelectedCity] = useState('All India')

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
          // Use default city
        }
      },
      () => {
        // User denied permission, use default
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    )
  }, [geolocationSupported])

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-linear-to-r from-white via-white to-blue-50/30 shadow-sm backdrop-blur-md">
      <nav className="mx-auto flex w-full items-center justify-between px-4 py-3 lg:px-8">
        <div className="flex shrink-0 items-center gap-3 lg:gap-4">
          <a
            href="#"
            className="group relative whitespace-nowrap text-2xl font-bold tracking-tight text-(--color-primary) transition duration-200 hover:opacity-90"
          >
            CityPloter
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-(--color-primary) transition-all duration-300 group-hover:w-full" />
          </a>
          <div className="hidden sm:block">
            <CitySelector selectedCity={selectedCity} onCityChange={setSelectedCity} />
          </div>
        </div>

        <ul className="hidden flex-1 items-center justify-center gap-10 text-sm font-medium text-slate-700 lg:flex">
          {navItems.map((item) => (
            <NavMenuItem key={item.label} label={item.label} details={item.details} icon={item.icon} />
          ))}
        </ul>

        <div className="hidden shrink-0 items-center gap-3 lg:flex lg:gap-4">
          <button className="group relative overflow-hidden rounded-lg bg-(--color-cta-orange) px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:brightness-95">
            <span className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 transition duration-300 group-hover:opacity-20" />
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Post Property
            </span>
          </button>
          <div className="group relative">
            <button
              type="button"
              className="relative flex items-center gap-2 pb-1 text-sm font-medium text-slate-700 transition duration-200 hover:text-(--color-primary)"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-(--color-primary) transition-all duration-200 group-hover:w-full" />
            </button>
            <div className="pointer-events-none absolute right-0 top-full z-40 mt-3 w-72 translate-y-2 rounded-xl border border-slate-100 bg-linear-to-br from-white to-slate-50 p-5 opacity-0 shadow-2xl transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
              <h4 className="text-sm font-semibold text-slate-900">Get in touch</h4>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--color-secondary-bg)">
                    <svg className="h-4 w-4 text-(--color-primary)" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Email</p>
                    <p className="text-sm text-slate-700">support@cityploter.in</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--color-secondary-bg)">
                    <svg className="h-4 w-4 text-(--color-primary)" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Phone</p>
                    <p className="text-sm text-slate-700">+91 98765 43210</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button className="relative flex items-center gap-2 transform rounded-lg border-2 border-(--color-primary) px-5 py-2 text-sm font-semibold text-(--color-primary) transition duration-200 hover:translate-x-0.5 hover:bg-(--color-secondary-bg)">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Login / Signup
          </button>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 transition duration-200 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle menu"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>

      {isOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 shadow-sm lg:hidden">
          <div className="mb-4 sm:hidden">
            <CitySelector selectedCity={selectedCity} onCityChange={setSelectedCity} />
          </div>

          <ul className="space-y-3 text-sm font-medium text-slate-700">
            {navItems.map((item) => (
              <li key={item.label}>
                <a href="#" className="block rounded-md px-2 py-1 transition duration-200 hover:bg-slate-100 hover:text-(--color-primary)">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-col gap-3">
            <button className="group relative flex items-center gap-2 overflow-hidden rounded-lg bg-(--color-cta-orange) px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-200 hover:brightness-95">
              <span className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 transition duration-300 group-hover:opacity-20" />
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Post Property</span>
            </button>
            <div className="rounded-lg border border-slate-100 bg-linear-to-br from-white to-slate-50 px-4 py-3 shadow-sm">
              <p className="font-semibold text-slate-900">Contact</p>
              <p className="mt-2 text-sm text-slate-600">Email: support@cityploter.in</p>
              <p className="text-sm text-slate-600">Phone: +91 98765 43210</p>
            </div>
            <button className="relative flex items-center gap-2 rounded-lg border-2 border-(--color-primary) px-4 py-2 text-sm font-semibold text-(--color-primary) transition duration-200 hover:bg-(--color-secondary-bg)">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Login / Signup
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
