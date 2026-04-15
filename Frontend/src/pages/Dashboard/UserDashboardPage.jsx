import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../Home/components/Navbar'
import LoadingScreen from '../../components/LoadingScreen'
import { useAuth } from '../../context/AuthContext'
import { apiRequest } from '../../lib/api'

const LIKED_PROPERTIES_STORAGE_KEY = 'cityploter_liked_properties'
const DASHBOARD_TABS = [
  { key: 'liked', label: 'Liked Properties' },
  { key: 'connected', label: 'Connected Properties' },
  { key: 'promotions', label: 'Promotions' },
  { key: 'profile', label: 'Profile' },
]

const PROMOTION_ROLES = new Set(['owner', 'agent', 'builder'])

function normalizeRole(role) {
  const normalized = String(role || '').trim().toLowerCase()
  return normalized === 'seller' ? 'owner' : normalized
}

function readLikedProperties() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(LIKED_PROPERTIES_STORAGE_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function formatPrice(value) {
  if (typeof value === 'number') {
    return `INR ${value.toLocaleString('en-IN')}`
  }

  return value || 'Price on request'
}

function getValidTab(rawTab) {
  const allowed = new Set(DASHBOARD_TABS.map((tab) => tab.key))
  return allowed.has(rawTab) ? rawTab : 'liked'
}

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false)
      return
    }

    if (window.Razorpay) {
      resolve(true)
      return
    }

    const existingScript = document.querySelector('script[data-razorpay-checkout="true"]')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true), { once: true })
      existingScript.addEventListener('error', () => resolve(false), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.dataset.razorpayCheckout = 'true'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

const UserDashboardPage = () => {
  const navigate = useNavigate()
  const { token, user, logout } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentTab = getValidTab(searchParams.get('tab'))

  const [likedProperties, setLikedProperties] = useState([])
  const [interests, setInterests] = useState([])
  const [isInterestsLoading, setIsInterestsLoading] = useState(true)
  const [interestsError, setInterestsError] = useState('')
  const [profileDetails, setProfileDetails] = useState(user || null)
  const [promotionPricing, setPromotionPricing] = useState({ perDayAmount: 0, currency: 'INR' })
  const [promotions, setPromotions] = useState([])
  const [promotionMessage, setPromotionMessage] = useState('')
  const [isPromotionLoading, setIsPromotionLoading] = useState(false)
  const [isPromotionSubmitting, setIsPromotionSubmitting] = useState(false)
  const [promotionForm, setPromotionForm] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    redirectUrl: '',
    days: 7,
    requestedStartDate: ''
  })

  const normalizedRole = normalizeRole(profileDetails?.role || user?.role)
  const canManagePromotions = PROMOTION_ROLES.has(normalizedRole)

  useEffect(() => {
    setLikedProperties(readLikedProperties())
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadInterests = async () => {
      setIsInterestsLoading(true)
      setInterestsError('')

      try {
        const response = await apiRequest('/interests/my-interests?limit=50', { token })
        if (!isMounted) {
          return
        }

        setInterests(response?.data || [])
      } catch (error) {
        if (!isMounted) {
          return
        }

        setInterestsError(error.message || 'Failed to load connected properties')
      } finally {
        if (isMounted) {
          setIsInterestsLoading(false)
        }
      }
    }

    const loadProfile = async () => {
      try {
        const response = await apiRequest('/users/me', { token })
        if (isMounted) {
          setProfileDetails(response?.data || user || null)
        }
      } catch {
        if (isMounted) {
          setProfileDetails(user || null)
        }
      }
    }

    const loadPromotionData = async () => {
      try {
        const pricingResponse = await apiRequest('/promotions/pricing')
        if (isMounted) {
          setPromotionPricing({
            perDayAmount: Number(pricingResponse?.data?.perDayAmount || 0),
            currency: pricingResponse?.data?.currency || 'INR'
          })
        }
      } catch {
        if (isMounted) {
          setPromotionPricing({ perDayAmount: 0, currency: 'INR' })
        }
      }

      try {
        const promotionsResponse = await apiRequest('/promotions/my', { token })
        if (isMounted) {
          setPromotions(Array.isArray(promotionsResponse?.data) ? promotionsResponse.data : [])
        }
      } catch {
        if (isMounted) {
          setPromotions([])
        }
      }
    }

    loadInterests()
    loadProfile()
    loadPromotionData()

    return () => {
      isMounted = false
    }
  }, [token, user])

  const sortedLiked = useMemo(() => {
    return [...likedProperties].sort((a, b) => {
      const timeA = new Date(a?.createdAt || 0).getTime()
      const timeB = new Date(b?.createdAt || 0).getTime()
      return timeB - timeA
    })
  }, [likedProperties])

  const changeTab = (tabKey) => {
    setSearchParams({ tab: tabKey }, { replace: true })
  }

  const removeLikedProperty = (propertyId) => {
    const next = likedProperties.filter((item) => item.id !== propertyId)
    setLikedProperties(next)

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LIKED_PROPERTIES_STORAGE_KEY, JSON.stringify(next))
    }
  }

  const loadMyPromotions = async () => {
    const promotionsResponse = await apiRequest('/promotions/my', { token })
    setPromotions(Array.isArray(promotionsResponse?.data) ? promotionsResponse.data : [])
  }

  const handlePromotionInputChange = (field, value) => {
    setPromotionForm((current) => ({
      ...current,
      [field]: value
    }))
  }

  const handleCreatePromotion = async () => {
    if (!canManagePromotions) {
      setPromotionMessage('Only owner, agent, and builder accounts can create promotions.')
      return
    }

    const title = promotionForm.title.trim()
    const imageUrl = promotionForm.imageUrl.trim()
    const days = Number(promotionForm.days)

    if (!title || title.length < 5) {
      setPromotionMessage('Please enter a valid promotion title (minimum 5 characters).')
      return
    }

    if (!imageUrl) {
      setPromotionMessage('Please provide an image URL for your promotion.')
      return
    }

    if (!Number.isFinite(days) || days < 1) {
      setPromotionMessage('Please choose a valid number of days.')
      return
    }

    setIsPromotionSubmitting(true)
    setPromotionMessage('')

    try {
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded || !window.Razorpay) {
        setPromotionMessage('Unable to load Razorpay checkout. Please try again.')
        return
      }

      const orderResponse = await apiRequest('/promotions/create-order', {
        method: 'POST',
        token,
        body: {
          title,
          subtitle: promotionForm.subtitle.trim(),
          imageUrl,
          redirectUrl: promotionForm.redirectUrl.trim(),
          days,
          requestedStartDate: promotionForm.requestedStartDate || undefined
        }
      })

      const orderData = orderResponse?.data || {}

      const checkout = new window.Razorpay({
        key: orderData.keyId,
        amount: Math.round(Number(orderData.amount || 0) * 100),
        currency: orderData.currency || 'INR',
        order_id: orderData.orderId,
        name: 'CityPloter Promotions',
        description: `${days} day homepage campaign`,
        handler: async (paymentResponse) => {
          try {
            setIsPromotionLoading(true)
            await apiRequest('/promotions/verify-payment', {
              method: 'POST',
              token,
              body: {
                promotionId: orderData.promotionId,
                ...paymentResponse
              }
            })

            await loadMyPromotions()
            setPromotionForm({
              title: '',
              subtitle: '',
              imageUrl: '',
              redirectUrl: '',
              days: 7,
              requestedStartDate: ''
            })
            setPromotionMessage('Payment successful. Your promotion is now pending admin approval.')
          } catch (verifyError) {
            setPromotionMessage(verifyError.message || 'Payment verification failed. Please contact support.')
          } finally {
            setIsPromotionLoading(false)
          }
        },
        prefill: {
          name: [profileDetails?.firstName, profileDetails?.lastName].filter(Boolean).join(' '),
          email: profileDetails?.email,
          contact: profileDetails?.phone
        },
        theme: {
          color: '#d95f37'
        }
      })

      checkout.open()
    } catch (promoError) {
      setPromotionMessage(promoError.message || 'Failed to start promotion checkout')
    } finally {
      setIsPromotionSubmitting(false)
    }
  }

  const formatMoney = (amount, currency = 'INR') => {
    const numericAmount = Number(amount || 0)
    return `${currency} ${numericAmount.toLocaleString('en-IN')}`
  }

  const renderLikedTab = () => {
    if (sortedLiked.length === 0) {
      return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          You have not liked any property yet.
        </div>
      )
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sortedLiked.map((item) => {
          const image = Array.isArray(item.images) && item.images.length > 0
            ? item.images[0]
            : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80'

          return (
            <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <img src={image} alt={item.title} className="h-44 w-full object-cover" />
              <div className="space-y-2 p-4">
                <p className="text-sm font-semibold text-(--color-primary)">{formatPrice(item.price)}</p>
                <h3 className="line-clamp-2 text-base font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-600">{[item.locality, item.city].filter(Boolean).join(', ') || 'Location not listed'}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500">{item.propertyType || 'Property'} · {item.listingType || 'Listing'}</p>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/properties/${item.id}`)}
                    className="rounded-lg bg-(--color-primary) px-3 py-2 text-xs font-semibold text-white transition hover:brightness-95"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    onClick={() => removeLikedProperty(item.id)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    )
  }

  const renderConnectedTab = () => {
    if (isInterestsLoading) {
      return <LoadingScreen label="Loading Connections" sublabel="Fetching your connected properties" />
    }

    if (interestsError) {
      return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{interestsError}</div>
    }

    if (interests.length === 0) {
      return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          You have not submitted any connection requests yet.
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {interests.map((lead) => {
          const property = lead.propertyId || {}

          return (
            <article key={lead._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Connection Request</p>
                  <h3 className="mt-1 text-base font-semibold text-slate-900">{property.title || 'Property unavailable'}</h3>
                  <p className="mt-1 text-sm text-slate-600">{property.city || 'City not available'} · {property.propertyType || 'Property'}</p>
                </div>
                <span className="rounded-full bg-(--color-secondary-bg) px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-(--color-primary)">
                  {lead.status || 'new'}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => property._id && navigate(`/properties/${property._id}`)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Open Property
                </button>
                <p className="text-xs text-slate-500">Requested on {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-IN') : 'N/A'}</p>
              </div>
            </article>
          )
        })}
      </div>
    )
  }

  const renderProfileTab = () => {
    const profile = profileDetails || user || {}

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Profile</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Name</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{[profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Not set'}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Email</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{profile.email || 'Not set'}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Phone</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{profile.phone || 'Not set'}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Role</p>
            <p className="mt-1 text-sm font-semibold capitalize text-slate-900">{profile.role || 'user'}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Link to="/post-property" className="rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95">
            Post New Property
          </Link>
          <button
            type="button"
            onClick={() => {
              logout()
              navigate('/')
            }}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
      </div>
    )
  }

  const renderPromotionsTab = () => {
    if (!canManagePromotions) {
      return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Promotions are available for owner, agent, and builder accounts.
        </div>
      )
    }

    const totalAmount = Number(promotionPricing.perDayAmount || 0) * Number(promotionForm.days || 0)

    return (
      <div className="space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Homepage Promotions</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">Create a paid campaign</h3>
          <p className="mt-1 text-sm text-slate-600">
            Daily charge: <span className="font-semibold text-slate-900">{formatMoney(promotionPricing.perDayAmount, promotionPricing.currency)}</span>
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              value={promotionForm.title}
              onChange={(event) => handlePromotionInputChange('title', event.target.value)}
              placeholder="Campaign title"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-(--color-primary)"
            />
            <input
              type="number"
              min="1"
              max="60"
              value={promotionForm.days}
              onChange={(event) => handlePromotionInputChange('days', event.target.value)}
              placeholder="Days"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-(--color-primary)"
            />
            <input
              value={promotionForm.imageUrl}
              onChange={(event) => handlePromotionInputChange('imageUrl', event.target.value)}
              placeholder="Promotion image URL"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-(--color-primary) sm:col-span-2"
            />
            <input
              value={promotionForm.redirectUrl}
              onChange={(event) => handlePromotionInputChange('redirectUrl', event.target.value)}
              placeholder="Redirect URL (optional)"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-(--color-primary) sm:col-span-2"
            />
            <input
              value={promotionForm.subtitle}
              onChange={(event) => handlePromotionInputChange('subtitle', event.target.value)}
              placeholder="Subtitle (optional)"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-(--color-primary) sm:col-span-2"
            />
            <input
              type="date"
              value={promotionForm.requestedStartDate}
              onChange={(event) => handlePromotionInputChange('requestedStartDate', event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-(--color-primary)"
            />
            <div className="flex items-center rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
              Estimated total: {formatMoney(totalAmount, promotionPricing.currency)}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCreatePromotion}
              disabled={isPromotionSubmitting || isPromotionLoading}
              className="rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPromotionSubmitting ? 'Starting checkout...' : 'Pay & Submit Promotion'}
            </button>
            {promotionMessage ? <p className="text-sm text-slate-600">{promotionMessage}</p> : null}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">My promotion campaigns</h3>
          <div className="mt-3 space-y-3">
            {promotions.length === 0 ? (
              <p className="text-sm text-slate-600">No campaigns yet.</p>
            ) : promotions.map((campaign) => (
              <article key={campaign._id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">{campaign.title}</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">
                    {campaign.approvalStatus}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  Payment: {campaign.paymentStatus} · Duration: {campaign.days} days · Amount: {formatMoney(campaign.totalAmount, campaign.currency)}
                </p>
                {campaign.reviewMessage ? (
                  <p className="mt-2 text-xs text-rose-600">Admin note: {campaign.reviewMessage}</p>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-(--color-surface)">
      <Navbar />

      <section className="mx-auto w-[92%] max-w-7xl py-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--color-secondary-text)">Account Center</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 lg:text-3xl">Manage your activity</h1>
          <p className="mt-2 text-sm text-slate-600">Track your liked listings, connection requests, and profile information in one place.</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {DASHBOARD_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => changeTab(tab.key)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                currentTab === tab.key
                  ? 'border-(--color-primary) bg-(--color-secondary-bg) text-(--color-primary)'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {currentTab === 'liked' ? renderLikedTab() : null}
          {currentTab === 'connected' ? renderConnectedTab() : null}
          {currentTab === 'promotions' ? renderPromotionsTab() : null}
          {currentTab === 'profile' ? renderProfileTab() : null}
        </div>
      </section>
    </div>
  )
}

export default UserDashboardPage
