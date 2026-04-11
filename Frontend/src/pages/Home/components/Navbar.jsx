import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { CITY_OPTIONS } from '../../../constants/cities'

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

function normalizeCityKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
}

function canonicalizeCityName(rawCity) {
  if (!rawCity) return ''
  const normalizedKey = normalizeCityKey(rawCity)
  if (CITY_ALIASES[normalizedKey]) return CITY_ALIASES[normalizedKey]
  const exactMatch = CITY_OPTIONS.find((city) => normalizeCityKey(city) === normalizedKey)
  return exactMatch || String(rawCity).trim()
}

function createSearchLink({ searchType = 'buy', city, propertyType, q, minPrice, maxPrice } = {}) {
  const params = new URLSearchParams()
  if (searchType) params.set('searchType', searchType)
  if (city) params.set('city', city)
  if (propertyType) params.set('propertyType', propertyType)
  if (q) params.set('q', q)
  if (minPrice) params.set('minPrice', String(minPrice))
  if (maxPrice) params.set('maxPrice', String(maxPrice))
  return `/search?${params.toString()}`
}

const buyCityLinks = [
  { label: 'Property in Mumbai', to: createSearchLink({ searchType: 'buy', city: 'Mumbai' }) },
  { label: 'Property in Delhi', to: createSearchLink({ searchType: 'buy', city: 'Delhi' }) },
  { label: 'Property in Noida', to: createSearchLink({ searchType: 'buy', city: 'Noida' }) },
  { label: 'Property in Gurgaon', to: createSearchLink({ searchType: 'buy', city: 'Gurgaon' }) },
  { label: 'Property in Pune', to: createSearchLink({ searchType: 'buy', city: 'Pune' }) },
  { label: 'Property in Bangalore', to: createSearchLink({ searchType: 'buy', city: 'Bangalore' }) },
  { label: 'Property in Hyderabad', to: createSearchLink({ searchType: 'buy', city: 'Hyderabad' }) },
  { label: 'Property in Chennai', to: createSearchLink({ searchType: 'buy', city: 'Chennai' }) },
  { label: 'Property in Thane', to: createSearchLink({ searchType: 'buy', city: 'Thane' }) },
  { label: 'Property in Navi Mumbai', to: createSearchLink({ searchType: 'buy', city: 'Navi Mumbai' }) },
]

const flatCityLinks = [
  { label: 'Flats in Mumbai', to: createSearchLink({ searchType: 'buy', propertyType: 'Flat', city: 'Mumbai' }) },
  { label: 'Flats in Delhi', to: createSearchLink({ searchType: 'buy', propertyType: 'Flat', city: 'Delhi' }) },
  { label: 'Flats in Noida', to: createSearchLink({ searchType: 'buy', propertyType: 'Flat', city: 'Noida' }) },
  { label: 'Flats in Gurgaon', to: createSearchLink({ searchType: 'buy', propertyType: 'Flat', city: 'Gurgaon' }) },
  { label: 'Flats in Pune', to: createSearchLink({ searchType: 'buy', propertyType: 'Flat', city: 'Pune' }) },
  { label: 'Flats in Bangalore', to: createSearchLink({ searchType: 'buy', propertyType: 'Flat', city: 'Bangalore' }) },
  { label: 'Flats in Hyderabad', to: createSearchLink({ searchType: 'buy', propertyType: 'Flat', city: 'Hyderabad' }) },
  { label: 'Flats in Chennai', to: createSearchLink({ searchType: 'buy', propertyType: 'Flat', city: 'Chennai' }) },
  { label: 'Flats in Thane', to: createSearchLink({ searchType: 'buy', propertyType: 'Flat', city: 'Thane' }) },
  { label: 'Flats in Navi Mumbai', to: createSearchLink({ searchType: 'buy', propertyType: 'Flat', city: 'Navi Mumbai' }) },
]

const houseCityLinks = [
  { label: 'Houses in Mumbai', to: createSearchLink({ searchType: 'buy', propertyType: 'House/Villa', city: 'Mumbai' }) },
  { label: 'Houses in Delhi', to: createSearchLink({ searchType: 'buy', propertyType: 'House/Villa', city: 'Delhi' }) },
  { label: 'Houses in Noida', to: createSearchLink({ searchType: 'buy', propertyType: 'House/Villa', city: 'Noida' }) },
  { label: 'Houses in Gurgaon', to: createSearchLink({ searchType: 'buy', propertyType: 'House/Villa', city: 'Gurgaon' }) },
  { label: 'Houses in Pune', to: createSearchLink({ searchType: 'buy', propertyType: 'House/Villa', city: 'Pune' }) },
  { label: 'Houses in Bangalore', to: createSearchLink({ searchType: 'buy', propertyType: 'House/Villa', city: 'Bangalore' }) },
  { label: 'Houses in Hyderabad', to: createSearchLink({ searchType: 'buy', propertyType: 'House/Villa', city: 'Hyderabad' }) },
  { label: 'Houses in Chennai', to: createSearchLink({ searchType: 'buy', propertyType: 'House/Villa', city: 'Chennai' }) },
  { label: 'Houses in Thane', to: createSearchLink({ searchType: 'buy', propertyType: 'House/Villa', city: 'Thane' }) },
  { label: 'Houses in Navi Mumbai', to: createSearchLink({ searchType: 'buy', propertyType: 'House/Villa', city: 'Navi Mumbai' }) },
]

const launchCityLinks = [
  { label: 'New Launch in Mumbai', to: createSearchLink({ searchType: 'buy', city: 'Mumbai', q: 'new launch projects' }) },
  { label: 'New Launch in Delhi', to: createSearchLink({ searchType: 'buy', city: 'Delhi', q: 'new launch projects' }) },
  { label: 'New Launch in Noida', to: createSearchLink({ searchType: 'buy', city: 'Noida', q: 'new launch projects' }) },
  { label: 'New Launch in Gurgaon', to: createSearchLink({ searchType: 'buy', city: 'Gurgaon', q: 'new launch projects' }) },
  { label: 'New Launch in Pune', to: createSearchLink({ searchType: 'buy', city: 'Pune', q: 'new launch projects' }) },
  { label: 'New Launch in Bangalore', to: createSearchLink({ searchType: 'buy', city: 'Bangalore', q: 'new launch projects' }) },
  { label: 'New Launch in Hyderabad', to: createSearchLink({ searchType: 'buy', city: 'Hyderabad', q: 'new launch projects' }) },
  { label: 'New Launch in Chennai', to: createSearchLink({ searchType: 'buy', city: 'Chennai', q: 'new launch projects' }) },
  { label: 'New Launch in Thane', to: createSearchLink({ searchType: 'buy', city: 'Thane', q: 'new launch projects' }) },
  { label: 'New Launch in Navi Mumbai', to: createSearchLink({ searchType: 'buy', city: 'Navi Mumbai', q: 'new launch projects' }) },
]

const navItems = [
  {
    label: 'For Buyers',
    badge: null,
    columns: [
      { heading: 'Properties for Sale', links: buyCityLinks },
      { heading: 'Flats', links: flatCityLinks },
      { heading: 'Houses & Villas', links: houseCityLinks },
      { heading: 'New Launch Projects', links: launchCityLinks },
    ],
  },
  {
    label: 'For Tenants',
    badge: null,
    columns: [
      {
        heading: 'Apartments for Rent',
        links: [
          { label: 'Rent in Mumbai', to: createSearchLink({ searchType: 'rent', city: 'Mumbai' }) },
          { label: 'Rent in Delhi', to: createSearchLink({ searchType: 'rent', city: 'Delhi' }) },
          { label: 'Rent in Noida', to: createSearchLink({ searchType: 'rent', city: 'Noida' }) },
          { label: 'Rent in Gurgaon', to: createSearchLink({ searchType: 'rent', city: 'Gurgaon' }) },
          { label: 'Rent in Pune', to: createSearchLink({ searchType: 'rent', city: 'Pune' }) },
        ],
      },
      {
        heading: 'Popular Rental Types',
        links: [
          { label: '2BHK Rentals', to: createSearchLink({ searchType: 'rent', q: '2 bhk' }) },
          { label: '3BHK Rentals', to: createSearchLink({ searchType: 'rent', q: '3 bhk' }) },
          { label: 'PG & Co-living', to: createSearchLink({ searchType: 'rent', q: 'pg co living' }) },
          { label: 'Independent Houses', to: createSearchLink({ searchType: 'rent', propertyType: 'House/Villa' }) },
          { label: 'Furnished Homes', to: createSearchLink({ searchType: 'rent', q: 'furnished' }) },
        ],
      },
      {
        heading: 'Quick Filters',
        links: [
          { label: 'Budget under 20K', to: createSearchLink({ searchType: 'rent', maxPrice: 20000 }) },
          { label: 'Family Friendly', to: createSearchLink({ searchType: 'rent', q: 'family friendly' }) },
          { label: 'Bachelor Friendly', to: createSearchLink({ searchType: 'rent', q: 'bachelor friendly' }) },
          { label: 'Near Metro', to: createSearchLink({ searchType: 'rent', q: 'near metro' }) },
          { label: 'Pet Friendly', to: createSearchLink({ searchType: 'rent', q: 'pet friendly' }) },
        ],
      },
      {
        heading: 'Rental Tools',
        links: [
          { label: 'Rental Price Trends', to: createSearchLink({ searchType: 'rent', q: 'price trends' }) },
          { label: 'Explore Map View', to: createSearchLink({ searchType: 'rent', q: 'map view' }) },
          { label: 'Saved Rentals', to: createSearchLink({ searchType: 'rent', q: 'saved rentals' }) },
          { label: 'Connected Rentals', to: createSearchLink({ searchType: 'rent', q: 'connected rentals' }) },
          { label: 'Tenant Helpdesk', to: createSearchLink({ searchType: 'rent', q: 'tenant helpdesk' }) },
        ],
      },
    ],
  },
  {
    label: 'Owners & Sellers',
    badge: 'Free',
    columns: [
      {
        heading: 'List Your Property',
        links: [
          { label: 'Post in Mumbai', to: createSearchLink({ searchType: 'buy', city: 'Mumbai', q: 'owner listed' }) },
          { label: 'Post in Delhi', to: createSearchLink({ searchType: 'buy', city: 'Delhi', q: 'owner listed' }) },
          { label: 'Post in Bangalore', to: createSearchLink({ searchType: 'buy', city: 'Bangalore', q: 'owner listed' }) },
          { label: 'Post in Hyderabad', to: createSearchLink({ searchType: 'buy', city: 'Hyderabad', q: 'owner listed' }) },
        ],
      },
      {
        heading: 'Get Qualified Leads',
        links: [
          { label: 'Premium Listing Plans', to: createSearchLink({ searchType: 'buy', q: 'premium listings' }) },
          { label: 'Boost Visibility', to: createSearchLink({ searchType: 'buy', q: 'high visibility listings' }) },
          { label: 'Verified Owner Badge', to: createSearchLink({ searchType: 'buy', q: 'verified owner' }) },
          { label: 'Fast Lead Routing', to: createSearchLink({ searchType: 'buy', q: 'qualified leads' }) },
        ],
      },
      {
        heading: 'Seller Dashboard',
        links: [
          { label: 'Connected Leads', to: createSearchLink({ searchType: 'buy', q: 'active buyer leads' }) },
          { label: 'Liked by Buyers', to: createSearchLink({ searchType: 'buy', q: 'most liked properties' }) },
          { label: 'Manage Profile', to: createSearchLink({ searchType: 'buy', q: 'owner profiles' }) },
          { label: 'Performance Insights', to: createSearchLink({ searchType: 'buy', q: 'market insights' }) },
        ],
      },
      {
        heading: 'Owner Resources',
        links: [
          { label: 'Seller Guide', to: createSearchLink({ searchType: 'buy', q: 'seller guide' }) },
          { label: 'Pricing Advice', to: createSearchLink({ searchType: 'buy', q: 'property pricing' }) },
          { label: 'Legal Checklist', to: createSearchLink({ searchType: 'buy', q: 'legal verified' }) },
          { label: 'Support Center', to: createSearchLink({ searchType: 'buy', q: 'support' }) },
        ],
      },
    ],
  },
]

const accountMenuItems = [
  {
    label: 'Liked Properties',
    description: 'Saved listings you marked as favorite',
    to: '/dashboard?tab=liked',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    label: 'Connected Properties',
    description: 'Track your connection requests',
    to: '/dashboard?tab=connected',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    label: 'My Profile',
    description: 'Manage personal details',
    to: '/dashboard?tab=profile',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
]

const getDetectedCity = async (latitude, longitude) => {
  const response = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
  )
  if (!response.ok) throw new Error('Failed to fetch city')

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
    if (CITY_OPTIONS.includes(canonical)) return canonical
  }

  return canonicalizeCityName(candidates[0] || 'All India') || 'All India'
}

function getNavItemPrimaryLink(item) {
  return item?.columns?.[0]?.links?.[0]?.to || '/properties'
}

function prioritizeCityLinks(links, currentCity) {
  if (!Array.isArray(links) || links.length < 2 || !currentCity || currentCity === 'All India') return links

  const normalizedCity = String(currentCity).trim().toLowerCase()
  const cityPattern = ` in ${normalizedCity}`

  const cityIndex = links.findIndex((link) =>
    String(link?.label || '').trim().toLowerCase().includes(cityPattern),
  )

  if (cityIndex === 0) return links

  if (cityIndex === -1) {
    const baseLink = links[0]
    const [basePath, baseQuery = ''] = String(baseLink?.to || '').split('?')
    const params = new URLSearchParams(baseQuery)
    if (!params.has('city')) return links
    params.set('city', currentCity)
    const baseLabel = String(baseLink?.label || '').trim()
    const cityLabelMatch = baseLabel.match(/^(.*\bin\s+).+$/i)
    const label = cityLabelMatch ? `${cityLabelMatch[1]}${currentCity}` : `${baseLabel} ${currentCity}`
    return [{ ...baseLink, label, to: `${basePath}?${params.toString()}` }, ...links]
  }

  const prioritized = links[cityIndex]
  const remaining = links.filter((_, index) => index !== cityIndex)
  return [prioritized, ...remaining]
}

/* ─── NavMenuItem ─── */
const NavMenuItem = ({ label, columns, badge, menuAlign = 'center' }) => {
  const menuPositionClass = menuAlign === 'left'
    ? 'left-0 translate-x-0'
    : menuAlign === 'right'
      ? 'right-0 translate-x-0'
      : 'left-1/2 -translate-x-1/2'

  const arrowPositionClass = menuAlign === 'left'
    ? 'left-16 -translate-x-1/2'
    : menuAlign === 'right'
      ? 'right-16 translate-x-1/2'
      : 'left-1/2 -translate-x-1/2'

  return (
    <li className="group relative">
      <button
        type="button"
        className="nav-menu-trigger relative flex cursor-pointer items-center gap-1.5 py-1 text-sm font-medium text-[#1a1a2e] transition-all duration-200 hover:text-(--color-primary)"
      >
        {label}
        {badge && (
          <span className="rounded-full bg-(--color-primary) px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
            {badge}
          </span>
        )}
        <svg
          className="h-3 w-3 opacity-50 transition-transform duration-300 group-hover:rotate-180 group-hover:opacity-100"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M2 4l4 4 4-4" />
        </svg>
        <span className="absolute -bottom-0.5 left-0 h-[2px] w-0 rounded-full bg-(--color-primary) transition-all duration-300 group-hover:w-full" />
      </button>

      {/* Mega Menu */}
      <div className={`mega-menu pointer-events-none absolute top-full z-50 mt-3 w-[min(96vw,1100px)] translate-y-3 opacity-0 transition-all duration-300 ease-out group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 ${menuPositionClass}`}>
        {/* Arrow */}
        <div className={`absolute top-0 h-4 w-4 -translate-y-2 rotate-45 border-l border-t border-white/20 bg-white shadow-sm ${arrowPositionClass}`} />

        <div className="overflow-hidden rounded-2xl border border-gray-100/80 bg-white shadow-[0_24px_64px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.06)]">
          {/* Header strip */}
          <div className="border-b border-gray-100 bg-gradient-to-r from-[#fafbff] to-[#fff5f2] px-6 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-(--color-primary)">{label}</p>
          </div>

          <div className="grid grid-cols-4 gap-0 divide-x divide-gray-100 p-0">
            {columns.map((section, idx) => (
              <div key={section.heading} className="px-5 py-5">
                <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400">
                  {section.heading}
                </h4>
                <ul className="space-y-0">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="group/item flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-700 transition-all duration-150 hover:bg-(--color-secondary-bg) hover:text-(--color-primary)"
                      >
                        <span className="h-1 w-1 shrink-0 rounded-full bg-gray-300 transition-all duration-150 group-hover/item:bg-(--color-primary)" />
                        <span className="leading-snug">{link.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </li>
  )
}

function getDisplayName(user) {
  if (!user) return 'Guest'
  if (user.firstName && String(user.firstName).trim()) return String(user.firstName).trim()
  return 'User'
}

/* ─── CitySelector ─── */
const CitySelector = ({ selectedCity, onCityChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const ref = useRef(null)

  const filteredCities = CITY_OPTIONS.filter((city) =>
    city.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCitySelect = (city) => {
    onCityChange(city)
    setIsDropdownOpen(false)
    setSearchQuery('')
  }

  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="city-btn group flex items-center gap-2 rounded-xl border border-gray-200 bg-white/80 px-3 py-1.5 text-sm font-medium text-gray-700 backdrop-blur-sm transition-all duration-200 hover:border-(--color-primary)/40 hover:bg-white hover:shadow-sm"
      >
        <svg className="h-3.5 w-3.5 text-(--color-primary)" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.079 3.941-5.297 3.941-9.115a9.234 9.234 0 00-9.233-9.234 9.234 9.234 0 00-9.233 9.234c0 3.818 1.997 7.036 3.94 9.115a19.58 19.58 0 002.684 2.282 16.975 16.975 0 001.144.742zM12 13.45a4.216 4.216 0 100-8.433 4.216 4.216 0 000 8.433z" clipRule="evenodd" />
        </svg>
        <span className="max-w-[100px] truncate">{selectedCity}</span>
        <svg
          className={`h-3 w-3 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isDropdownOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
          <div className="bg-gradient-to-r from-[#fafbff] to-[#fff5f2] p-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-(--color-primary)/50 focus:outline-none focus:ring-2 focus:ring-(--color-secondary-bg)"
                autoFocus
              />
            </div>
          </div>
          <ul className="max-h-60 overflow-y-auto py-1.5">
            {filteredCities.length > 0 ? (
              filteredCities.map((city) => (
                <li key={city}>
                  <button
                    type="button"
                    onClick={() => handleCitySelect(city)}
                    className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-all duration-150 ${
                      selectedCity === city
                        ? 'bg-(--color-secondary-bg) font-semibold text-(--color-primary)'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {selectedCity === city && (
                      <svg className="h-3.5 w-3.5 shrink-0 text-(--color-primary)" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    )}
                    {selectedCity !== city && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gray-300" />}
                    {city}
                  </button>
                </li>
              ))
            ) : (
              <li className="px-4 py-6 text-center text-sm text-gray-400">No cities found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

/* ─── Navbar ─── */
const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const geolocationSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator
  const [isOpen, setIsOpen] = useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const [isNavElevated, setIsNavElevated] = useState(false)
  const [selectedCity, setSelectedCity] = useState('All India')
  const displayName = getDisplayName(user)
  const roleLabel = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'
  const accountMenuRef = useRef(null)

  useEffect(() => {
    if (!geolocationSupported) return
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const detectedCity = await getDetectedCity(coords.latitude, coords.longitude)
          setSelectedCity(detectedCity)
        } catch { /* use default */ }
      },
      () => { /* permission denied */ },
      GEOLOCATION_OPTIONS,
    )
  }, [geolocationSupported])

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!accountMenuRef.current || accountMenuRef.current.contains(event.target)) return
      setIsAccountMenuOpen(false)
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    let ticking = false
    const updateNavState = () => {
      setIsNavElevated(window.scrollY > 24)
      ticking = false
    }
    const onScroll = () => {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(updateNavState)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    updateNavState()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navItemsWithPriorityCity = useMemo(() => {
    const currentCity = canonicalizeCityName(selectedCity)
    if (!currentCity || currentCity === 'All India') return navItems

    return navItems.map((item) => ({
      ...item,
      columns: item.columns.map((section) => ({
        ...section,
        links: prioritizeCityLinks(section.links, currentCity),
      })),
    }))
  }, [selectedCity])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Sans:wght@400;500;600&display=swap');

        .navbar-root {
          font-family: 'DM Sans', sans-serif;
        }
        .brand-logo {
          font-family: 'Sora', sans-serif;
        }
        .nav-menu-trigger::after {
          content: '';
          position: absolute;
          inset: -8px -12px;
        }
        .mega-menu::before {
          content: '';
          position: absolute;
          top: -12px;
          left: 0;
          right: 0;
          height: 12px;
        }
        .mobile-drawer {
          animation: slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .post-btn {
          background: var(--color-primary);
          box-shadow: 0 2px 12px rgba(37, 99, 235, 0.35);
        }
        .post-btn:hover {
          filter: brightness(0.95);
          box-shadow: 0 4px 20px rgba(37, 99, 235, 0.45);
          transform: translateY(-1px);
        }
        .post-btn:active {
          transform: translateY(0);
        }
        .login-btn {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        }
        .login-btn:hover {
          background: linear-gradient(135deg, #0f0f1a 0%, #0d1526 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(26,26,46,0.3);
        }
      `}</style>

      <header
        className={`navbar-root js-main-navbar sticky top-0 z-50 transition-all duration-300 ${
          isNavElevated
            ? 'border-b border-gray-200/60 bg-white/95 shadow-[0_4px_24px_rgba(0,0,0,0.08)] backdrop-blur-xl'
            : 'border-b border-gray-100 bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)]'
        }`}
      >
        <nav
          className={`mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 lg:px-8 transition-all duration-300 ${
            isNavElevated ? 'py-2' : 'py-3'
          }`}
        >
          {/* ── Left: Logo + City ── */}
          <div className="flex shrink-0 items-center gap-3">
            <Link to="/" className="group flex items-center gap-2">
              {/* Logo mark */}
              <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-[#1a1a2e]">
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-(--color-primary)" />
              </div>
              {/* Brand name */}
              <span className="brand-logo whitespace-nowrap text-xl font-bold tracking-tight text-[#1a1a2e] transition-opacity duration-200 group-hover:opacity-80">
                City<span className="text-(--color-primary)">Ploter</span>
              </span>
            </Link>

            {/* Divider */}
            <div className="hidden h-6 w-px bg-gray-200 sm:block" />

            <div className="hidden sm:block">
              <CitySelector selectedCity={selectedCity} onCityChange={setSelectedCity} />
            </div>
          </div>

          {/* ── Center: Nav Items ── */}
          <ul className="hidden flex-1 items-center justify-center gap-8 lg:flex">
            {navItemsWithPriorityCity.map((item, index) => (
              <NavMenuItem
                key={item.label}
                label={item.label}
                columns={item.columns}
                badge={item.badge}
                menuAlign={index === 0 ? 'left' : index === navItemsWithPriorityCity.length - 1 ? 'right' : 'center'}
              />
            ))}
          </ul>

          {/* ── Right: Actions ── */}
          <div className="hidden shrink-0 items-center gap-2.5 lg:flex">
            {/* Admin Panel */}
            {user?.role === 'admin' && (
              <Link
                to="/admin/properties"
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm"
              >
                <svg className="h-3.5 w-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Admin
              </Link>
            )}

            {/* Contact hover menu */}
            <div className="group relative">
              <button
                type="button"
                className="nav-menu-trigger flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-gray-50 hover:text-gray-900"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact
              </button>

              <div className="pointer-events-none absolute right-0 top-full z-40 mt-2 w-72 translate-y-2 origin-top-right scale-95 overflow-hidden rounded-2xl border border-gray-100 bg-white opacity-0 shadow-[0_20px_60px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100">
                <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] px-5 py-4">
                  <p className="text-sm font-semibold text-white">Get in Touch</p>
                  <p className="mt-0.5 text-xs text-white/60">We typically reply within 2 hours</p>
                </div>
                <div className="p-4 space-y-3">
                  <a href="mailto:support@cityploter.in" className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3 transition-all duration-150 hover:border-(--color-primary)/20 hover:bg-(--color-secondary-bg)">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--color-secondary-bg)">
                      <svg className="h-4 w-4 text-(--color-primary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-400">Email us</p>
                      <p className="text-sm font-semibold text-gray-800">support@cityploter.in</p>
                    </div>
                  </a>
                  <a href="tel:+919876543210" className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3 transition-all duration-150 hover:border-(--color-primary)/20 hover:bg-(--color-secondary-bg)">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--color-secondary-bg)">
                      <svg className="h-4 w-4 text-(--color-primary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-400">Call us</p>
                      <p className="text-sm font-semibold text-gray-800">+91 98765 43210</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Post Property CTA */}
            <Link
              to="/post-property"
              className="post-btn flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Post Property
              <span className="rounded-full bg-white/25 px-1.5 py-0.5 text-[10px] font-bold leading-none">FREE</span>
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="relative" ref={accountMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-200 hover:shadow-sm ${
                    isAccountMenuOpen
                        ? 'border-(--color-primary)/30 bg-(--color-secondary-bg) text-(--color-primary)'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1a1a2e] text-white">
                    <span className="text-[11px] font-bold">
                      {String(displayName).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span>{displayName}</span>
                  <svg
                    className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${isAccountMenuOpen ? 'rotate-180 text-(--color-primary)' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isAccountMenuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
                    {/* User header */}
                    <div className="flex items-center gap-3 border-b border-gray-100 bg-gradient-to-r from-[#1a1a2e] to-[#16213e] px-4 py-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                        <span className="text-base font-bold">
                          {String(displayName).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Welcome, {displayName}</p>
                        <p className="text-xs text-white/50">{roleLabel} Account</p>
                      </div>
                    </div>

                    <div className="p-2">
                      {accountMenuItems.map((item) => (
                        <Link
                          key={item.label}
                          to={item.to}
                          onClick={() => setIsAccountMenuOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150 hover:bg-gray-50"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--color-secondary-bg) text-(--color-primary)">
                            {item.icon}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                            <p className="text-xs text-gray-400">{item.description}</p>
                          </div>
                        </Link>
                      ))}
                    </div>

                    <div className="border-t border-gray-100 p-3">
                      <button
                        type="button"
                        onClick={() => { setIsAccountMenuOpen(false); logout() }}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 py-2.5 text-sm font-semibold text-gray-600 transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="login-btn flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Login / Sign up
              </Link>
            )}
          </div>

          {/* ── Mobile Hamburger ── */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white p-2 text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm lg:hidden"
            aria-label="Toggle menu"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            {isOpen ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </nav>

        {/* ── Mobile Drawer ── */}
        {isOpen && (
          <div className="mobile-drawer border-t border-gray-100 bg-white lg:hidden">
            <div className="px-4 py-4 space-y-4">
              {/* City selector mobile */}
              <div className="sm:hidden">
                <CitySelector selectedCity={selectedCity} onCityChange={setSelectedCity} />
              </div>

              {/* Nav links */}
              <div className="space-y-1">
                {navItemsWithPriorityCity.map((item) => (
                  <Link
                    key={item.label}
                    to={getNavItemPrimaryLink(item)}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 transition-all duration-150 hover:bg-(--color-secondary-bg) hover:text-(--color-primary)"
                  >
                    <span>{item.label}</span>
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>

              <div className="space-y-2.5 border-t border-gray-100 pt-4">
                {/* Post Property */}
                <Link
                  to="/post-property"
                  onClick={() => setIsOpen(false)}
                  className="post-btn flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Post Property Free
                </Link>

                {/* Contact block */}
                <div className="overflow-hidden rounded-xl border border-gray-100">
                  <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] px-4 py-3">
                    <p className="text-sm font-semibold text-white">Contact Us</p>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-gray-100 bg-gray-50/50">
                    <a href="mailto:support@cityploter.in" className="px-4 py-3 text-center hover:bg-white">
                      <p className="text-xs text-gray-400">Email</p>
                      <p className="mt-0.5 text-xs font-semibold text-(--color-primary)">support@cityploter.in</p>
                    </a>
                    <a href="tel:+919876543210" className="px-4 py-3 text-center hover:bg-white">
                      <p className="text-xs text-gray-400">Phone</p>
                      <p className="mt-0.5 text-xs font-semibold text-gray-700">+91 98765 43210</p>
                    </a>
                  </div>
                </div>

                {/* Auth */}
                {isAuthenticated ? (
                  <div className="overflow-hidden rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3 border-b border-gray-100 bg-gradient-to-r from-[#1a1a2e] to-[#16213e] px-4 py-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white">
                        <span className="text-sm font-bold">{String(displayName).charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{displayName}</p>
                        <p className="text-xs text-white/50">{roleLabel}</p>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {accountMenuItems.map((item) => (
                        <Link
                          key={item.label}
                          to={item.to}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-all duration-150 hover:bg-gray-50"
                        >
                          <span className="text-gray-400">{item.icon}</span>
                          {item.label}
                        </Link>
                      ))}
                      <button
                        type="button"
                        onClick={() => { setIsOpen(false); logout() }}
                        className="flex w-full items-center gap-3 bg-white px-4 py-3 text-sm font-semibold text-red-500 transition-all duration-150 hover:bg-red-50"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setIsOpen(false)}
                    className="login-btn flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Login / Sign up
                  </Link>
                )}

                {user?.role === 'admin' && (
                  <Link
                    to="/admin/properties"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50"
                  >
                    Admin Panel
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}

export default Navbar