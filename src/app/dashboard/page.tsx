import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  AVAILABLE:   'bg-green-100 text-green-700',
  ASSIGNED:    'bg-blue-100 text-blue-700',
  MAINTENANCE: 'bg-yellow-100 text-yellow-700',
  RETIRED:     'bg-gray-100 text-gray-600',
  LOST:        'bg-red-100 text-red-700',
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  const [totalAssets, byStatus, byType, recentAssets] = await Promise.all([
    prisma.asset.count(),
    prisma.asset.groupBy({ by: ['status'], _count: true }),
    prisma.asset.groupBy({ by: ['type'], _count: true, orderBy: { _count: { type: 'desc' } }, take: 5 }),
    prisma.asset.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
  ])

  const totalValue = await prisma.asset.aggregate({ _sum: { purchasePrice: true } })

  const statusMap = Object.fromEntries(byStatus.map(s => [s.status, s._count]))

  const stats = [
    { label: 'Total Assets',  value: totalAssets, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Available',     value: statusMap['AVAILABLE'] || 0,   color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Assigned',      value: statusMap['ASSIGNED'] || 0,    color: 'text-blue-600',  bg: 'bg-blue-50' },
    { label: 'In Maintenance',value: statusMap['MAINTENANCE'] || 0, color: 'text-yellow-600',bg: 'bg-yellow-50' },
  ]

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <div className="mb-10 flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-xl md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-500">Welcome back, {session?.user?.name}</p>
        </div>
        <Link href="/assets/new" className="btn btn-primary px-5 py-3 text-sm">
          + Add Asset
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="rounded-[1.75rem] border border-slate-200 bg-white/95 p-6 shadow-sm">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${stat.bg} mb-4`}>
              <span className={`text-lg font-semibold ${stat.color}`}>{stat.value}</span>
            </div>
            <p className="text-3xl font-semibold text-slate-950">{stat.value}</p>
            <p className="mt-2 text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-xl">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Recent Assets</h2>
              <p className="text-sm text-slate-500">Quick access to your latest inventory.</p>
            </div>
            <Link href="/assets" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              View all →
            </Link>
          </div>
          {recentAssets.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-sm text-slate-500">
              No assets yet. <Link href="/assets/new" className="font-semibold text-brand-600 hover:text-brand-700">Add one</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAssets.map(asset => (
                <Link key={asset.id} href={`/assets/${asset.id}`} className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-white">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{asset.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{asset.type} {asset.brand ? `· ${asset.brand}` : ''}</p>
                  </div>
                  <span className={`text-xs font-semibold rounded-full px-3 py-1 ${statusColors[asset.status]}`}>
                    {asset.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-xl">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Asset Types</h2>
              <p className="text-sm text-slate-500">Based on your current inventory</p>
            </div>
          </div>
          {byType.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-sm text-slate-500">
              No data yet
            </div>
          ) : (
            <div className="space-y-5">
              {byType.map(item => (
                <div key={item.type} className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-slate-700">
                    <span className="font-medium">{item.type}</span>
                    <span className="text-slate-500">{item._count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${totalAssets ? (item._count / totalAssets) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          {totalValue._sum.purchasePrice && (
            <div className="mt-6 pt-5 border-t border-slate-200">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Total asset value</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                ₹{totalValue._sum.purchasePrice.toLocaleString('en-IN')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
