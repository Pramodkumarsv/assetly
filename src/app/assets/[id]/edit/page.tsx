'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

const ASSET_TYPES = ['LAPTOP','DESKTOP','PHONE','TABLET','MONITOR','KEYBOARD','MOUSE','PRINTER','SERVER','NETWORKING','SOFTWARE','OTHER']
const ASSET_STATUSES = ['AVAILABLE','ASSIGNED','MAINTENANCE','RETIRED','LOST']

export default function EditAssetPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [form, setForm] = useState({
    name: '', type: 'LAPTOP', status: 'AVAILABLE',
    serialNumber: '', brand: '', model: '',
    purchaseDate: '', purchasePrice: '',
    warrantyExpiry: '', location: '',
    assignedTo: '', notes: '',
  })

  useEffect(() => {
    fetch(`/api/assets/${id}`)
      .then(r => r.json())
      .then(data => {
        setForm({
          name: data.name || '',
          type: data.type || 'LAPTOP',
          status: data.status || 'AVAILABLE',
          serialNumber: data.serialNumber || '',
          brand: data.brand || '',
          model: data.model || '',
          purchaseDate: data.purchaseDate ? data.purchaseDate.split('T')[0] : '',
          purchasePrice: data.purchasePrice?.toString() || '',
          warrantyExpiry: data.warrantyExpiry ? data.warrantyExpiry.split('T')[0] : '',
          location: data.location || '',
          assignedTo: data.assignedTo || '',
          notes: data.notes || '',
        })
        setFetching(false)
      })
  }, [id])

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch(`/api/assets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      router.push(`/assets/${id}`)
    } else {
      alert('Failed to update. Please try again.')
      setLoading(false)
    }
  }

  if (fetching) return <div className="p-8 text-gray-500">Loading...</div>

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <Link href={`/assets/${id}`} className="text-sm text-gray-500 hover:text-gray-700">← Back to Asset</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Edit Asset</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-800">Basic Information</h2>
          <div>
            <label className="label">Asset Name *</label>
            <input className="input" required value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={e => set('type', e.target.value)}>
                {ASSET_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                {ASSET_STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Brand</label>
              <input className="input" value={form.brand} onChange={e => set('brand', e.target.value)} />
            </div>
            <div>
              <label className="label">Model</label>
              <input className="input" value={form.model} onChange={e => set('model', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Serial Number</label>
            <input className="input" value={form.serialNumber} onChange={e => set('serialNumber', e.target.value)} />
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-800">Purchase Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Purchase Date</label>
              <input type="date" className="input" value={form.purchaseDate} onChange={e => set('purchaseDate', e.target.value)} />
            </div>
            <div>
              <label className="label">Purchase Price (₹)</label>
              <input type="number" className="input" value={form.purchasePrice} onChange={e => set('purchasePrice', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Warranty Expiry</label>
            <input type="date" className="input" value={form.warrantyExpiry} onChange={e => set('warrantyExpiry', e.target.value)} />
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-800">Assignment</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Location</label>
              <input className="input" value={form.location} onChange={e => set('location', e.target.value)} />
            </div>
            <div>
              <label className="label">Assigned To</label>
              <input className="input" value={form.assignedTo} onChange={e => set('assignedTo', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <Link href={`/assets/${id}`} className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
