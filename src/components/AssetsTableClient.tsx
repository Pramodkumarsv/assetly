"use client"
import Link from 'next/link'
import React, { useEffect, useMemo, useState } from 'react'

type Asset = {
  id: string
  name: string
  type?: string | null
  brand?: string | null
  model?: string | null
  serialNumber?: string | null
  status?: string | null
  assignedTo?: string | null
}

export default function AssetsTableClient({ assets }: { assets: Asset[] }) {
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [list, setList] = useState<Asset[]>(assets)
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [searchInitialized, setSearchInitialized] = useState(false)

  useEffect(() => {
    if (searchInitialized) return
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const pq = params.get('q') || ''
    if (pq) setQ(pq)
    setSearchInitialized(true)
  }, [searchInitialized])

  const statusOptions = useMemo(() => {
    return Array.from(new Set(list.map(a => a.status || 'UNKNOWN')))
  }, [list])

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase()
    return list.filter(a => {
      if (statusFilter && (a.status || '') !== statusFilter) return false
      if (!qq) return true
      return [a.name, a.type, a.brand, a.model, a.serialNumber, a.assignedTo]
        .filter(Boolean)
        .some(v => v!.toLowerCase().includes(qq))
    })
  }, [list, q, statusFilter])

  function exportCSV() {
    const headers = ['Name', 'Type', 'Brand', 'Model', 'Serial', 'Status', 'AssignedTo']
    const rows = filtered.map(a => [a.name, a.type || '', a.brand || '', a.model || '', a.serialNumber || '', a.status || '', a.assignedTo || ''])
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'assets-export.csv'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  function toggleSelectAll(checked: boolean) {
    const newSel: Record<string, boolean> = {}
    filtered.forEach(a => {
      newSel[a.id] = checked
    })
    setSelected(prev => ({ ...prev, ...newSel }))
  }

  function toggleSelect(id: string) {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }))
  }

  async function bulkRetire() {
    const ids = Object.keys(selected).filter(k => selected[k])
    if (ids.length === 0) return
    if (!confirm(`Retire ${ids.length} selected assets?`)) return
    setLoading(true)
    try {
      const res = await fetch('/api/assets/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, action: 'retire' }),
      })
      if (!res.ok) throw new Error('Bulk action failed')
      const updated: Asset[] = await res.json()
      setList(prev => prev.map(a => updated.find(x => x.id === a.id) || a))
      setSelected({})
    } catch (e) {
      alert('Bulk retire failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search assets, serial, type, owner..."
            className="input w-full sm:w-96"
          />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="select w-full sm:w-52">
            <option value="">All statuses</option>
            {statusOptions.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button onClick={exportCSV} className="btn btn-secondary">Export CSV</button>
          <button onClick={bulkRetire} disabled={loading} className="btn btn-primary">
            {loading ? 'Working…' : 'Retire selected'}
          </button>
          <span className="text-sm text-slate-400">{filtered.length} assets</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-xl">
        <table className="min-w-full text-sm text-left text-slate-200">
          <thead className="bg-slate-900/95 text-slate-400 uppercase text-xs tracking-[0.18em]">
            <tr>
              <th className="px-4 py-3">
                <input type="checkbox" onChange={e => toggleSelectAll(e.target.checked)} className="h-4 w-4 rounded border-slate-700 text-brand-500 focus:ring-brand-500" />
              </th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Brand / Model</th>
              <th className="px-4 py-3">Asset Tag</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Assigned</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950">
            {filtered.map(a => (
              <tr key={a.id} className="hover:bg-slate-900/80 transition-colors">
                <td className="px-4 py-3 align-top">
                  <input type="checkbox" checked={!!selected[a.id]} onChange={() => toggleSelect(a.id)} className="h-4 w-4 rounded border-slate-700 text-brand-500 focus:ring-brand-500" />
                </td>
                <td className="px-4 py-3 font-semibold text-slate-100">{a.name}</td>
                <td className="px-4 py-3 text-slate-300">{a.type || '—'}</td>
                <td className="px-4 py-3 text-slate-300">{[a.brand, a.model].filter(Boolean).join(' / ') || '—'}</td>
                <td className="px-4 py-3 text-slate-200 max-w-sm break-words">{`${a.name} · ${a.type || '—'} · ${[a.brand, a.model].filter(Boolean).join(' / ') || '—'}`}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-200">
                    {a.status || '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-300">{a.assignedTo || '—'}</td>
                <td className="px-4 py-3 flex flex-wrap gap-2">
                  <Link href={`/assets/${a.id}`} className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition">
                    View
                  </Link>
                  <Link href={`/assets/${a.id}/edit`} className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-3 py-1 text-xs font-semibold text-white hover:bg-brand-700 transition">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
