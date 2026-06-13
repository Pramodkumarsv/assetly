import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import DeleteButton from './DeleteButton'

const statusColors: Record<string, string> = {
  AVAILABLE:   'bg-green-100 text-green-700',
  ASSIGNED:    'bg-blue-100 text-blue-700',
  MAINTENANCE: 'bg-yellow-100 text-yellow-700',
  RETIRED:     'bg-gray-100 text-gray-600',
  LOST:        'bg-red-100 text-red-700',
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-900 mt-0.5">{value || '—'}</p>
    </div>
  )
}

export default async function AssetDetailPage({ params }: { params: { id: string } }) {
  const asset = await prisma.asset.findUnique({
    where: { id: params.id },
    include: { createdBy: { select: { name: true, email: true } } },
  })

  if (!asset) notFound()

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-xl md:flex-row md:items-start md:justify-between">
        <div>
          <Link href="/assets" className="text-sm font-medium text-slate-500 transition hover:text-slate-700">← Back to Assets</Link>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">{asset.name}</h1>
          <p className="mt-2 text-sm text-slate-500">{asset.type} · {asset.brand || 'Unknown brand'}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/assets/${asset.id}/edit`} className="btn btn-secondary px-4 py-2">
            Edit
          </Link>
          <DeleteButton id={asset.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_1fr]">
        {asset.imageUrl && (
          <div className="rounded-[2rem] border border-slate-200 bg-white/95 p-4 shadow-xl">
            <div className="overflow-hidden rounded-[1.75rem] bg-slate-950">
              <Image src={asset.imageUrl} alt={asset.name} width={600} height={400} className="h-full w-full object-cover" />
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Status</p>
                <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${statusColors[asset.status]}`}>
                  {asset.status}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Type</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">{asset.type}</p>
                </div>
                {asset.purchasePrice && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Value</p>
                    <p className="mt-2 text-sm font-semibold text-slate-950">₹{asset.purchasePrice.toLocaleString('en-IN')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-xl">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Brand" value={asset.brand} />
              <Field label="Model" value={asset.model} />
              <Field label="Serial Number" value={asset.serialNumber} />
              <Field label="Location" value={asset.location} />
              <Field label="Assigned To" value={asset.assignedTo} />
              <Field label="Purchase Date" value={asset.purchaseDate?.toLocaleDateString('en-IN')} />
              <Field label="Warranty Expiry" value={asset.warrantyExpiry?.toLocaleDateString('en-IN')} />
              <Field label="Added By" value={asset.createdBy.name} />
            </div>
          </div>

          {asset.notes && (
            <div className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-xl">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400 mb-3">Notes</p>
              <p className="text-sm leading-7 text-slate-700">{asset.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
