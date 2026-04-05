const StatCard = ({ title, value, tone = 'blue' }) => {
  const toneMap = {
    blue: 'text-blue-700 bg-blue-50 border-blue-100',
    amber: 'text-amber-700 bg-amber-50 border-amber-100',
    emerald: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    rose: 'text-rose-700 bg-rose-50 border-rose-100'
  }

  return (
    <div className={`rounded-2xl border px-4 py-3 ${toneMap[tone] || toneMap.blue}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-80">{title}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  )
}

const AdminStatsCards = ({ stats }) => {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <StatCard title="Pending" value={stats.pendingListings ?? 0} tone="amber" />
      <StatCard title="Approved" value={stats.activeListings ?? 0} tone="emerald" />
      <StatCard title="Rejected" value={stats.rejectedListings ?? 0} tone="rose" />
      <StatCard title="Total Properties" value={stats.totalProperties ?? 0} tone="blue" />
      <StatCard title="Total Leads" value={stats.totalLeads ?? 0} tone="blue" />
      <StatCard title="Conversion" value={`${stats.conversionRate ?? 0}%`} tone="emerald" />
    </div>
  )
}

export default AdminStatsCards
