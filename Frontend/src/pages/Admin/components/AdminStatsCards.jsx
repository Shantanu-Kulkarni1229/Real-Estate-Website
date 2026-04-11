const StatCard = ({ title, value, tone = 'blue', note }) => {
  const toneMap = {
    blue: 'border-blue-100 bg-blue-50/70 text-blue-700',
    amber: 'border-orange-100 bg-orange-50/70 text-orange-700',
    emerald: 'border-emerald-100 bg-emerald-50/70 text-emerald-700',
    rose: 'border-rose-100 bg-rose-50/70 text-rose-700'
  }

  return (
    <div className={`rounded-3xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${toneMap[tone] || toneMap.blue}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] opacity-80">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/80 bg-white/70 shadow-sm">
          <span className="h-2.5 w-2.5 rounded-full bg-current" />
        </div>
      </div>

      {note ? <p className="mt-3 text-xs font-medium text-slate-600">{note}</p> : null}
    </div>
  )
}

const AdminStatsCards = ({ stats }) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <StatCard title="Pending" value={stats.pendingListings ?? 0} tone="amber" note="Listings waiting for review" />
      <StatCard title="Approved" value={stats.activeListings ?? 0} tone="emerald" note="Listings already live" />
      <StatCard title="Rejected" value={stats.rejectedListings ?? 0} tone="rose" note="Listings flagged by admin" />
      <StatCard title="Total Properties" value={stats.totalProperties ?? 0} tone="blue" note="Entire property catalog" />
      <StatCard title="Total Leads" value={stats.totalLeads ?? 0} tone="blue" note="All inbound buyer leads" />
      <StatCard title="Conversion" value={`${stats.conversionRate ?? 0}%`} tone="emerald" note="Closed leads to total leads" />
    </div>
  )
}

export default AdminStatsCards
