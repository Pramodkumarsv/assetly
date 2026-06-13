'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this asset? This cannot be undone.')) return
    setLoading(true)
    await fetch(`/api/assets/${id}`, { method: 'DELETE' })
    router.push('/assets')
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="bg-red-50 hover:bg-red-100 text-red-700 font-medium px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50"
    >
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  )
}
