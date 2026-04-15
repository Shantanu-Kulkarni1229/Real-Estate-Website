import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { CITY_OPTIONS } from '../../../constants/cities'

const GEOLOCATION_OPTIONS = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }

const CITY_ALIASES = {
  aurangabad: 'Chhatrapati Sambhajinagar',
  'chhatrapati sambhaji nagar': 'Chhatrapati Sambhajinagar',
  'chhatrapati sambhajinagr': 'Chhatrapati Sambhajinagar',
}

function normalizeCityKey(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ')
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
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.75L12 4l9 6.75V20a1 1 0 01-1 1h-5.5v-6h-5V21H4a1 1 0 01-1-1v-9.25z"/></svg>,
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
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 7V5a4 4 0 118 0v2m-9 0h10a2 2 0 012 2v9a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2z"/></svg>,
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
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v16m8-8H4"/></svg>,
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
    label: 'Commercial CRM',
    description: 'Manage your listings and leads pipeline',
    to: '/crm',
    color: '#0ea5e9',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h18M6 3h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z"/><path d="M8 11h8M8 15h5"/></svg>,
  },
  {
    label: 'Liked Properties',
    description: 'Listings you marked as favourite',
    to: '/dashboard?tab=liked',
    color: '#ef4444',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>,
  },
  {
    label: 'Connected Properties',
    description: 'Track your connection requests',
    to: '/dashboard?tab=connected',
    color: '#2563eb',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>,
  },
  {
    label: 'My Profile',
    description: 'Manage personal details',
    to: '/dashboard?tab=profile',
    color: '#7c3aed',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>,
  },
]

const getDetectedCity = async (latitude, longitude) => {
  const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
  if (!response.ok) throw new Error('Failed to fetch city')
  const data = await response.json()
  const administrativeNames = Array.isArray(data?.localityInfo?.administrative)
    ? data.localityInfo.administrative.map((item) => item?.name).filter(Boolean) : []
  const candidates = [data?.city, data?.locality, ...administrativeNames, data?.principalSubdivision].filter(Boolean)
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
  const cityIndex = links.findIndex((link) => String(link?.label || '').trim().toLowerCase().includes(cityPattern))
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

function getDisplayName(user) {
  if (!user) return 'Guest'
  if (user.firstName && String(user.firstName).trim()) return String(user.firstName).trim()
  return 'User'
}

/* ─── NavMenuItem ─── */
const NavMenuItem = ({ label, columns, badge, menuAlign = 'center', icon }) => {
  const menuPositionClass =
    menuAlign === 'left' ? 'left-0' : menuAlign === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2'
  const arrowLeft =
    menuAlign === 'left' ? '2rem' : menuAlign === 'right' ? 'auto' : '50%'
  const arrowRight = menuAlign === 'right' ? '2rem' : 'auto'
  const arrowTransform = menuAlign === 'center' ? 'translateX(-50%)' : 'none'

  return (
    <li className="nb-group relative" style={{ listStyle: 'none' }}>
      <button
        type="button"
        className="nb-trigger"
      >
        <span className="nb-trigger-icon">{icon}</span>
        <span className="nb-trigger-label">{label}</span>
        {badge && <span className="nb-trigger-badge">{badge}</span>}
        <svg className="nb-chevron" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2 4l4 4 4-4"/>
        </svg>
        <span className="nb-trigger-underline" />
      </button>

      {/* Mega menu */}
      <div className={`nb-mega ${menuPositionClass}`}>
        {/* Arrow */}
        <div
          className="nb-arrow"
          style={{ left: arrowLeft, right: arrowRight, transform: arrowTransform }}
        />

        <div className="nb-mega-inner">
          {/* Top accent strip */}
          <div className="nb-mega-header">
            <div className="nb-mega-header-icon">{icon}</div>
            <span className="nb-mega-header-label">{label}</span>
            <span className="nb-mega-header-count">{columns.reduce((acc, c) => acc + c.links.length, 0)} listings</span>
          </div>

          {/* Columns */}
          <div className="nb-mega-cols">
            {columns.map((section, idx) => (
              <div key={section.heading} className="nb-mega-col" style={{ animationDelay: `${idx * 0.04}s` }}>
                <h4 className="nb-col-heading">{section.heading}</h4>
                <ul className="nb-col-links">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link to={link.to} className="nb-link-item">
                        <span className="nb-link-dot" />
                        <span className="nb-link-text">{link.label}</span>
                        <svg className="nb-link-arrow" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2 6h8M7 3l3 3-3 3"/>
                        </svg>
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

/* ─── CitySelector ─── */
const CitySelector = ({ selectedCity, onCityChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const ref = useRef(null)

  const filteredCities = CITY_OPTIONS.filter((city) => city.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleCitySelect = (city) => { onCityChange(city); setIsDropdownOpen(false); setSearchQuery('') }

  useEffect(() => {
    const handleOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsDropdownOpen(false) }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  return (
    <div className="cs-root" ref={ref}>
      <button type="button" className={`cs-trigger ${isDropdownOpen ? 'open' : ''}`} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
        <svg className="cs-pin" viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.079 3.941-5.297 3.941-9.115a9.234 9.234 0 00-9.233-9.234 9.234 9.234 0 00-9.233 9.234c0 3.818 1.997 7.036 3.94 9.115a19.58 19.58 0 002.684 2.282 16.975 16.975 0 001.144.742zM12 13.45a4.216 4.216 0 100-8.433 4.216 4.216 0 000 8.433z" clipRule="evenodd"/>
        </svg>
        <span className="cs-city-name">{selectedCity}</span>
        <svg className={`cs-chevron ${isDropdownOpen ? 'rotated' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {isDropdownOpen && (
        <div className="cs-dropdown">
          <div className="cs-search-wrap">
            <svg className="cs-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text" placeholder="Search cities…" value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="cs-search-input" autoFocus
            />
          </div>
          <ul className="cs-city-list">
            {filteredCities.length > 0 ? filteredCities.map((city) => (
              <li key={city}>
                <button type="button" onClick={() => handleCitySelect(city)}
                  className={`cs-city-item ${selectedCity === city ? 'selected' : ''}`}>
                  {selectedCity === city
                    ? <svg style={{ width: 13, height: 13, flexShrink: 0 }} viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd"/></svg>
                    : <span className="cs-dot" />}
                  {city}
                </button>
              </li>
            )) : (
              <li className="cs-empty">No cities found</li>
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
        try { setSelectedCity(await getDetectedCity(coords.latitude, coords.longitude)) } catch { /* use default */ }
      },
      () => {},
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
    if (typeof window === 'undefined') return
    let ticking = false
    const updateNavState = () => { setIsNavElevated(window.scrollY > 24); ticking = false }
    const onScroll = () => { if (ticking) return; ticking = true; window.requestAnimationFrame(updateNavState) }
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
        @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;600;700;800&family=Bricolage+Grotesque:wght@400;500;600;700&display=swap');

        /* ── base ── */
        .nb-root { font-family: 'Cabinet Grotesk', 'Bricolage Grotesque', sans-serif; }
        .nb-brand-font { font-family: 'Bricolage Grotesque', sans-serif; }
        *, *::before, *::after { box-sizing: border-box; }

        /* ── navbar ── */
        .nb-header {
          position: sticky; top: 0; z-index: 50;
          transition: all 0.3s cubic-bezier(.4,0,.2,1);
          font-family: 'Cabinet Grotesk', sans-serif;
        }
        .nb-header.flat {
          background: rgba(255,255,255,0.98);
          border-bottom: 1px solid rgba(148,163,184,0.15);
          box-shadow: 0 1px 0 rgba(0,0,0,0.04);
        }
        .nb-header.elevated {
          background: rgba(255,255,255,0.97);
          border-bottom: 1px solid rgba(148,163,184,0.2);
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(15,23,42,0.1), 0 1px 0 rgba(255,255,255,0.8);
        }

        /* ── top progress bar ── */
        .nb-top-bar {
          height: 2.5px;
          background: linear-gradient(90deg, var(--color-primary,#2563eb) 0%, #6366f1 50%, var(--color-cta-orange,#f97316) 100%);
        }

        .nb-nav {
          max-width: 1440px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 2rem;
          transition: all 0.3s ease;
        }
        .nb-nav.tall { padding-top: 0.875rem; padding-bottom: 0.875rem; }
        .nb-nav.compact { padding-top: 0.5rem; padding-bottom: 0.5rem; }

        /* ── logo ── */
        .nb-logo {
          display: flex; align-items: center; gap: 0.6rem;
          text-decoration: none; flex-shrink: 0;
        }
        .nb-logo-mark {
          width: 38px; height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, #0d1526 0%, #1e3a5f 100%);
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
          box-shadow: 0 4px 12px rgba(13,21,38,0.35), 0 0 0 1px rgba(255,255,255,0.08) inset;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .nb-logo:hover .nb-logo-mark {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(13,21,38,0.4);
        }
        .nb-logo-mark-dot {
          position: absolute; bottom: 2px; right: 2px;
          width: 10px; height: 10px; border-radius: 50%;
          background: var(--color-cta-orange, #f97316);
          box-shadow: 0 0 0 2px rgba(13,21,38,1);
        }
        .nb-logo-text {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 1.35rem; font-weight: 800;
          letter-spacing: -0.04em; color: #0d1526;
          transition: opacity 0.2s;
        }
        .nb-logo:hover .nb-logo-text { opacity: 0.85; }
        .nb-logo-text span { color: var(--color-primary, #2563eb); }

        /* ── divider ── */
        .nb-divider { width: 1px; height: 22px; background: rgba(148,163,184,0.3); flex-shrink: 0; }

        /* ── center nav list ── */
        .nb-nav-list {
          display: flex; align-items: center; gap: 0.25rem;
          list-style: none; margin: 0; padding: 0; flex: 1; justify-content: center;
        }

        /* ── nav trigger button ── */
        .nb-trigger {
          display: flex; align-items: center; gap: 0.4rem;
          padding: 0.5rem 0.75rem;
          border: none; background: transparent;
          font-family: 'Cabinet Grotesk', sans-serif;
          font-size: 0.9375rem; font-weight: 600;
          color: #1e293b; cursor: pointer;
          border-radius: 0.75rem;
          transition: all 0.18s ease;
          position: relative;
          letter-spacing: -0.01em;
          white-space: nowrap;
        }
        .nb-trigger-icon { width: 16px; height: 16px; color: #64748b; flex-shrink: 0; transition: color 0.18s; }
        .nb-trigger-label { }
        .nb-trigger-badge {
          font-size: 0.6rem; font-weight: 800;
          letter-spacing: 0.06em; text-transform: uppercase;
          background: linear-gradient(135deg, var(--color-primary,#2563eb), #6366f1);
          color: white; padding: 0.15rem 0.45rem;
          border-radius: 999px; line-height: 1.4;
        }
        .nb-chevron { width: 11px; height: 11px; color: #94a3b8; transition: transform 0.25s ease, color 0.18s; flex-shrink: 0; }
        .nb-trigger-underline {
          position: absolute; bottom: 4px; left: 0.75rem; right: 0.75rem;
          height: 2px; border-radius: 2px;
          background: var(--color-primary, #2563eb);
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.25s cubic-bezier(.4,0,.2,1);
        }

        .nb-group:hover .nb-trigger {
          color: var(--color-primary, #2563eb);
          background: rgba(239,246,255,0.7);
        }
        .nb-group:hover .nb-trigger-icon { color: var(--color-primary, #2563eb); }
        .nb-group:hover .nb-chevron { transform: rotate(180deg); color: var(--color-primary,#2563eb); }
        .nb-group:hover .nb-trigger-underline { transform: scaleX(1); }

        /* ── mega menu ── */
        .nb-mega {
          position: absolute; top: calc(100% + 0.75rem); z-index: 100;
          width: min(96vw, 1080px);
          opacity: 0; transform: translateY(10px) scale(0.98);
          pointer-events: none;
          transition: all 0.28s cubic-bezier(.22,1,.36,1);
        }
        .nb-group:hover .nb-mega {
          opacity: 1; transform: translateY(0) scale(1);
          pointer-events: auto;
        }
        /* hover bridge */
        .nb-mega::before {
          content: ''; position: absolute;
          top: -12px; left: 0; right: 0; height: 12px;
        }

        /* arrow */
        .nb-arrow {
          position: absolute; top: -7px;
          width: 14px; height: 14px;
          background: white; border-radius: 3px 0 0 0;
          border-left: 1px solid rgba(148,163,184,0.2);
          border-top: 1px solid rgba(148,163,184,0.2);
          transform: rotate(45deg);
          z-index: 1;
        }

        .nb-mega-inner {
          background: white;
          border-radius: 1.25rem;
          border: 1px solid rgba(148,163,184,0.18);
          box-shadow: 0 32px 80px rgba(15,23,42,0.15), 0 4px 16px rgba(15,23,42,0.06), 0 0 0 1px rgba(255,255,255,0.9) inset;
          overflow: hidden;
        }

        /* mega header */
        .nb-mega-header {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.9rem 1.5rem;
          background: linear-gradient(to right, #f8faff, rgba(248,250,255,0.4));
          border-bottom: 1px solid rgba(148,163,184,0.12);
        }
        .nb-mega-header-icon {
          width: 30px; height: 30px; border-radius: 8px;
          background: rgba(239,246,255,0.9);
          display: flex; align-items: center; justify-content: center;
          color: var(--color-primary, #2563eb);
        }
        .nb-mega-header-icon svg { width: 16px; height: 16px; }
        .nb-mega-header-label {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 0.875rem; font-weight: 700;
          color: #0f172a; letter-spacing: -0.02em;
          flex: 1;
        }
        .nb-mega-header-count {
          font-size: 0.72rem; font-weight: 600;
          color: #94a3b8; letter-spacing: 0.02em;
          background: rgba(148,163,184,0.12);
          padding: 0.2rem 0.6rem; border-radius: 999px;
        }

        /* columns */
        .nb-mega-cols {
          display: grid; grid-template-columns: repeat(4, 1fr);
          divide-x: rgba(148,163,184,0.1);
        }
        .nb-mega-col {
          padding: 1.25rem 1.25rem 1.5rem;
          border-right: 1px solid rgba(148,163,184,0.1);
          animation: colFade 0.3s ease both;
        }
        .nb-mega-col:last-child { border-right: none; }
        @keyframes colFade {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .nb-col-heading {
          font-size: 0.68rem; font-weight: 800;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #94a3b8; margin: 0 0 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(148,163,184,0.12);
        }

        .nb-col-links { list-style: none; padding: 0; margin: 0; }

        .nb-link-item {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.4rem 0.5rem;
          border-radius: 0.5rem;
          text-decoration: none;
          font-size: 0.875rem; font-weight: 500;
          color: #334155; line-height: 1.4;
          transition: all 0.15s ease;
          group: true;
        }
        .nb-link-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: rgba(148,163,184,0.5); flex-shrink: 0;
          transition: all 0.15s ease;
        }
        .nb-link-text { flex: 1; }
        .nb-link-arrow {
          width: 10px; height: 10px;
          opacity: 0; color: var(--color-primary,#2563eb);
          transform: translateX(-4px);
          transition: all 0.15s ease;
          flex-shrink: 0;
        }
        .nb-link-item:hover {
          background: rgba(239,246,255,0.8);
          color: var(--color-primary, #2563eb);
        }
        .nb-link-item:hover .nb-link-dot {
          background: var(--color-primary, #2563eb);
          transform: scale(1.4);
        }
        .nb-link-item:hover .nb-link-arrow {
          opacity: 1; transform: translateX(0);
        }

        /* ── city selector ── */
        .cs-root { position: relative; }
        .cs-trigger {
          display: flex; align-items: center; gap: 0.45rem;
          padding: 0.45rem 0.75rem;
          border-radius: 0.75rem;
          border: 1.5px solid rgba(148,163,184,0.3);
          background: rgba(248,250,255,0.8);
          backdrop-filter: blur(8px);
          font-family: 'Cabinet Grotesk', sans-serif;
          font-size: 0.875rem; font-weight: 600;
          color: #334155; cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .cs-trigger:hover, .cs-trigger.open {
          border-color: rgba(37,99,235,0.4);
          background: white;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.08);
          color: var(--color-primary, #2563eb);
        }
        .cs-pin { width: 13px; height: 13px; color: var(--color-primary,#2563eb); flex-shrink: 0; }
        .cs-city-name { max-width: 100px; overflow: hidden; text-overflow: ellipsis; }
        .cs-chevron { width: 12px; height: 12px; color: #94a3b8; transition: transform 0.2s ease; flex-shrink: 0; }
        .cs-chevron.rotated { transform: rotate(180deg); }

        .cs-dropdown {
          position: absolute; top: calc(100% + 8px); left: 0;
          width: 280px; z-index: 200;
          background: white;
          border-radius: 1rem;
          border: 1px solid rgba(148,163,184,0.2);
          box-shadow: 0 24px 56px rgba(15,23,42,0.15), 0 0 0 1px rgba(255,255,255,0.8) inset;
          overflow: hidden;
          animation: dropFade 0.2s cubic-bezier(.22,1,.36,1);
        }
        @keyframes dropFade {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .cs-search-wrap {
          position: relative;
          padding: 0.75rem;
          border-bottom: 1px solid rgba(148,163,184,0.15);
          background: rgba(248,250,255,0.7);
        }
        .cs-search-icon { position: absolute; left: 1.25rem; top: 50%; transform: translateY(-50%); width: 14px; height: 14px; color: #94a3b8; }
        .cs-search-input {
          width: 100%; height: 38px;
          border: 1.5px solid rgba(148,163,184,0.28);
          border-radius: 0.65rem;
          background: white;
          padding: 0 0.75rem 0 2.1rem;
          font-size: 0.875rem; color: #334155;
          font-family: 'Cabinet Grotesk', sans-serif;
          outline: none; transition: all 0.2s ease;
        }
        .cs-search-input:focus { border-color: var(--color-primary,#2563eb); box-shadow: 0 0 0 3px rgba(37,99,235,0.07); }
        .cs-city-list { max-height: 232px; overflow-y: auto; padding: 0.35rem; scrollbar-width: thin; scrollbar-color: rgba(148,163,184,0.3) transparent; }
        .cs-city-item {
          display: flex; align-items: center; gap: 0.5rem;
          width: 100%; padding: 0.5rem 0.75rem;
          border: none; background: transparent;
          font-family: 'Cabinet Grotesk', sans-serif;
          font-size: 0.875rem; font-weight: 500;
          color: #334155; text-align: left; cursor: pointer;
          border-radius: 0.6rem; transition: all 0.15s ease;
        }
        .cs-city-item:hover { background: rgba(239,246,255,0.8); color: var(--color-primary,#2563eb); }
        .cs-city-item.selected { color: var(--color-primary,#2563eb); font-weight: 700; background: rgba(239,246,255,0.6); }
        .cs-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(148,163,184,0.4); flex-shrink: 0; }
        .cs-empty { padding: 1.5rem; text-align: center; font-size: 0.875rem; color: #94a3b8; font-family: 'Cabinet Grotesk', sans-serif; }

        /* ── right action buttons ── */
        .nb-btn-admin {
          display: flex; align-items: center; gap: 0.4rem;
          padding: 0.55rem 0.875rem;
          border-radius: 0.75rem;
          border: 1.5px solid rgba(148,163,184,0.28);
          background: white;
          font-family: 'Cabinet Grotesk', sans-serif;
          font-size: 0.875rem; font-weight: 600;
          color: #475569; text-decoration: none;
          transition: all 0.2s ease;
        }
        .nb-btn-admin:hover { border-color: rgba(148,163,184,0.5); background: #f8fafc; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(15,23,42,0.08); }
        .nb-btn-admin svg { width: 15px; height: 15px; }

        .nb-btn-contact {
          display: flex; align-items: center; gap: 0.4rem;
          padding: 0.55rem 0.875rem;
          border-radius: 0.75rem;
          border: none; background: transparent;
          font-family: 'Cabinet Grotesk', sans-serif;
          font-size: 0.9rem; font-weight: 600;
          color: #475569; cursor: pointer;
          transition: all 0.18s ease;
          position: relative;
        }
        .nb-btn-contact:hover { color: #0f172a; background: rgba(241,245,249,0.8); }
        .nb-btn-contact svg { width: 15px; height: 15px; }

        /* contact dropdown */
        .nb-contact-drop {
          position: absolute; right: 0; top: calc(100% + 8px); z-index: 100;
          width: 280px;
          background: white;
          border-radius: 1rem;
          border: 1px solid rgba(148,163,184,0.18);
          box-shadow: 0 24px 56px rgba(15,23,42,0.14);
          overflow: hidden;
          opacity: 0; transform: translateY(8px) scale(0.98);
          pointer-events: none;
          transition: all 0.25s cubic-bezier(.22,1,.36,1);
        }
        .nb-contact-group:hover .nb-contact-drop {
          opacity: 1; transform: translateY(0) scale(1);
          pointer-events: auto;
        }
        .nb-contact-drop-header {
          background: linear-gradient(135deg, #0d1526 0%, #1e3a5f 100%);
          padding: 1rem 1.25rem;
        }
        .nb-contact-drop-header p:first-child { font-size: 0.9375rem; font-weight: 700; color: white; margin: 0; }
        .nb-contact-drop-header p:last-child { font-size: 0.75rem; color: rgba(255,255,255,0.5); margin: 0.2rem 0 0; }
        .nb-contact-body { padding: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .nb-contact-item {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.75rem; border-radius: 0.75rem;
          border: 1px solid rgba(148,163,184,0.18);
          text-decoration: none;
          transition: all 0.15s ease;
        }
        .nb-contact-item:hover { border-color: rgba(37,99,235,0.25); background: rgba(239,246,255,0.6); }
        .nb-contact-item-icon {
          width: 36px; height: 36px; border-radius: 8px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(239,246,255,0.8);
          color: var(--color-primary,#2563eb);
        }
        .nb-contact-item-icon svg { width: 15px; height: 15px; }
        .nb-contact-item-label { font-size: 0.72rem; color: #94a3b8; font-weight: 500; }
        .nb-contact-item-value { font-size: 0.875rem; font-weight: 700; color: #0f172a; font-family: 'Cabinet Grotesk', sans-serif; }

        /* post property button */
        .nb-btn-post {
          display: inline-flex; align-items: center; gap: 0.45rem;
          padding: 0.6rem 1.25rem;
          border-radius: 0.875rem;
          background: linear-gradient(135deg, var(--color-primary,#2563eb) 0%, #1d4ed8 100%);
          color: white;
          font-family: 'Cabinet Grotesk', sans-serif;
          font-size: 0.9rem; font-weight: 700;
          text-decoration: none; border: none; cursor: pointer;
          box-shadow: 0 4px 14px rgba(37,99,235,0.35), 0 0 0 1px rgba(255,255,255,0.1) inset;
          transition: all 0.22s ease;
          letter-spacing: -0.01em;
          white-space: nowrap;
        }
        .nb-btn-post:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(37,99,235,0.45);
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        }
        .nb-btn-post svg { width: 15px; height: 15px; }
        .nb-btn-post-free {
          font-size: 0.58rem; font-weight: 800; letter-spacing: 0.06em;
          background: rgba(255,255,255,0.2); padding: 0.12rem 0.4rem;
          border-radius: 999px; text-transform: uppercase; line-height: 1.5;
        }

        /* login button */
        .nb-btn-login {
          display: inline-flex; align-items: center; gap: 0.45rem;
          padding: 0.6rem 1.1rem;
          border-radius: 0.875rem;
          background: linear-gradient(135deg, #0d1526 0%, #1a2b45 100%);
          color: white;
          font-family: 'Cabinet Grotesk', sans-serif;
          font-size: 0.9rem; font-weight: 700;
          text-decoration: none;
          box-shadow: 0 4px 14px rgba(13,21,38,0.25);
          transition: all 0.22s ease;
          white-space: nowrap;
        }
        .nb-btn-login:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(13,21,38,0.35); }
        .nb-btn-login svg { width: 15px; height: 15px; }

        /* account button */
        .nb-btn-account {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.45rem 0.75rem 0.45rem 0.45rem;
          border-radius: 0.875rem;
          border: 1.5px solid rgba(148,163,184,0.28);
          background: white;
          font-family: 'Cabinet Grotesk', sans-serif;
          font-size: 0.875rem; font-weight: 600;
          color: #334155; cursor: pointer;
          transition: all 0.2s ease;
        }
        .nb-btn-account:hover, .nb-btn-account.open {
          border-color: rgba(37,99,235,0.35);
          background: rgba(239,246,255,0.5);
          color: var(--color-primary,#2563eb);
          box-shadow: 0 0 0 3px rgba(37,99,235,0.07);
        }
        .nb-account-avatar {
          width: 28px; height: 28px; border-radius: 7px;
          background: linear-gradient(135deg, #0d1526, #1e3a5f);
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 0.8rem; font-weight: 800;
          font-family: 'Bricolage Grotesque', sans-serif;
          flex-shrink: 0;
        }
        .nb-account-chevron { width: 12px; height: 12px; color: #94a3b8; transition: transform 0.2s; flex-shrink: 0; }
        .nb-account-chevron.rotated { transform: rotate(180deg); color: var(--color-primary,#2563eb); }

        /* account dropdown */
        .nb-account-drop {
          position: absolute; right: 0; top: calc(100% + 8px); z-index: 200;
          width: 292px;
          background: white;
          border-radius: 1.1rem;
          border: 1px solid rgba(148,163,184,0.18);
          box-shadow: 0 28px 64px rgba(15,23,42,0.16), 0 0 0 1px rgba(255,255,255,0.8) inset;
          overflow: hidden;
          animation: dropFade 0.22s cubic-bezier(.22,1,.36,1);
        }
        .nb-account-header {
          display: flex; align-items: center; gap: 0.875rem;
          padding: 1.1rem 1.25rem;
          background: linear-gradient(135deg, #0d1526 0%, #1e3a5f 100%);
        }
        .nb-account-header-avatar {
          width: 42px; height: 42px; border-radius: 10px; flex-shrink: 0;
          background: rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 1.1rem; font-weight: 800;
          font-family: 'Bricolage Grotesque', sans-serif;
          border: 1px solid rgba(255,255,255,0.12);
        }
        .nb-account-header-name { font-size: 0.9375rem; font-weight: 700; color: white; }
        .nb-account-header-role {
          display: inline-flex; align-items: center;
          font-size: 0.68rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
          color: rgba(255,255,255,0.45); margin-top: 0.2rem;
        }
        .nb-account-items { padding: 0.5rem; }
        .nb-account-item {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.65rem 0.75rem;
          border-radius: 0.75rem;
          text-decoration: none;
          transition: all 0.15s ease;
        }
        .nb-account-item:hover { background: rgba(248,250,255,0.9); }
        .nb-account-item-icon {
          width: 34px; height: 34px; border-radius: 8px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .nb-account-item-icon svg { width: 15px; height: 15px; }
        .nb-account-item-name { font-size: 0.875rem; font-weight: 700; color: #0f172a; font-family: 'Cabinet Grotesk', sans-serif; }
        .nb-account-item-desc { font-size: 0.72rem; color: #94a3b8; margin-top: 0.05rem; }
        .nb-account-footer { border-top: 1px solid rgba(148,163,184,0.12); padding: 0.5rem; }
        .nb-signout-btn {
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          width: 100%; padding: 0.65rem;
          border: 1px solid rgba(148,163,184,0.2); border-radius: 0.75rem;
          background: rgba(248,250,252,0.8);
          font-family: 'Cabinet Grotesk', sans-serif;
          font-size: 0.875rem; font-weight: 700;
          color: #64748b; cursor: pointer;
          transition: all 0.2s ease;
        }
        .nb-signout-btn:hover { border-color: rgba(239,68,68,0.3); background: rgba(254,242,242,0.8); color: #dc2626; }
        .nb-signout-btn svg { width: 14px; height: 14px; }

        /* ── hamburger ── */
        .nb-hamburger {
          display: flex; align-items: center; justify-content: center;
          width: 40px; height: 40px;
          border-radius: 0.75rem;
          border: 1.5px solid rgba(148,163,184,0.28);
          background: white; cursor: pointer;
          transition: all 0.2s ease;
          color: #475569;
        }
        .nb-hamburger:hover { background: #f8fafc; border-color: rgba(148,163,184,0.5); }
        .nb-hamburger svg { width: 18px; height: 18px; }

        /* ── mobile drawer ── */
        .nb-mobile {
          border-top: 1px solid rgba(148,163,184,0.15);
          background: white;
          animation: slideDown 0.28s cubic-bezier(.22,1,.36,1);
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nb-mobile-inner { padding: 1rem 1.25rem 1.5rem; }
        .nb-mobile-nav-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.75rem 0.875rem;
          border-radius: 0.75rem; text-decoration: none;
          font-family: 'Cabinet Grotesk', sans-serif;
          font-size: 0.9375rem; font-weight: 600;
          color: #1e293b; transition: all 0.15s ease;
        }
        .nb-mobile-nav-item:hover { background: rgba(239,246,255,0.7); color: var(--color-primary,#2563eb); }
        .nb-mobile-nav-item svg { width: 15px; height: 15px; color: #94a3b8; }

        /* Mobile contact block */
        .nb-mobile-contact {
          border-radius: 0.875rem; overflow: hidden;
          border: 1px solid rgba(148,163,184,0.18);
        }
        .nb-mobile-contact-header {
          background: linear-gradient(135deg, #0d1526, #1e3a5f);
          padding: 0.75rem 1rem;
          font-size: 0.875rem; font-weight: 700; color: white;
          font-family: 'Cabinet Grotesk', sans-serif;
        }
        .nb-mobile-contact-body {
          display: grid; grid-template-columns: 1fr 1fr;
          background: white;
        }
        .nb-mobile-contact-body > * {
          padding: 0.75rem 1rem; text-align: center;
          border-right: 1px solid rgba(148,163,184,0.15);
          text-decoration: none; transition: background 0.15s;
        }
        .nb-mobile-contact-body > *:last-child { border-right: none; }
        .nb-mobile-contact-body > *:hover { background: rgba(248,250,255,0.8); }
        .nb-mobile-contact-label { font-size: 0.68rem; color: #94a3b8; font-weight: 500; display: block; }
        .nb-mobile-contact-value { font-size: 0.75rem; font-weight: 700; color: var(--color-primary,#2563eb); margin-top: 0.15rem; display: block; font-family: 'Cabinet Grotesk', sans-serif; }

        /* Mobile auth block */
        .nb-mobile-auth-header {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.875rem 1rem;
          background: linear-gradient(135deg, #0d1526, #1e3a5f);
          border-radius: 0.875rem 0.875rem 0 0;
        }
        .nb-mobile-auth-avatar {
          width: 38px; height: 38px; border-radius: 9px; flex-shrink: 0;
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.12);
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 1rem; font-weight: 800;
          font-family: 'Bricolage Grotesque', sans-serif;
        }
        .nb-mobile-auth-name { font-size: 0.9375rem; font-weight: 700; color: white; font-family: 'Cabinet Grotesk', sans-serif; }
        .nb-mobile-auth-role { font-size: 0.72rem; color: rgba(255,255,255,0.45); }
        .nb-mobile-auth-items { background: white; border: 1px solid rgba(148,163,184,0.15); border-top: none; }
        .nb-mobile-auth-item {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid rgba(148,163,184,0.1);
          text-decoration: none;
          font-family: 'Cabinet Grotesk', sans-serif;
          font-size: 0.9rem; font-weight: 600;
          color: #1e293b; transition: all 0.15s ease;
        }
        .nb-mobile-auth-item:last-child { border-bottom: none; }
        .nb-mobile-auth-item:hover { background: rgba(248,250,255,0.8); }
        .nb-mobile-auth-item svg { width: 15px; height: 15px; color: #94a3b8; }
        .nb-mobile-auth-footer {
          border: 1px solid rgba(148,163,184,0.15); border-top: none;
          border-radius: 0 0 0.875rem 0.875rem;
          overflow: hidden;
        }
        .nb-mobile-signout {
          display: flex; align-items: center; gap: 0.5rem;
          width: 100%; padding: 0.75rem 1rem;
          border: none; background: white;
          font-family: 'Cabinet Grotesk', sans-serif;
          font-size: 0.9rem; font-weight: 700;
          color: #ef4444; cursor: pointer;
          transition: all 0.15s ease;
        }
        .nb-mobile-signout:hover { background: rgba(254,242,242,0.8); }
        .nb-mobile-signout svg { width: 15px; height: 15px; }
      `}</style>

      <header className={`nb-header nb-root ${isNavElevated ? 'elevated' : 'flat'}`}>
        {/* top accent bar */}
        <div className="nb-top-bar" />

        <nav className={`nb-nav ${isNavElevated ? 'compact' : 'tall'}`}>
          {/* ── Left ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            <Link to="/" className="nb-logo">
              <div className="nb-logo-mark">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 10.75L12 4l9 6.75V20a1 1 0 01-1 1h-5.5v-6h-5V21H4a1 1 0 01-1-1v-9.25z"/>
                </svg>
                <div className="nb-logo-mark-dot" />
              </div>
              <span className="nb-logo-text">City<span>Ploter</span></span>
            </Link>
            <div className="nb-divider" style={{ display: 'none', visibility: 'hidden' }} />
            <div className="nb-divider" style={{ '@media(min-width:640px)': { display: 'block' } }} />
            <div style={{ display: 'none' }} className="nb-city-desktop">
              <CitySelector selectedCity={selectedCity} onCityChange={setSelectedCity} />
            </div>
            {/* always show on md+ */}
            <div className="nb-city-show">
              <CitySelector selectedCity={selectedCity} onCityChange={setSelectedCity} />
            </div>
          </div>

          {/* ── Center ── */}
          <ul className="nb-nav-list" style={{ display: 'none' }} id="nb-center-nav">
            {navItemsWithPriorityCity.map((item, index) => (
              <NavMenuItem
                key={item.label}
                label={item.label}
                columns={item.columns}
                badge={item.badge}
                icon={item.icon}
                menuAlign={index === 0 ? 'left' : index === navItemsWithPriorityCity.length - 1 ? 'right' : 'center'}
              />
            ))}
          </ul>

          {/* ── Right ── */}
          <div style={{ display: 'none' }} id="nb-right-actions">
            {user?.role === 'admin' && (
              <Link to="/admin/properties" className="nb-btn-admin">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                Admin
              </Link>
            )}

            {/* Contact hover */}
            <div className="nb-contact-group" style={{ position: 'relative' }}>
              <button type="button" className="nb-btn-contact">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                Contact
              </button>
              <div className="nb-contact-drop">
                <div className="nb-contact-drop-header">
                  <p>Get in Touch</p>
                  <p>Typically replies within 2 hours</p>
                </div>
                <div className="nb-contact-body">
                  <a href="mailto:support@cityploter.in" className="nb-contact-item">
                    <div className="nb-contact-item-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    </div>
                    <div>
                      <div className="nb-contact-item-label">Email us</div>
                      <div className="nb-contact-item-value">support@cityploter.in</div>
                    </div>
                  </a>
                  <a href="tel:+919876543210" className="nb-contact-item">
                    <div className="nb-contact-item-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                    </div>
                    <div>
                      <div className="nb-contact-item-label">Call us</div>
                      <div className="nb-contact-item-value">+91 98765 43210</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            <Link to="/post-property" className="nb-btn-post">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v16m8-8H4"/></svg>
              Post Property
              <span className="nb-btn-post-free">Free</span>
            </Link>

            {isAuthenticated ? (
              <div style={{ position: 'relative' }} ref={accountMenuRef}>
                <button
                  type="button"
                  className={`nb-btn-account ${isAccountMenuOpen ? 'open' : ''}`}
                  onClick={() => setIsAccountMenuOpen((p) => !p)}
                >
                  <div className="nb-account-avatar">{String(displayName).charAt(0).toUpperCase()}</div>
                  <span>{displayName}</span>
                  <svg className={`nb-account-chevron ${isAccountMenuOpen ? 'rotated' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                </button>

                {isAccountMenuOpen && (
                  <div className="nb-account-drop">
                    <div className="nb-account-header">
                      <div className="nb-account-header-avatar">{String(displayName).charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="nb-account-header-name">Welcome, {displayName}</div>
                        <div className="nb-account-header-role">{roleLabel}</div>
                      </div>
                    </div>
                    <div className="nb-account-items">
                      {accountMenuItems.map((item) => (
                        <Link key={item.label} to={item.to} onClick={() => setIsAccountMenuOpen(false)} className="nb-account-item">
                          <div className="nb-account-item-icon" style={{ background: `${item.color}12`, color: item.color }}>
                            {item.icon}
                          </div>
                          <div>
                            <div className="nb-account-item-name">{item.label}</div>
                            <div className="nb-account-item-desc">{item.description}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="nb-account-footer">
                      <button type="button" className="nb-signout-btn" onClick={() => { setIsAccountMenuOpen(false); logout() }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/auth" className="nb-btn-login">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                Login / Sign up
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button type="button" className="nb-hamburger" aria-label="Toggle menu" onClick={() => setIsOpen((p) => !p)} id="nb-hamburger">
            {isOpen
              ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>}
          </button>
        </nav>

        {/* ── Responsive display hack via inline style injection ── */}
        <style>{`
          @media (min-width: 1024px) {
            #nb-center-nav { display: flex !important; }
            #nb-right-actions { display: flex !important; align-items: center; gap: 0.5rem; }
            #nb-hamburger { display: none !important; }
            .nb-city-show { display: block !important; }
          }
          @media (max-width: 1023px) {
            .nb-city-show { display: block !important; }
            #nb-center-nav { display: none !important; }
            #nb-right-actions { display: none !important; }
          }
        `}</style>

        {/* ── Mobile drawer ── */}
        {isOpen && (
          <div className="nb-mobile">
            <div className="nb-mobile-inner" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <CitySelector selectedCity={selectedCity} onCityChange={setSelectedCity} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {navItemsWithPriorityCity.map((item) => (
                  <Link key={item.label} to={getNavItemPrimaryLink(item)} onClick={() => setIsOpen(false)} className="nb-mobile-nav-item">
                    <span>{item.label}</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                  </Link>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', borderTop: '1px solid rgba(148,163,184,0.15)', paddingTop: '0.875rem' }}>
                <Link to="/post-property" onClick={() => setIsOpen(false)} className="nb-btn-post" style={{ justifyContent: 'center' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v16m8-8H4"/></svg>
                  Post Property Free
                </Link>

                <div className="nb-mobile-contact">
                  <div className="nb-mobile-contact-header">Contact Us</div>
                  <div className="nb-mobile-contact-body">
                    <a href="mailto:support@cityploter.in">
                      <span className="nb-mobile-contact-label">Email</span>
                      <span className="nb-mobile-contact-value">support@cityploter.in</span>
                    </a>
                    <a href="tel:+919876543210">
                      <span className="nb-mobile-contact-label">Phone</span>
                      <span className="nb-mobile-contact-value" style={{ color: '#0f172a' }}>+91 98765 43210</span>
                    </a>
                  </div>
                </div>

                {isAuthenticated ? (
                  <div>
                    <div className="nb-mobile-auth-header" style={{ borderRadius: '0.875rem 0.875rem 0 0' }}>
                      <div className="nb-mobile-auth-avatar">{String(displayName).charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="nb-mobile-auth-name">{displayName}</div>
                        <div className="nb-mobile-auth-role">{roleLabel}</div>
                      </div>
                    </div>
                    <div className="nb-mobile-auth-items">
                      {accountMenuItems.map((item) => (
                        <Link key={item.label} to={item.to} onClick={() => setIsOpen(false)} className="nb-mobile-auth-item">
                          <span style={{ color: item.color }}>{item.icon}</span>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                    <div className="nb-mobile-auth-footer">
                      <button type="button" className="nb-mobile-signout" onClick={() => { setIsOpen(false); logout() }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link to="/auth" onClick={() => setIsOpen(false)} className="nb-btn-login" style={{ justifyContent: 'center' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    Login / Sign up
                  </Link>
                )}

                {user?.role === 'admin' && (
                  <Link to="/admin/properties" onClick={() => setIsOpen(false)} className="nb-btn-admin" style={{ justifyContent: 'center' }}>
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