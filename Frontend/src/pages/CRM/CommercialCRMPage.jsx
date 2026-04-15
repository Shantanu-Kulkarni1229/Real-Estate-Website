import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../Home/components/Navbar'
import LoadingScreen from '../../components/LoadingScreen'
import { useAuth } from '../../context/AuthContext'
import { apiRequest } from '../../lib/api'

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'listings', label: 'Listings' },
  { key: 'leads', label: 'Leads' },
  { key: 'profile', label: 'Profile' }
]

const LEAD_STATUSES = ['all', 'new', 'contacted', 'closed']
const LISTING_STATUSES = ['all', 'pending', 'approved', 'rejected']

function getValidTab(rawTab) {
  const allowed = new Set(TABS.map((tab) => tab.key))
  return allowed.has(rawTab) ? rawTab : 'overview'
}

function formatPrice(value) {
  if (typeof value === 'number') {
    return `INR ${value.toLocaleString('en-IN')}`
  }

  const parsed = Number(value)
  if (Number.isFinite(parsed)) {
    return `INR ${parsed.toLocaleString('en-IN')}`
  }

  return 'Price on request'
}

const CommercialCRMPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentTab = getValidTab(searchParams.get('tab'))

  const { token, user, logout } = useAuth()

  const [isLoading, setIsLoading] = useState(true)
  const [listings, setListings] = useState([])
  const [leads, setLeads] = useState([])
  const [error, setError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [leadStatusFilter, setLeadStatusFilter] = useState('all')
  const [listingStatusFilter, setListingStatusFilter] = useState('all')
  const [actionLeadId, setActionLeadId] = useState('')
  const [actionListingId, setActionListingId] = useState('')

  const loadListings = useCallback(async (status = listingStatusFilter) => {
    const query = new URLSearchParams({ limit: '40' })
    if (status !== 'all') {
      query.set('status', status)
    }

    const response = await apiRequest(`/properties/my-listings?${query.toString()}`, { token })
    setListings(Array.isArray(response?.data) ? response.data : [])
  }, [listingStatusFilter, token])

  const loadLeads = useCallback(async (status = leadStatusFilter) => {
    const query = new URLSearchParams({ limit: '50' })
    if (status !== 'all') {
      query.set('status', status)
    }

    const response = await apiRequest(`/interests/my-leads?${query.toString()}`, { token })
    setLeads(Array.isArray(response?.data) ? response.data : [])
  }, [leadStatusFilter, token])

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      setIsLoading(true)
      setError('')

      try {
        await Promise.all([
          loadListings(listingStatusFilter),
          loadLeads(leadStatusFilter)
        ])
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || 'Failed to load CRM data')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [leadStatusFilter, listingStatusFilter, loadListings, loadLeads])

  const listingStats = useMemo(() => {
    const pending = listings.filter((item) => item.status === 'pending').length
    const approved = listings.filter((item) => item.status === 'approved').length
    const rejected = listings.filter((item) => item.status === 'rejected').length

    return {
      total: listings.length,
      pending,
      approved,
      rejected
    }
  }, [listings])

  const leadStats = useMemo(() => {
    const fresh = leads.filter((item) => item.status === 'new').length
    const contacted = leads.filter((item) => item.status === 'contacted').length
    const closed = leads.filter((item) => item.status === 'closed').length

    return {
      total: leads.length,
      fresh,
      contacted,
      closed
    }
  }, [leads])

  const changeTab = (tabKey) => {
    setSearchParams({ tab: tabKey }, { replace: true })
  }

  const updateLeadStatus = async (leadId, nextStatus) => {
    setActionLeadId(leadId)
    setStatusMessage('')
    setError('')

    try {
      await apiRequest(`/interests/my-leads/${leadId}/status`, {
        method: 'PATCH',
        token,
        body: { status: nextStatus }
      })

      setLeads((current) => current.map((lead) => (
        lead._id === leadId
          ? { ...lead, status: nextStatus }
          : lead
      )))

      setStatusMessage('Lead status updated successfully.')
    } catch (updateError) {
      setError(updateError.message || 'Failed to update lead status')
    } finally {
      setActionLeadId('')
    }
  }

  const deleteListing = async (listingId) => {
    const confirmed = window.confirm('Delete this listing permanently?')
    if (!confirmed) {
      return
    }

    setActionListingId(listingId)
    setStatusMessage('')
    setError('')

    try {
      await apiRequest(`/properties/${listingId}`, {
        method: 'DELETE',
        token
      })

      setListings((current) => current.filter((item) => item._id !== listingId))
      setStatusMessage('Listing deleted successfully.')
    } catch (deleteError) {
      setError(deleteError.message || 'Failed to delete listing')
    } finally {
      setActionListingId('')
    }
  }

  const renderOverview = () => (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Total Listings</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">{listingStats.total}</p>
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Approved Listings</p>
        <p className="mt-2 text-2xl font-bold text-emerald-700">{listingStats.approved}</p>
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Active Leads</p>
        <p className="mt-2 text-2xl font-bold text-(--color-primary)">{leadStats.total}</p>
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Closed Leads</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">{leadStats.closed}</p>
      </article>
    </div>
  )

  const renderListings = () => (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {LISTING_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setListingStatusFilter(status)}
            className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${
              listingStatusFilter === status
                ? 'bg-(--color-primary) text-white'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {listings.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">No listings found for this filter.</div>
      ) : (
        listings.map((item) => (
          <article key={item._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs text-slate-600">{item.city} · {item.propertyType} · {item.listingType}</p>
                <p className="mt-1 text-xs font-semibold text-(--color-primary)">{formatPrice(item.price)}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">{item.status}</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => navigate(`/properties/${item._id}`)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                View Listing
              </button>
              <button
                type="button"
                disabled={actionListingId === item._id}
                onClick={() => deleteListing(item._id)}
                className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-70"
              >
                {actionListingId === item._id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </article>
        ))
      )}
    </div>
  )

  const renderLeads = () => (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {LEAD_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setLeadStatusFilter(status)}
            className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${
              leadStatusFilter === status
                ? 'bg-(--color-primary) text-white'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {leads.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">No leads found for this filter.</div>
      ) : (
        leads.map((lead) => {
          const buyerName = lead?.buyerId
            ? [lead.buyerId.firstName, lead.buyerId.lastName].filter(Boolean).join(' ')
            : lead.name

          return (
            <article key={lead._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{lead?.propertyId?.title || 'Listing unavailable'}</p>
                  <p className="mt-1 text-xs text-slate-600">Buyer: {buyerName || 'N/A'} · {lead.mobile || 'N/A'}</p>
                  <p className="mt-1 text-xs text-slate-600">{lead.email || 'No email'} · {lead?.propertyId?.city || 'N/A'}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">{lead.status}</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {['new', 'contacted', 'closed'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    disabled={actionLeadId === lead._id || lead.status === status}
                    onClick={() => updateLeadStatus(lead._id, status)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                  >
                    Mark {status}
                  </button>
                ))}
              </div>
            </article>
          )
        })
      )}
    </div>
  )

  const renderProfile = () => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">CRM Profile</h3>
      <p className="mt-2 text-sm text-slate-600">{[user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'N/A'} · {user?.email || 'N/A'}</p>
      <p className="mt-1 text-sm text-slate-600">Role: <span className="font-semibold capitalize text-slate-900">{user?.role || 'N/A'}</span></p>
      <div className="mt-4 flex gap-2">
        <Link to="/post-property" className="rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white hover:brightness-95">Post New Listing</Link>
        <button
          type="button"
          onClick={() => {
            logout()
            navigate('/')
          }}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-(--color-surface)">
      <Navbar />

      <section className="mx-auto w-[92%] max-w-7xl py-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--color-secondary-text)">Commercial CRM</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 lg:text-3xl">Manage Listings, Leads and Pipeline</h1>
          <p className="mt-2 text-sm text-slate-600">Built for owners, agents and builders to run daily sales operations from one dashboard.</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {TABS.map((tab) => (
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

        {error ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
        {statusMessage ? <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{statusMessage}</div> : null}

        <div className="mt-6">
          {isLoading ? (
            <LoadingScreen label="Loading CRM" sublabel="Fetching your listings and leads" />
          ) : (
            <>
              {currentTab === 'overview' ? renderOverview() : null}
              {currentTab === 'listings' ? renderListings() : null}
              {currentTab === 'leads' ? renderLeads() : null}
              {currentTab === 'profile' ? renderProfile() : null}
            </>
          )}
        </div>
      </section>
    </div>
  )
}

export default CommercialCRMPage
