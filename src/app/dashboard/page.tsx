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
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, {session?.user?.name}</p>
        </div>
        <Link href="/assets/new" className="btn-primary">
          + Add Asset
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="card">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${stat.bg} mb-3`}>
              <span className={`text-lg font-bold ${stat.color}`}>{stat.value}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Assets */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Assets</h2>
            <Link href="/assets" className="text-sm text-brand-600 hover:text-brand-700">View all →</Link>
          </div>
          {recentAssets.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No assets yet. <Link href="/assets/new" className="text-brand-600">Add one</Link></p>
          ) : (
            <div className="space-y-3">
              {recentAssets.map(asset => (
                <Link key={asset.id} href={`/assets/${asset.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{asset.name}</p>
                    <p className="text-xs text-gray-500">{asset.type} {asset.brand ? `· ${asset.brand}` : ''}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[asset.status]}`}>
                    {asset.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Asset Types Breakdown */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">By Type</h2>
          {byType.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-3">
              {byType.map(item => (
                <div key={item.type} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{item.type}</span>
                      <span className="text-gray-500">{item._count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: `${(item._count / totalAssets) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {totalValue._sum.purchasePrice && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">Total asset value</p>
              <p className="text-xl font-bold text-gray-900">
                ₹{totalValue._sum.purchasePrice.toLocaleString('en-IN')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
