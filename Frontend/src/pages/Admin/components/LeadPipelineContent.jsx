import { useCallback, useMemo, useState } from 'react'

const statusConfig = {
  new: { bg: 'bg-amber-100', text: 'text-amber-700', icon: '✨', label: 'New' },
  contacted: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '✔', label: 'Contacted' },
  closed: { bg: 'bg-slate-200', text: 'text-slate-700', icon: '✓', label: 'Closed' }
}

function getFullName(person, fallback = 'Unknown') {
  if (!person) return fallback
  if (typeof person === 'string') return person
  const fullName = [person.firstName, person.lastName].filter(Boolean).join(' ').trim()
  return fullName || person.name || fallback
}

function getInitials(name) {
  if (!name) return 'U'
  const parts = name.split(' ')
  return parts.map((part) => part[0]).join('').toUpperCase().slice(0, 2)
}

function getLeadGroupKey(lead) {
  if (lead?.buyerId?._id) {
    return lead.buyerId._id
  }

  const publicKey = [lead?.mobile, lead?.email, lead?.name].find(Boolean)
  return `public-${publicKey || lead?._id || 'unknown'}`
}

function formatCurrency(value) {
  if (value === undefined || value === null || value === '') return 'Not shared'
  if (typeof value !== 'number') return 'Not shared'
  return `₹${(value / 100000).toFixed(1)}L`
}

function formatDate(dateString) {
  try {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    }

    const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24))
    if (diffDays < 7) return `${diffDays}d ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return 'N/A'
  }
}

export default function LeadPipelineContent({
  leads,
  isLoading,
  error,
  leadStatusFilter,
  onStatusUpdate,
  onAssignToMe,
  onDeleteLead
}) {
  const [expandedUsers, setExpandedUsers] = useState(new Set())
  const [loadingLeadId, setLoadingLeadId] = useState(null)

  const toggleUserExpand = useCallback((userId) => {
    setExpandedUsers((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) {
        next.delete(userId)
      } else {
        next.add(userId)
      }
      return next
    })
  }, [])

  const groupedLeads = useMemo(() => {
    const groups = {}

    leads.forEach((lead) => {
      const groupKey = getLeadGroupKey(lead)
      if (!groups[groupKey]) {
        groups[groupKey] = {
          buyer: lead.buyerId,
          fallbackName: lead.name || 'Callback User',
          fallbackEmail: lead.email || '',
          fallbackPhone: lead.mobile || '',
          leads: []
        }
      }
      groups[groupKey].leads.push(lead)
    })

    return Object.entries(groups).sort((a, b) => {
      const aLatest = Math.max(...a[1].leads.map((l) => new Date(l.createdAt)))
      const bLatest = Math.max(...b[1].leads.map((l) => new Date(l.createdAt)))
      return bLatest - aLatest
    })
  }, [leads])

  const handleStatusUpdate = async (leadId, newStatus) => {
    setLoadingLeadId(leadId)
    try {
      await onStatusUpdate(leadId, newStatus)
    } finally {
      setLoadingLeadId(null)
    }
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {error}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-3xl bg-slate-200" />
        ))}
      </div>
    )
  }

  if (leads.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-slate-300 px-6 py-12 text-center">
        <div className="text-4xl mb-3">📭</div>
        <h3 className="text-lg font-semibold text-slate-700">No leads found</h3>
        <p className="mt-1 text-sm text-slate-500">
          {leadStatusFilter === 'all' ? 'Start building your pipeline!' : `No leads with status "${leadStatusFilter}"`}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {groupedLeads.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-300 px-6 py-12 text-center">
          <div className="text-4xl mb-3">📭</div>
          <h3 className="text-lg font-semibold text-slate-700">No users with leads</h3>
        </div>
      ) : (
        groupedLeads.map(([buyerId, { buyer, fallbackName, fallbackEmail, fallbackPhone, leads: userLeads }]) => {
          const buyerName = getFullName(buyer, fallbackName || 'Callback User')
          const buyerInitials = getInitials(buyerName)
          const isExpanded = expandedUsers.has(buyerId)
          const statusCounts = {
            new: userLeads.filter((l) => l.status === 'new').length,
            contacted: userLeads.filter((l) => l.status === 'contacted').length,
            closed: userLeads.filter((l) => l.status === 'closed').length
          }
          const latestLead = userLeads.reduce((latest, lead) => {
            return new Date(lead.createdAt) > new Date(latest.createdAt) ? lead : latest
          })

          return (
            <div
              key={buyerId}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-br from-white via-slate-50 to-white shadow-sm transition-all hover:shadow-md"
            >
              {/* Main User Card - Always Visible */}
              <button
                onClick={() => toggleUserExpand(buyerId)}
                className="w-full px-6 py-5 text-left transition hover:bg-slate-50/50"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Avatar + User Info */}
                  <div className="flex gap-4 flex-1 min-w-0">
                    <div
                      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white"
                      style={{ backgroundColor: `hsl(${hashCode(buyerId) % 360}, 70%, 60%)` }}
                    >
                      {buyerInitials}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900 truncate">{buyerName}</h3>
                        <span className="inline-block px-3 py-1 rounded-full bg-(--color-primary) text-white text-xs font-semibold whitespace-nowrap">
                          {userLeads.length} {userLeads.length === 1 ? 'Lead' : 'Leads'}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-slate-600 truncate">{buyer?.email || fallbackEmail || 'No email'}</p>
                      <p className="text-sm text-slate-500">{buyer?.phone || fallbackPhone || 'No phone shared'}</p>
                    </div>
                  </div>

                  {/* Right: Status Badges + Expand Icon */}
                  <div className="flex shrink-0 items-center gap-3">
                    <div className="flex gap-2">
                      {statusCounts.new > 0 && (
                        <div
                          className={`rounded-full ${statusConfig.new.bg} ${statusConfig.new.text} px-3 py-1 text-xs font-semibold flex items-center gap-1`}
                        >
                          <span>{statusConfig.new.icon}</span>
                          <span>{statusCounts.new}</span>
                        </div>
                      )}
                      {statusCounts.contacted > 0 && (
                        <div
                          className={`rounded-full ${statusConfig.contacted.bg} ${statusConfig.contacted.text} px-3 py-1 text-xs font-semibold flex items-center gap-1`}
                        >
                          <span>{statusConfig.contacted.icon}</span>
                          <span>{statusCounts.contacted}</span>
                        </div>
                      )}
                      {statusCounts.closed > 0 && (
                        <div
                          className={`rounded-full ${statusConfig.closed.bg} ${statusConfig.closed.text} px-3 py-1 text-xs font-semibold flex items-center gap-1`}
                        >
                          <span>{statusConfig.closed.icon}</span>
                          <span>{statusCounts.closed}</span>
                        </div>
                      )}
                    </div>

                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    >
                      <span className="text-xl">▼</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-3 text-xs">
                  <span className="text-slate-500">Last activity: {formatDate(latestLead.createdAt)}</span>
                  {latestLead.assignedToAdmin && (
                    <span className="text-slate-500">
                      Assigned to: {getFullName(latestLead.assignedToAdmin, 'Unassigned')}
                    </span>
                  )}
                </div>
              </button>

              {/* Expanded Content - Properties & Properties List */}
              {isExpanded && (
                <div className="border-t border-slate-200 bg-slate-50/50 px-6 py-5 space-y-4">
                  {/* Properties List */}
                  <div className="space-y-3">
                    {userLeads.map((lead) => {
                      const property = lead.propertyId || {}
                      return (
                        <div
                          key={lead._id}
                          className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 transition hover:shadow-sm"
                        >
                          {/* Property Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-slate-900 truncate">{property.title || 'Property'}</h4>
                              <p className="text-sm text-slate-600">
                                {property.city || 'City'} • {property.propertyType || 'Type'} • {property.listingType || 'Listing'}
                              </p>
                              <p className="text-sm font-medium text-slate-700 mt-1">{formatCurrency(property.price)}</p>
                            </div>
                            <div
                              className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${statusConfig[lead.status]?.bg} ${statusConfig[lead.status]?.text}`}
                            >
                              {statusConfig[lead.status]?.label || lead.status}
                            </div>
                          </div>

                          {/* Contact Info */}
                          <div className="flex flex-wrap gap-3 text-sm pt-2 border-t border-slate-100">
                            <span className="text-slate-600"><strong>Email:</strong> {lead.email || 'N/A'}</span>
                            <span className="text-slate-600"><strong>Phone:</strong> {lead.mobile || 'N/A'}</span>
                            {lead.whatsapp && <span className="text-slate-600"><strong>WhatsApp:</strong> {lead.whatsapp}</span>}
                          </div>

                          {/* Message */}
                          {lead.message && (
                            <div className="pt-2 border-t border-slate-100">
                              <p className="text-xs text-slate-500 font-semibold mb-1">Message:</p>
                              <p className="text-sm text-slate-700 italic">"{lead.message}"</p>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                            {lead.status !== 'contacted' && (
                              <button
                                onClick={() => handleStatusUpdate(lead._id, 'contacted')}
                                disabled={loadingLeadId === lead._id}
                                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed"
                              >
                                {loadingLeadId === lead._id ? 'Updating...' : 'Contact'}
                              </button>
                            )}
                            {lead.status !== 'closed' && (
                              <button
                                onClick={() => handleStatusUpdate(lead._id, 'closed')}
                                disabled={loadingLeadId === lead._id}
                                className="rounded-lg bg-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-400 disabled:opacity-70 disabled:cursor-not-allowed"
                              >
                                {loadingLeadId === lead._id && lead.status === 'closed' ? 'Updating...' : 'Close'}
                              </button>
                            )}
                            {lead.status === 'new' && (
                              <button
                                onClick={() => onAssignToMe(lead._id)}
                                disabled={loadingLeadId === lead._id}
                                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-70 disabled:cursor-not-allowed"
                              >
                                Assign to me
                              </button>
                            )}
                            <button
                              onClick={() => onDeleteLead(lead._id)}
                              disabled={loadingLeadId === lead._id}
                              className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-70 disabled:cursor-not-allowed ml-auto"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Bulk Actions for User */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => {
                        const uncontactedLeads = userLeads.filter((l) => l.status !== 'contacted')
                        uncontactedLeads.forEach((lead) => handleStatusUpdate(lead._id, 'contacted'))
                      }}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                    >
                      Contact All ({userLeads.filter((l) => l.status !== 'contacted').length})
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}

// Hash function for consistent color generation
function hashCode(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}
