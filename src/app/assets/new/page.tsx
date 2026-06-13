'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { uploadFile } from '@/lib/supabase'
import Link from 'next/link'

const MAIN_ASSET_TYPES = ['LAPTOP', 'DESKTOP', 'PHONE', 'TABLET']
const ACCESSORY_TYPES = ['MONITOR', 'KEYBOARD', 'MOUSE', 'PRINTER', 'SERVER', 'NETWORKING', 'SOFTWARE', 'OTHER']
const ASSET_TYPES = [...MAIN_ASSET_TYPES, ...ACCESSORY_TYPES]
const ASSET_STATUSES = ['AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'RETIRED', 'LOST']

export default function NewAssetPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    name: '', type: 'LAPTOP', status: 'AVAILABLE',
    serialNumber: '', brand: '', model: '',
    purchaseDate: '', purchasePrice: '',
    warrantyExpiry: '', location: '',
    assignedTo: '', notes: '',
  })

  const isAccessory = !MAIN_ASSET_TYPES.includes(form.type)

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let imageUrl = null
      if (imageFile) {
        imageUrl = await uploadFile(imageFile, 'images')
      }

      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, imageUrl, isAccessory }),
      })

      const data = await res.json()

      if (res.ok) {
        router.push(isAccessory ? '/accessories' : '/assets')
      } else {
        setError(data.error || 'Failed to create asset. Please try again.')
        setLoading(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <Link href={isAccessory ? '/accessories' : '/assets'} className="text-sm text-gray-500 hover:text-gray-700">← Back</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Add New {isAccessory ? 'Accessory' : 'Asset'}</h1>
        {isAccessory && <p className="text-sm text-slate-600 mt-1">Selected type will be added to Accessories</p>}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-800">Basic Information</h2>
          <div>
            <label className="label">Asset Name *</label>
            <input className="input" placeholder="e.g. MacBook Pro 14" required value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Type *</label>
              <select className="input" value={form.type} onChange={e => set('type', e.target.value)}>
                <optgroup label="Assets">
                  {MAIN_ASSET_TYPES.map(t => <option key={t}>{t}</option>)}
                </optgroup>
                <optgroup label="Accessories">
                  {ACCESSORY_TYPES.map(t => <option key={t}>{t}</option>)}
                </optgroup>
              </select>
            </div>
            <div>
              <label className="label">Status *</label>
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                {ASSET_STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Brand</label>
              <input className="input" placeholder="Apple, Dell, HP..." value={form.brand} onChange={e => set('brand', e.target.value)} />
            </div>
            <div>
              <label className="label">Model</label>
              <input className="input" placeholder="MacBook Pro M3" value={form.model} onChange={e => set('model', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Serial Number</label>
            <input className="input" placeholder="SN-XXXXXXXXXX" value={form.serialNumber} onChange={e => set('serialNumber', e.target.value)} />
          </div>
        </div>

        {/* Purchase Details */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-800">Purchase Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Purchase Date</label>
              <input type="date" className="input" value={form.purchaseDate} onChange={e => set('purchaseDate', e.target.value)} />
            </div>
            <div>
              <label className="label">Purchase Price (₹)</label>
              <input type="number" className="input" placeholder="85000" value={form.purchasePrice} onChange={e => set('purchasePrice', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Warranty Expiry</label>
            <input type="date" className="input" value={form.warrantyExpiry} onChange={e => set('warrantyExpiry', e.target.value)} />
          </div>
        </div>

        {/* Assignment */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-800">Assignment</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Location</label>
              <input className="input" placeholder="Office / Remote / Warehouse" value={form.location} onChange={e => set('location', e.target.value)} />
            </div>
            <div>
              <label className="label">Assigned To</label>
              <input className="input" placeholder="Employee name or ID" value={form.assignedTo} onChange={e => set('assignedTo', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input" rows={3} placeholder="Any additional notes..." value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
        </div>

        {/* Image Upload */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-800">Image</h2>
          <div>
            <label className="label">Upload Asset Image</label>
            <input
              type="file"
              accept="image/*"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
              onChange={e => setImageFile(e.target.files?.[0] || null)}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
          <Link href={isAccessory ? '/accessories' : '/assets'} className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
