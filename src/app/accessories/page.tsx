import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Prisma } from '@prisma/client'

export default async function AccessoriesPage() {
  const accessories = await prisma.asset.findMany({
    where: { isAccessory: true },
    orderBy: { createdAt: 'desc' },
    include: { createdBy: { select: { name: true } } },
  })

  const typeBreakdown = accessories.reduce(
    (acc, acc_item) => {
      const key = acc_item.type || 'OTHER'
      acc[key] = (acc[key] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-xl md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Accessories</h1>
          <p className="mt-2 text-sm text-slate-500">{accessories.length} accessories total</p>
        </div>
        <Link href="/assets/new" className="btn btn-primary px-5 py-3 text-sm">
          + Add Accessory
        </Link>
      </div>

      {accessories.length === 0 ? (
        <div className="card rounded-[2rem] border border-slate-200 bg-white/95 p-12 text-center shadow-xl">
          <svg className="mx-auto mb-4 h-14 w-14 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
          </svg>
          <p className="text-slate-500 mb-5 text-base">No accessories added yet</p>
          <Link href="/assets/new" className="btn btn-primary px-5 py-3">
            Add your first accessory
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(typeBreakdown).map(([type, count]) => (
            <div key={type} className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-xl hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-slate-950">{type}</h3>
              <p className="mt-2 text-3xl font-bold text-slate-500">{count}</p>
              <p className="mt-1 text-xs text-slate-400">{count === 1 ? 'item' : 'items'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
