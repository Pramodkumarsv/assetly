import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import AssetsTableClient from '@/components/AssetsTableClient'

const statusColors: Record<string, string> = {
  AVAILABLE:   'bg-green-100 text-green-700',
  ASSIGNED:    'bg-blue-100 text-blue-700',
  MAINTENANCE: 'bg-yellow-100 text-yellow-700',
  RETIRED:     'bg-gray-100 text-gray-600',
  LOST:        'bg-red-100 text-red-700',
}

export default async function AssetsPage() {
  const assets = await prisma.asset.findMany({
    where: { isAccessory: false },
    orderBy: { createdAt: 'desc' },
    include: { createdBy: { select: { name: true } } },
  })
  // Serialize to plain JSON for client component
  const assetsJson = JSON.parse(JSON.stringify(assets))

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-xl md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Assets</h1>
          <p className="mt-2 text-sm text-slate-500">{assets.length} assets total</p>
        </div>
        <Link href="/assets/new" className="btn btn-primary px-5 py-3 text-sm">
          + Add Asset
        </Link>
      </div>

      {assets.length === 0 ? (
        <div className="card rounded-[2rem] border border-slate-200 bg-white/95 p-12 text-center shadow-xl">
          <svg className="mx-auto mb-4 h-14 w-14 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
          </svg>
          <p className="text-slate-500 mb-5 text-base">No assets added yet</p>
          <Link href="/assets/new" className="btn btn-primary px-5 py-3">
            Add your first asset
          </Link>
        </div>
      ) : (
        <div className="card rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-xl">
          <AssetsTableClient assets={assetsJson} />
        </div>
      )}
    </div>
  )
}
