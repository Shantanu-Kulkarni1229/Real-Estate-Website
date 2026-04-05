import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { apiRequest } from '../../lib/api'
import LoadingScreen from '../../components/LoadingScreen'
import AdminStatsCards from './components/AdminStatsCards'
import PendingPropertyCard from './components/PendingPropertyCard'
import PropertyDetailsModal from './components/PropertyDetailsModal'

const statusOptions = ['pending', 'approved', 'rejected']
const tabOptions = [
  { id: 'overview', label: 'Overview', description: 'Live admin summary' },
  { id: 'properties', label: 'Properties', description: 'Review and moderation' },
  { id: 'leads', label: 'Lead Pipeline', description: 'Booking and lead flow' },
  { id: 'users', label: 'People CRM', description: 'Buyers, sellers, admins' },
  { id: 'searches', label: 'Search Intelligence', description: 'Buyer demand signals' },
  { id: 'reports', label: 'Reports', description: 'Generate analytics exports' }
]
const leadStatusOptions = ['all', 'new', 'contacted', 'closed']
const searchTypeOptions = ['all', 'buy', 'rent']
const userRoleOptions = ['all', 'buyer', 'seller', 'renter', 'admin']

function downloadReportFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  window.URL.revokeObjectURL(url)
}

function getFullName(person, fallback = 'Unknown') {
  if (!person) {
    return fallback
  }

  if (typeof person === 'string') {
    return person
  }

  const fullName = [person.firstName, person.lastName].filter(Boolean).join(' ').trim()
  return fullName || person.name || fallback
}

function formatCurrency(value) {
  if (value === undefined || value === null || value === '') {
    return 'Not shared'
  }

  if (typeof value === 'number') {
    return `INR ${Number(value).toLocaleString('en-IN')}`
  }

  return value
}

function formatSearchBudget(minBudget, maxBudget) {
  if (!minBudget && !maxBudget) {
    return 'Budget not shared'
  }

  if (minBudget && maxBudget) {
    return `${minBudget} - ${maxBudget}`
  }

  return minBudget || maxBudget || 'Budget not shared'
}

const AdminPropertiesPage = () => {
  const { token, user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [statusFilter, setStatusFilter] = useState('pending')
  const [properties, setProperties] = useState([])
  const [leads, setLeads] = useState([])
  const [searchActivities, setSearchActivities] = useState([])
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({})
  const [page, setPage] = useState(1)
  const [leadPage, setLeadPage] = useState(1)
  const [searchPage, setSearchPage] = useState(1)
  const [userPage, setUserPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [leadTotalPages, setLeadTotalPages] = useState(1)
  const [searchTotalPages, setSearchTotalPages] = useState(1)
  const [userTotalPages, setUserTotalPages] = useState(1)
  const [leadStatusFilter, setLeadStatusFilter] = useState('all')
  const [searchTypeFilter, setSearchTypeFilter] = useState('all')
  const [userRoleFilter, setUserRoleFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [actionPropertyId, setActionPropertyId] = useState(null)
  const [actionLeadId, setActionLeadId] = useState(null)
  const [actionUserId, setActionUserId] = useState(null)
  const [reportMessage, setReportMessage] = useState('')
  const [error, setError] = useState('')
  const [selectedProperty, setSelectedProperty] = useState(null)

  const adminName = useMemo(() => {
    if (user?.firstName) {
      return user.firstName
    }

    return 'Admin'
  }, [user])

  const loadStats = useCallback(async () => {
    if (!token) {
      return
    }

    try {
      const response = await apiRequest('/admin/dashboard', { token })
      setStats(response?.data || {})
    } catch {
      // Keep the page usable even if the dashboard summary fails.
    }
  }, [token])

  const loadProperties = useCallback(async ({ currentPage = page, currentStatus = statusFilter } = {}) => {
    if (!token) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await apiRequest(`/admin/properties?status=${currentStatus}&page=${currentPage}&limit=12`, { token })
      setProperties(response?.data || [])
      setTotalPages(response?.pagination?.totalPages || 1)
    } catch (loadError) {
      setError(loadError.message || 'Failed to load admin data')
    } finally {
      setIsLoading(false)
    }
  }, [page, statusFilter, token])

  const loadLeads = useCallback(async ({ currentPage = leadPage, currentStatus = leadStatusFilter } = {}) => {
    if (!token) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const query = new URLSearchParams({
        page: String(currentPage),
        limit: '12'
      })

      if (currentStatus !== 'all') {
        query.set('status', currentStatus)
      }

      const response = await apiRequest(`/interests?${query.toString()}`, { token })
      setLeads(response?.data || [])
      setLeadTotalPages(response?.pagination?.totalPages || 1)
    } catch (loadError) {
      setError(loadError.message || 'Failed to load buyer leads')
    } finally {
      setIsLoading(false)
    }
  }, [leadPage, leadStatusFilter, token])

  const loadSearchActivities = useCallback(async ({ currentPage = searchPage, currentSearchType = searchTypeFilter } = {}) => {
    if (!token) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const query = new URLSearchParams({
        page: String(currentPage),
        limit: '12'
      })

      if (currentSearchType !== 'all') {
        query.set('searchType', currentSearchType)
      }

      const response = await apiRequest(`/search-activities?${query.toString()}`, { token })
      setSearchActivities(response?.data || [])
      setSearchTotalPages(response?.pagination?.totalPages || 1)
    } catch (loadError) {
      setError(loadError.message || 'Failed to load search history')
    } finally {
      setIsLoading(false)
    }
  }, [searchPage, searchTypeFilter, token])

  const loadUsers = useCallback(async ({ currentPage = userPage, currentRole = userRoleFilter } = {}) => {
    if (!token) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const query = new URLSearchParams({
        page: String(currentPage),
        limit: '12'
      })

      if (currentRole !== 'all') {
        query.set('role', currentRole)
      }

      const response = await apiRequest(`/admin/users?${query.toString()}`, { token })
      setUsers(response?.data || [])
      setUserTotalPages(response?.pagination?.totalPages || 1)
    } catch (loadError) {
      setError(loadError.message || 'Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }, [token, userPage, userRoleFilter])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  useEffect(() => {
    if (activeTab === 'overview' || activeTab === 'reports') {
      loadStats()
      loadProperties({ currentPage: 1, currentStatus: 'pending' })
      loadLeads({ currentPage: 1, currentStatus: 'all' })
      loadUsers({ currentPage: 1, currentRole: 'all' })
      loadSearchActivities({ currentPage: 1, currentSearchType: 'all' })
    }

    if (activeTab === 'properties') {
      loadProperties()
    }

    if (activeTab === 'leads') {
      loadLeads()
    }

    if (activeTab === 'searches') {
      loadSearchActivities()
    }

    if (activeTab === 'users') {
      loadUsers()
    }
  }, [activeTab, loadLeads, loadProperties, loadSearchActivities, loadUsers, loadStats])

  const generateSummaryReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      generatedBy: adminName,
      stats,
      queues: {
        pendingProperties: properties.length,
        leads: leads.length,
        users: users.length,
        searchActivities: searchActivities.length
      }
    }

    downloadReportFile(JSON.stringify(report, null, 2), `cityploter-admin-summary-${Date.now()}.json`, 'application/json')
    setReportMessage('Summary JSON report generated successfully.')
  }

  const generateLeadsCsvReport = () => {
    const headers = ['Lead ID', 'Buyer Name', 'Buyer Email', 'Buyer Phone', 'Seller Name', 'Property Title', 'Property City', 'Status', 'Assigned Admin', 'Created At']
    const rows = leads.map((lead) => {
      const buyer = lead.buyerId || {}
      const seller = lead.sellerId || {}
      const property = lead.propertyId || {}
      const assignedAdmin = lead.assignedToAdmin || {}

      return [
        lead._id,
        getFullName(buyer, lead.name || 'Buyer'),
        buyer.email || lead.email || '',
        buyer.phone || lead.mobile || '',
        getFullName(seller, 'Seller'),
        property.title || '',
        property.city || '',
        lead.status || '',
        getFullName(assignedAdmin, ''),
        lead.createdAt ? new Date(lead.createdAt).toISOString() : ''
      ]
    })

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n')

    downloadReportFile(csv, `cityploter-leads-${Date.now()}.csv`, 'text/csv;charset=utf-8;')
    setReportMessage('Leads CSV report generated successfully.')
  }

  const generateUsersCsvReport = () => {
    const headers = ['User ID', 'Name', 'Email', 'Phone', 'Role', 'Is Active', 'Is Verified', 'City', 'State', 'Created At']
    const rows = users.map((item) => [
      item._id,
      getFullName(item, ''),
      item.email || '',
      item.phone || '',
      item.role || '',
      item.isActive ? 'Yes' : 'No',
      item.isVerified ? 'Yes' : 'No',
      item.city || '',
      item.state || '',
      item.createdAt ? new Date(item.createdAt).toISOString() : ''
    ])

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n')

    downloadReportFile(csv, `cityploter-users-${Date.now()}.csv`, 'text/csv;charset=utf-8;')
    setReportMessage('Users CSV report generated successfully.')
  }

  const handleReview = async (propertyId, status, reviewMessage = '') => {
    if (!token) {
      return
    }

    setActionPropertyId(propertyId)
    setError('')

    try {
      await apiRequest(`/admin/properties/${propertyId}/review`, {
        method: 'PATCH',
        token,
        body: {
          status,
          reviewMessage
        }
      })

      setProperties((current) => {
        if (statusFilter === 'pending') {
          return current.filter((item) => item._id !== propertyId)
        }

        return current.map((item) => (
          item._id === propertyId
            ? { ...item, status, verified: status === 'approved' }
            : item
        ))
      })

      setSelectedProperty((current) => {
        if (!current || current._id !== propertyId) {
          return current
        }

        return {
          ...current,
          status,
          verified: status === 'approved',
          reviewNotes: reviewMessage || current.reviewNotes
        }
      })

      loadStats()
    } catch (reviewError) {
      setError(reviewError.message || 'Failed to review property')
    } finally {
      setActionPropertyId(null)
    }
  }

  const handleLeadStatusUpdate = async (leadId, status) => {
    if (!token) {
      return
    }

    setActionLeadId(leadId)
    setError('')

    try {
      await apiRequest(`/interests/${leadId}/status`, {
        method: 'PATCH',
        token,
        body: {
          status,
          assignedToAdmin: status === 'contacted' ? user?._id : undefined
        }
      })

      setLeads((current) => current.map((lead) => (
        lead._id === leadId
          ? {
              ...lead,
              status,
              assignedToAdmin: status === 'contacted' ? user || lead.assignedToAdmin : lead.assignedToAdmin
            }
          : lead
      )))

      loadStats()
    } catch (updateError) {
      setError(updateError.message || 'Failed to update lead status')
    } finally {
      setActionLeadId(null)
    }
  }

  const handleAssignLeadToMe = async (leadId) => {
    if (!token) {
      return
    }

    const currentAdminId = user?._id || user?.userId
    if (!currentAdminId) {
      setError('Current admin id is missing in your session')
      return
    }

    setActionLeadId(leadId)
    setError('')

    try {
      await apiRequest(`/admin/leads/${leadId}/assign`, {
        method: 'PATCH',
        token,
        body: {
          adminId: currentAdminId
        }
      })

      setLeads((current) => current.map((lead) => (
        lead._id === leadId
          ? { ...lead, assignedToAdmin: user }
          : lead
      )))
    } catch (assignError) {
      setError(assignError.message || 'Failed to assign lead')
    } finally {
      setActionLeadId(null)
    }
  }

  const handleSendLeadEmail = async (lead, target) => {
    if (!token) {
      return
    }

    const defaultSubject = `CityPloter lead update for ${lead?.propertyId?.title || 'your listing'}`
    const defaultMessage = `Hi, this is CityPloter support regarding the lead for ${lead?.propertyId?.title || 'the property'}. Please reply to continue the next step in the lead process.`

    const subject = window.prompt('Email subject', defaultSubject)
    if (subject === null) {
      return
    }

    const message = window.prompt('Email message', defaultMessage)
    if (message === null) {
      return
    }

    setActionLeadId(lead._id)
    setError('')

    try {
      await apiRequest(`/admin/leads/${lead._id}/send-email`, {
        method: 'POST',
        token,
        body: {
          target,
          subject,
          message
        }
      })
    } catch (emailError) {
      setError(emailError.message || 'Failed to send lead email')
    } finally {
      setActionLeadId(null)
    }
  }

  const handleDeleteLead = async (leadId) => {
    if (!token) {
      return
    }

    const confirmed = window.confirm('Delete this lead permanently? This action cannot be undone.')
    if (!confirmed) {
      return
    }

    setActionLeadId(leadId)
    setError('')

    try {
      await apiRequest(`/admin/leads/${leadId}`, {
        method: 'DELETE',
        token
      })

      setLeads((current) => current.filter((lead) => lead._id !== leadId))
      loadStats()
    } catch (deleteError) {
      setError(deleteError.message || 'Failed to delete lead')
    } finally {
      setActionLeadId(null)
    }
  }

  const handleToggleUserStatus = async (targetUser) => {
    if (!token) {
      return
    }

    setActionUserId(targetUser._id)
    setError('')

    try {
      await apiRequest(`/admin/users/${targetUser._id}/status`, {
        method: 'PATCH',
        token,
        body: {
          isActive: !targetUser.isActive
        }
      })

      setUsers((current) => current.map((item) => (
        item._id === targetUser._id
          ? { ...item, isActive: !item.isActive }
          : item
      )))
    } catch (userError) {
      setError(userError.message || 'Failed to update user status')
    } finally {
      setActionUserId(null)
    }
  }

  const handleVerifySeller = async (targetUser) => {
    if (!token || targetUser.role !== 'seller') {
      return
    }

    setActionUserId(targetUser._id)
    setError('')

    try {
      await apiRequest(`/admin/users/${targetUser._id}/verify-seller`, {
        method: 'PATCH',
        token,
        body: {
          isVerified: !targetUser.isVerified
        }
      })

      setUsers((current) => current.map((item) => (
        item._id === targetUser._id
          ? { ...item, isVerified: !item.isVerified }
          : item
      )))
    } catch (verifyError) {
      setError(verifyError.message || 'Failed to update seller verification')
    } finally {
      setActionUserId(null)
    }
  }

  const renderPropertyTab = () => (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {statusOptions.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => {
                setStatusFilter(status)
                setPage(1)
              }}
              className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize transition ${
                statusFilter === status
                  ? 'bg-(--color-primary) text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="text-sm text-slate-600">
          Page {page} of {Math.max(totalPages, 1)}
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="mt-6">
          <LoadingScreen label="Loading Properties" sublabel="Fetching review queue" />
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {properties.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
              No properties found for {statusFilter} status.
            </div>
          ) : (
            properties.map((property) => (
              <PendingPropertyCard
                key={property._id}
                property={property}
                onReview={handleReview}
                onOpenDetails={setSelectedProperty}
                loadingAction={actionPropertyId === property._id}
              />
            ))
          )}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          disabled={page <= 1 || isLoading}
          onClick={() => setPage((current) => Math.max(current - 1, 1))}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>

        <button
          type="button"
          disabled={page >= totalPages || isLoading}
          onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </section>
  )

  const renderLeadTab = () => (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Buyer Leads</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">People who want to get connected</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {leadStatusOptions.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => {
                setLeadStatusFilter(status)
                setLeadPage(1)
              }}
              className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize transition ${
                leadStatusFilter === status
                  ? 'bg-(--color-primary) text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="mt-6">
          <LoadingScreen label="Loading Leads" sublabel="Fetching buyer and seller lead activity" />
        </div>
      ) : leads.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
          No leads found for this filter.
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {leads.map((lead) => {
            const buyer = lead.buyerId || {}
            const seller = lead.sellerId || {}
            const property = lead.propertyId || {}
            const assignedAdmin = lead.assignedToAdmin || {}
            const buyerName = getFullName(buyer, lead.name || 'Buyer')
            const buyerEmail = buyer.email || lead.email || 'No email shared'
            const buyerPhone = buyer.phone || lead.mobile || 'No phone shared'
            const sellerName = getFullName(seller, 'Seller')
            const assignedTo = getFullName(assignedAdmin, 'Unassigned')

            return (
              <article key={lead._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Lead Details</p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-900">{buyerName}</h3>
                    <p className="mt-1 text-sm text-slate-600">Property: {property.title || 'Property not populated'}</p>
                  </div>

                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                    lead.status === 'contacted'
                      ? 'bg-emerald-100 text-emerald-700'
                      : lead.status === 'closed'
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-amber-100 text-amber-700'
                  }`}>
                    {lead.status}
                  </span>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Buyer</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{buyerName}</p>
                    <p className="text-sm text-slate-600">{buyerEmail}</p>
                    <p className="text-sm text-slate-600">{buyerPhone}</p>
                    {lead.whatsapp ? <p className="text-sm text-slate-600">WhatsApp: {lead.whatsapp}</p> : null}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Property</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{property.title || 'No title'}</p>
                    <p className="text-sm text-slate-600">{property.city || 'City not shared'}</p>
                    <p className="text-sm text-slate-600 capitalize">{property.propertyType || 'Property type not shared'} · {property.listingType || 'listing type not shared'}</p>
                    <p className="text-sm text-slate-600">Price: {formatCurrency(property.price)}</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Seller / Admin</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">Seller: {sellerName}</p>
                    <p className="text-sm text-slate-600">Assigned to: {assignedTo}</p>
                    <p className="text-sm text-slate-600">Lead status: {lead.status}</p>
                    <p className="text-sm text-slate-600">Created: {lead.createdAt ? new Date(lead.createdAt).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Buyer Message</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{lead.message || 'No message was provided.'}</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={actionLeadId === lead._id}
                    onClick={() => handleLeadStatusUpdate(lead._id, 'contacted')}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Mark contacted
                  </button>
                  <button
                    type="button"
                    disabled={actionLeadId === lead._id}
                    onClick={() => handleLeadStatusUpdate(lead._id, 'closed')}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Close lead
                  </button>
                  <button
                    type="button"
                    disabled={actionLeadId === lead._id}
                    onClick={() => handleAssignLeadToMe(lead._id)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Assign to me
                  </button>
                  <button
                    type="button"
                    disabled={actionLeadId === lead._id}
                    onClick={() => handleSendLeadEmail(lead, 'buyer')}
                    className="rounded-xl border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Email buyer
                  </button>
                  <button
                    type="button"
                    disabled={actionLeadId === lead._id}
                    onClick={() => handleSendLeadEmail(lead, 'seller')}
                    className="rounded-xl border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Email seller
                  </button>
                  <button
                    type="button"
                    disabled={actionLeadId === lead._id}
                    onClick={() => handleSendLeadEmail(lead, 'both')}
                    className="rounded-xl border border-violet-300 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Email both
                  </button>
                  <button
                    type="button"
                    disabled={actionLeadId === lead._id}
                    onClick={() => handleDeleteLead(lead._id)}
                    className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Delete lead
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          disabled={leadPage <= 1 || isLoading}
          onClick={() => setLeadPage((current) => Math.max(current - 1, 1))}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>

        <div className="text-sm text-slate-600">
          Page {leadPage} of {Math.max(leadTotalPages, 1)}
        </div>

        <button
          type="button"
          disabled={leadPage >= leadTotalPages || isLoading}
          onClick={() => setLeadPage((current) => Math.min(current + 1, leadTotalPages))}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </section>
  )

  const renderUsersTab = () => (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">User CRM</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Buyers, sellers, renters and admins</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {userRoleOptions.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => {
                setUserRoleFilter(role)
                setUserPage(1)
              }}
              className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize transition ${
                userRoleFilter === role
                  ? 'bg-(--color-primary) text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="mt-6">
          <LoadingScreen label="Loading Users" sublabel="Fetching buyers, sellers and admins" />
        </div>
      ) : users.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
          No users found for this filter.
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {users.map((item) => {
            const userName = getFullName(item, 'Unknown user')
            return (
              <article key={item._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">User Details</p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-900">{userName}</h3>
                    <p className="mt-1 text-sm text-slate-600">{item.email || 'No email'} · {item.phone || 'No phone'}</p>
                  </div>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 shadow-sm">
                    {item.role}
                  </span>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Account</p>
                    <p className="mt-2 text-sm text-slate-700">Status: <span className="font-semibold">{item.isActive ? 'Active' : 'Inactive'}</span></p>
                    <p className="text-sm text-slate-700">Verified: <span className="font-semibold">{item.isVerified ? 'Yes' : 'No'}</span></p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Location</p>
                    <p className="mt-2 text-sm text-slate-700">{item.city || 'City not provided'}</p>
                    <p className="text-sm text-slate-700">{item.state || 'State not provided'}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Created</p>
                    <p className="mt-2 text-sm text-slate-700">{item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={actionUserId === item._id}
                    onClick={() => handleToggleUserStatus(item)}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {item.isActive ? 'Deactivate' : 'Activate'} user
                  </button>
                  {item.role === 'seller' ? (
                    <button
                      type="button"
                      disabled={actionUserId === item._id}
                      onClick={() => handleVerifySeller(item)}
                      className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {item.isVerified ? 'Unverify seller' : 'Verify seller'}
                    </button>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          disabled={userPage <= 1 || isLoading}
          onClick={() => setUserPage((current) => Math.max(current - 1, 1))}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>

        <div className="text-sm text-slate-600">
          Page {userPage} of {Math.max(userTotalPages, 1)}
        </div>

        <button
          type="button"
          disabled={userPage >= userTotalPages || isLoading}
          onClick={() => setUserPage((current) => Math.min(current + 1, userTotalPages))}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </section>
  )

  const renderSearchTab = () => (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Search History</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Recorded buyer searches</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {searchTypeOptions.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setSearchTypeFilter(type)
                setSearchPage(1)
              }}
              className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize transition ${
                searchTypeFilter === type
                  ? 'bg-(--color-primary) text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="mt-6">
          <LoadingScreen label="Loading Search Logs" sublabel="Fetching user search activity" />
        </div>
      ) : searchActivities.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
          No search history found for this filter.
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {searchActivities.map((activity) => {
            const searchUser = activity.userId || {}
            const userName = getFullName(searchUser, 'Anonymous user')
            const userEmail = searchUser.email || 'No email shared'
            const userPhone = searchUser.phone || 'No phone shared'

            return (
              <article key={activity._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Search Event</p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-900">{userName}</h3>
                    <p className="mt-1 text-sm text-slate-600">{activity.queryText || 'Search query not captured'}</p>
                  </div>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 shadow-sm">
                    {activity.searchType || 'unknown'}
                  </span>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">User</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{userName}</p>
                    <p className="text-sm text-slate-600">{userEmail}</p>
                    <p className="text-sm text-slate-600">{userPhone}</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Search Filters</p>
                    <p className="mt-2 text-sm text-slate-700">City: {activity.city || 'Any city'}</p>
                    <p className="text-sm text-slate-700">Property type: {activity.propertyType || 'Any type'}</p>
                    <p className="text-sm text-slate-700">Budget: {formatSearchBudget(activity.budgetMin, activity.budgetMax)}</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Metadata</p>
                    <p className="mt-2 text-sm text-slate-700">Source page: {activity.sourcePage || 'Unknown'}</p>
                    <p className="text-sm text-slate-700">Search type: {activity.searchType || 'Unknown'}</p>
                    <p className="text-sm text-slate-700">Created: {activity.createdAt ? new Date(activity.createdAt).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          disabled={searchPage <= 1 || isLoading}
          onClick={() => setSearchPage((current) => Math.max(current - 1, 1))}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>

        <div className="text-sm text-slate-600">
          Page {searchPage} of {Math.max(searchTotalPages, 1)}
        </div>

        <button
          type="button"
          disabled={searchPage >= searchTotalPages || isLoading}
          onClick={() => setSearchPage((current) => Math.min(current + 1, searchTotalPages))}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </section>
  )

  const renderOverviewTab = () => (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Admin Overview</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Complete booking and lead management command center</h2>
        <p className="mt-2 text-sm text-slate-600">
          Track property moderation, buyer-seller lead pipeline, account control, and search analytics from one place.
        </p>
      </div>

      <AdminStatsCards stats={stats} />

      <div className="grid gap-4 lg:grid-cols-4">
        <button type="button" onClick={() => setActiveTab('properties')} className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50">
          <p className="text-xs uppercase tracking-wide text-slate-500">Queue</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Property Review</p>
          <p className="mt-1 text-sm text-slate-600">Moderate pending, approved and rejected listings.</p>
        </button>
        <button type="button" onClick={() => setActiveTab('leads')} className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50">
          <p className="text-xs uppercase tracking-wide text-slate-500">Pipeline</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Lead Operations</p>
          <p className="mt-1 text-sm text-slate-600">Assign, contact, close and communicate with leads.</p>
        </button>
        <button type="button" onClick={() => setActiveTab('users')} className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50">
          <p className="text-xs uppercase tracking-wide text-slate-500">CRM</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">People Management</p>
          <p className="mt-1 text-sm text-slate-600">Manage buyers, sellers, renters and admins.</p>
        </button>
        <button type="button" onClick={() => setActiveTab('reports')} className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50">
          <p className="text-xs uppercase tracking-wide text-slate-500">Analytics</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Reports Center</p>
          <p className="mt-1 text-sm text-slate-600">Generate exports for management and operations.</p>
        </button>
      </div>
    </section>
  )

  const renderReportsTab = () => (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Analytics and Reports</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Generate operational exports</h2>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <button
          type="button"
          onClick={generateSummaryReport}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-slate-300 hover:bg-slate-100"
        >
          <p className="text-sm font-semibold text-slate-900">Download Summary (JSON)</p>
          <p className="mt-1 text-xs text-slate-600">Dashboard KPIs and queue sizes for management review.</p>
        </button>

        <button
          type="button"
          onClick={generateLeadsCsvReport}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-slate-300 hover:bg-slate-100"
        >
          <p className="text-sm font-semibold text-slate-900">Download Leads (CSV)</p>
          <p className="mt-1 text-xs text-slate-600">Lead pipeline export including buyer, seller, and status details.</p>
        </button>

        <button
          type="button"
          onClick={generateUsersCsvReport}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-slate-300 hover:bg-slate-100"
        >
          <p className="text-sm font-semibold text-slate-900">Download Users (CSV)</p>
          <p className="mt-1 text-xs text-slate-600">Role-wise account export with verification and activity flags.</p>
        </button>
      </div>

      {reportMessage ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {reportMessage}
        </div>
      ) : null}
    </section>
  )

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex max-w-screen-2xl gap-4 px-3 py-4 sm:px-4 lg:gap-6 lg:px-6 lg:py-6">
        <aside className="hidden w-72 shrink-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">CityPloter Admin</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">Control Panel</h2>
          <p className="mt-1 text-sm text-slate-600">Professional operations workspace for admin workflows.</p>

          <nav className="mt-6 space-y-2">
            {tabOptions.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full rounded-2xl px-3 py-3 text-left transition ${
                  activeTab === tab.id
                    ? 'bg-(--color-primary) text-white shadow-sm'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <p className="text-sm font-semibold">{tab.label}</p>
                <p className={`mt-1 text-xs ${activeTab === tab.id ? 'text-white/90' : 'text-slate-500'}`}>{tab.description}</p>
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 space-y-6">
          <header className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Administrator</p>
                <h1 className="mt-2 text-2xl font-bold text-slate-900 lg:text-3xl">Welcome, {adminName}</h1>
                <p className="mt-1 text-sm text-slate-600">Manage properties, lead bookings, users, analytics and reports from this professional panel.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-right">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Current Role</p>
                  <p className="text-sm font-semibold text-slate-900">{user?.role || 'admin'}</p>
                </div>
                <Link to="/" className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                  Back to Home
                </Link>
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:hidden">
              {tabOptions.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                    activeTab === tab.id
                      ? 'bg-(--color-primary) text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </header>

          {activeTab === 'overview' ? (
            renderOverviewTab()
          ) : activeTab === 'properties' ? (
            renderPropertyTab()
          ) : activeTab === 'leads' ? (
            renderLeadTab()
          ) : activeTab === 'users' ? (
            renderUsersTab()
          ) : activeTab === 'searches' ? (
            renderSearchTab()
          ) : (
            renderReportsTab()
          )}
        </main>
      </div>

      <PropertyDetailsModal
        property={selectedProperty}
        isOpen={Boolean(selectedProperty)}
        onClose={() => setSelectedProperty(null)}
        onReview={handleReview}
        isSubmitting={Boolean(actionPropertyId)}
      />
    </div>
  )
}

export default AdminPropertiesPage
