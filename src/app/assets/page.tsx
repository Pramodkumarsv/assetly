import { prisma } from '@/lib/prisma'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  AVAILABLE:   'bg-green-100 text-green-700',
  ASSIGNED:    'bg-blue-100 text-blue-700',
  MAINTENANCE: 'bg-yellow-100 text-yellow-700',
  RETIRED:     'bg-gray-100 text-gray-600',
  LOST:        'bg-red-100 text-red-700',
}

export default async function AssetsPage() {
  const assets = await prisma.asset.findMany({
    orderBy: { createdAt: 'desc' },
    include: { createdBy: { select: { name: true } } },
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assets</h1>
          <p className="text-gray-500 text-sm mt-1">{assets.length} assets total</p>
        </div>
        <Link href="/assets/new" className="btn-primary">+ Add Asset</Link>
      </div>

      {assets.length === 0 ? (
        <div className="card text-center py-16">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
          </svg>
          <p className="text-gray-500 mb-4">No assets added yet</p>
          <Link href="/assets/new" className="btn-primary">Add your first asset</Link>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Name', 'Type', 'Brand / Model', 'Serial No.', 'Status', 'Assigned To', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {assets.map(asset => (
                <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{asset.name}</td>
                  <td className="px-6 py-4 text-gray-600">{asset.type}</td>
                  <td className="px-6 py-4 text-gray-600">{[asset.brand, asset.model].filter(Boolean).join(' / ') || '—'}</td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">{asset.serialNumber || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[asset.status]}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{asset.assignedTo || '—'}</td>
                  <td className="px-6 py-4">
                    <Link href={`/assets/${asset.id}`} className="text-brand-600 hover:text-brand-700 font-medium">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
