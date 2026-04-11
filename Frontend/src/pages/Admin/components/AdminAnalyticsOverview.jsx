import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import AdminStatsCards from './AdminStatsCards'

const COLORS = {
  primary: '#2563eb',
  orange: '#f97316',
  green: '#16a34a',
  slate: '#0f172a',
  rose: '#e11d48',
  muted: '#94a3b8',
}

const chartTooltipStyle = {
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  backgroundColor: '#ffffff',
  boxShadow: '0 20px 45px rgba(15, 23, 42, 0.12)',
}

const formatCompactNumber = (value) => new Intl.NumberFormat('en', { notation: 'compact' }).format(value || 0)

const formatPercent = (value) => `${Number(value || 0).toFixed(1)}%`

const MiniStat = ({ label, value, note, tone = 'primary' }) => {
  const toneMap = {
    primary: 'border-blue-100 bg-blue-50 text-blue-700',
    orange: 'border-orange-100 bg-orange-50 text-orange-700',
    green: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    rose: 'border-rose-100 bg-rose-50 text-rose-700',
    slate: 'border-slate-200 bg-slate-50 text-slate-700',
  }

  return (
    <div className={`rounded-2xl border p-4 ${toneMap[tone] || toneMap.primary}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-80">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      {note ? <p className="mt-1 text-xs text-slate-500">{note}</p> : null}
    </div>
  )
}

const InsightChip = ({ tone = 'primary', title, description }) => {
  const toneMap = {
    primary: 'border-blue-100 bg-blue-50 text-blue-700',
    orange: 'border-orange-100 bg-orange-50 text-orange-700',
    green: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    rose: 'border-rose-100 bg-rose-50 text-rose-700',
  }

  return (
    <div className={`rounded-2xl border px-4 py-3 ${toneMap[tone] || toneMap.primary}`}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs leading-5 opacity-80">{description}</p>
    </div>
  )
}

const AdminAnalyticsOverview = ({ stats = {}, properties = [], leads = [], users = [], searchActivities = [], onNavigateTab }) => {
  const propertyStatusData = useMemo(() => {
    const total = Number(stats.totalProperties || 0)
    const pending = Number(stats.pendingListings || 0)
    const approved = Number(stats.activeListings || 0)
    const rejected = Number(stats.rejectedListings || 0)

    return total > 0
      ? [
          { name: 'Pending', value: pending, color: COLORS.orange },
          { name: 'Approved', value: approved, color: COLORS.green },
          { name: 'Rejected', value: rejected, color: COLORS.rose },
        ]
      : [{ name: 'No data', value: 1, color: COLORS.muted }]
  }, [stats])

  const leadFunnelData = useMemo(() => {
    const values = [
      { name: 'New', value: Number(stats.newLeads || 0), color: COLORS.primary },
      { name: 'Contacted', value: Number(stats.contactedLeads || 0), color: COLORS.orange },
      { name: 'Closed', value: Number(stats.closedLeads || 0), color: COLORS.green },
    ]

    return values.some((item) => item.value > 0)
      ? values
      : [{ name: 'No data', value: 1, color: COLORS.muted }]
  }, [stats])

  const searchTrendData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const counts = days.reduce((accumulator, day) => {
      accumulator[day] = 0
      return accumulator
    }, {})

    searchActivities.forEach((activity) => {
      const createdAt = activity?.createdAt ? new Date(activity.createdAt) : null
      if (!createdAt || Number.isNaN(createdAt.getTime())) {
        return
      }

      const day = days[createdAt.getDay()]
      counts[day] += 1
    })

    return days.map((day) => ({
      day,
      searches: counts[day],
    }))
  }, [searchActivities])

  const cityDemandData = useMemo(() => {
    const cityCounts = new Map()

    searchActivities.forEach((activity) => {
      const city = String(activity?.city || 'Unspecified').trim() || 'Unspecified'
      cityCounts.set(city, (cityCounts.get(city) || 0) + 1)
    })

    return Array.from(cityCounts.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 5)
  }, [searchActivities])

  const roleMixData = useMemo(() => {
    const roles = ['buyer', 'renter', 'owner', 'agent', 'builder', 'seller', 'admin']
    const roleCounts = roles.reduce((accumulator, role) => {
      accumulator[role] = 0
      return accumulator
    }, {})

    users.forEach((user) => {
      const role = roles.includes(user?.role) ? user.role : 'buyer'
      roleCounts[role] += 1
    })

    return roles.map((role, index) => ({
      name: role.charAt(0).toUpperCase() + role.slice(1),
      value: roleCounts[role],
      color: [COLORS.primary, COLORS.orange, COLORS.green, COLORS.slate, COLORS.orange, COLORS.primary, COLORS.green][index],
    }))
  }, [users])

  const operationalScore = useMemo(() => {
    const totalProperties = Number(stats.totalProperties || 0)
    const totalLeads = Number(stats.totalLeads || 0)
    const moderationRate = totalProperties > 0 ? Number(((stats.activeListings || 0) / totalProperties) * 100) : 0
    const responseRate = totalLeads > 0 ? Number((((stats.contactedLeads || 0) + (stats.closedLeads || 0)) / totalLeads) * 100) : 0
    const closingRate = Number(stats.conversionRate || 0)
    const healthScore = Math.round((moderationRate + responseRate + Math.min(closingRate * 2.5, 100)) / 3)

    return Math.max(0, Math.min(100, healthScore))
  }, [stats])

  const propertyBacklog = Number(stats.pendingListings || 0)
  const activeListings = Number(stats.activeListings || 0)
  const totalLeads = Number(stats.totalLeads || 0)
  const newLeads = Number(stats.newLeads || 0)
  const contactedLeads = Number(stats.contactedLeads || 0)
  const closedLeads = Number(stats.closedLeads || 0)
  const conversionRate = Number(stats.conversionRate || 0)
  const totalUsers = Number(stats.totalUsers || 0)

  const topCity = cityDemandData[0]
  const topCityShare = topCity && searchActivities.length > 0
    ? Math.round((topCity.count / searchActivities.length) * 100)
    : 0

  const insights = [
    {
      tone: propertyBacklog > activeListings ? 'orange' : 'green',
      title: propertyBacklog > activeListings ? 'Moderation backlog is above live inventory' : 'Moderation flow is healthy',
      description: propertyBacklog > activeListings
        ? 'Prioritize pending listing review to keep the marketplace fresh and improve buyer trust.'
        : 'Approved inventory is keeping pace with the review queue, which supports a cleaner browsing experience.',
    },
    {
      tone: newLeads > contactedLeads ? 'rose' : 'green',
      title: newLeads > contactedLeads ? 'Lead follow-up needs attention' : 'Lead response is moving well',
      description: newLeads > contactedLeads
        ? 'More new leads are entering than being contacted. Reduce response time to protect conversions.'
        : 'The contacted pipeline is keeping up with incoming interest, which is a strong operational signal.',
    },
    {
      tone: conversionRate >= 20 ? 'green' : 'orange',
      title: conversionRate >= 20 ? 'Conversion rate is healthy' : 'Conversion rate has room to improve',
      description: conversionRate >= 20
        ? 'Your closing performance is strong enough to scale acquisition with confidence.'
        : 'Consider improving lead qualification, follow-up cadence, and seller response workflows.',
    },
    {
      tone: topCityShare >= 35 ? 'primary' : 'slate',
      title: topCity ? `Demand is concentrated in ${topCity.city}` : 'Demand data is still building',
      description: topCity
        ? `Roughly ${topCityShare}% of recent searches are concentrated here. Consider matching inventory and campaigns to this pocket.`
        : 'Collect more search signals to surface city-level demand patterns for better inventory planning.',
    },
  ]

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Dashboard</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">Overview</h2>
        </div>

        <div className="grid min-w-55 grid-cols-2 gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Operational Score</p>
            <p className="mt-1 text-3xl font-bold text-slate-950">{operationalScore}/100</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Live Data</p>
            <p className="mt-1 text-3xl font-bold text-slate-950">{formatCompactNumber(searchActivities.length)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Moderation</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">{propertyBacklog} pending</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Conversion</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">{formatPercent(conversionRate)}</p>
          </div>
        </div>
      </div>

      <AdminStatsCards stats={stats} />

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Moderation and Lead Pipeline</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-950">Review queue and conversion funnel</h3>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Lead Conversion</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">{formatPercent(conversionRate)}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Property Status Mix</p>
                  <p className="mt-1 text-sm text-slate-600">Approval backlog versus live listings</p>
                </div>
              </div>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Pie
                      data={propertyStatusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={72}
                      outerRadius={104}
                      paddingAngle={4}
                      stroke="none"
                    >
                      {propertyStatusData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                {propertyStatusData.map((entry) => (
                  <div key={entry.name} className="rounded-2xl border border-white bg-white px-3 py-2 shadow-sm">
                    <p className="font-semibold text-slate-900">{entry.name}</p>
                    <p className="mt-1 text-slate-500">{formatCompactNumber(entry.value)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Lead Funnel</p>
                <p className="mt-1 text-sm text-slate-600">Incoming leads by lifecycle stage</p>
              </div>

              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leadFunnelData} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={70} tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Bar dataKey="value" radius={[0, 999, 999, 0]} barSize={20}>
                      {leadFunnelData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <MiniStat label="New" value={newLeads} note="Fresh inquiries" tone="primary" />
                <MiniStat label="Contacted" value={contactedLeads} note="Engaged leads" tone="orange" />
                <MiniStat label="Closed" value={closedLeads} note="Won opportunities" tone="green" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white shadow-xl shadow-slate-200/40">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">Operational Health</p>
                <h3 className="mt-2 text-2xl font-bold">Control score</h3>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-right">
                <p className="text-xs uppercase tracking-[0.22em] text-white/60">Quality</p>
                <p className="mt-1 text-xl font-semibold">{operationalScore}/100</p>
              </div>
            </div>

            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="72%"
                  outerRadius="100%"
                  data={[{ name: 'Health', value: operationalScore, fill: COLORS.green }]}
                  startAngle={220}
                  endAngle={-40}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar dataKey="value" cornerRadius={999} fill={COLORS.green} background={{ fill: '#1e293b' }} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MiniStat label="Active Rate" value={formatPercent(stats.totalProperties ? (activeListings / stats.totalProperties) * 100 : 0)} note="Live inventory share" tone="green" />
              <MiniStat label="Response Rate" value={formatPercent(totalLeads ? ((contactedLeads + closedLeads) / totalLeads) * 100 : 0)} note="Lead handling efficiency" tone="orange" />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Audience Mix</p>
                <h3 className="mt-2 text-xl font-bold text-slate-950">User role composition</h3>
              </div>
            </div>

            <div className="mt-4 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Pie data={roleMixData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={82} paddingAngle={4} stroke="none">
                    {roleMixData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              {roleMixData.map((entry) => (
                <div key={entry.name} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="font-semibold text-slate-900">{entry.name}</p>
                  <p className="mt-1 text-slate-500">{formatCompactNumber(entry.value)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Demand Hotspots</p>
              <h3 className="mt-2 text-xl font-bold text-slate-950">Top search cities</h3>
            </div>

            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cityDemandData} margin={{ left: 0, right: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="city" tick={{ fill: '#475569', fontSize: 11 }} interval={0} angle={-12} textAnchor="end" height={52} />
                  <YAxis allowDecimals={false} tick={{ fill: '#475569', fontSize: 11 }} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="count" radius={[14, 14, 0, 0]} fill={COLORS.primary} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Search Intelligence</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-950">Weekly search activity</h3>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Recent Searches</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">{formatCompactNumber(searchActivities.length)}</p>
            </div>
          </div>

          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={searchTrendData} margin={{ left: 0, right: 8 }}>
                <defs>
                  <linearGradient id="searchTrendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#475569', fontSize: 11 }} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Area type="monotone" dataKey="searches" stroke={COLORS.primary} strokeWidth={3} fill="url(#searchTrendFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm lg:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Action Center</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-950">Recommended next moves</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab?.('reports')}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
            >
              Open Reports
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <InsightChip tone={insights[0].tone} title={insights[0].title} description={insights[0].description} />
            <InsightChip tone={insights[1].tone} title={insights[1].title} description={insights[1].description} />
            <InsightChip tone={insights[2].tone} title={insights[2].title} description={insights[2].description} />
            <InsightChip tone={insights[3].tone} title={insights[3].title} description={insights[3].description} />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <button type="button" onClick={() => onNavigateTab?.('properties')} className="rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:bg-slate-100">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Queue</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">Review properties</p>
            </button>
            <button type="button" onClick={() => onNavigateTab?.('leads')} className="rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:bg-slate-100">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Pipeline</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">Work leads</p>
            </button>
            <button type="button" onClick={() => onNavigateTab?.('users')} className="rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:bg-slate-100">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">CRM</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">Manage users</p>
            </button>
          </div>

          {properties.length > 0 ? (
            <div className="mt-5 rounded-3xl border border-white bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Priority Queue</p>
                  <h4 className="mt-1 text-lg font-bold text-slate-950">Highest value pending listings</h4>
                </div>
                <p className="text-xs text-slate-500">Live review sample</p>
              </div>

              <div className="mt-4 space-y-3">
                {[...properties]
                  .sort((left, right) => Number(right.price || 0) - Number(left.price || 0))
                  .slice(0, 3)
                  .map((property, index) => (
                    <div key={property._id || `${property.title}-${index}`} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{property.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{property.city}, {property.state}</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">INR {Number(property.price || 0).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default AdminAnalyticsOverview