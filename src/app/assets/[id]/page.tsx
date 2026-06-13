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
    <div className="p-8 max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/assets" className="text-sm text-gray-500 hover:text-gray-700">← Back to Assets</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">{asset.name}</h1>
        </div>
        <div className="flex gap-3">
          <Link href={`/assets/${asset.id}/edit`} className="btn-secondary">Edit</Link>
          <DeleteButton id={asset.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Image */}
        {asset.imageUrl && (
          <div className="md:col-span-1">
            <div className="card p-0 overflow-hidden">
              <Image src={asset.imageUrl} alt={asset.name} width={400} height={300} className="w-full object-cover" />
            </div>
          </div>
        )}

        <div className={`space-y-6 ${asset.imageUrl ? 'md:col-span-2' : 'md:col-span-3'}`}>
          {/* Status */}
          <div className="card flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Status</p>
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${statusColors[asset.status]}`}>
                {asset.status}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Type</p>
              <p className="text-sm font-semibold text-gray-800">{asset.type}</p>
            </div>
            {asset.purchasePrice && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Value</p>
                <p className="text-sm font-semibold text-gray-800">₹{asset.purchasePrice.toLocaleString('en-IN')}</p>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="card grid grid-cols-2 gap-4">
            <Field label="Brand" value={asset.brand} />
            <Field label="Model" value={asset.model} />
            <Field label="Serial Number" value={asset.serialNumber} />
            <Field label="Location" value={asset.location} />
            <Field label="Assigned To" value={asset.assignedTo} />
            <Field label="Purchase Date" value={asset.purchaseDate?.toLocaleDateString('en-IN')} />
            <Field label="Warranty Expiry" value={asset.warrantyExpiry?.toLocaleDateString('en-IN')} />
            <Field label="Added By" value={asset.createdBy.name} />
          </div>

          {asset.notes && (
            <div className="card">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Notes</p>
              <p className="text-sm text-gray-700">{asset.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
