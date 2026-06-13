"use client"
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'

export default function Topbar() {
  const router = useRouter()
  const { data: session } = useSession()
  const [q, setQ] = useState('')

  function submit(e?: React.FormEvent) {
    if (e) e.preventDefault()
    const qs = q.trim()
    if (!qs) return router.push('/assets')
    router.push(`/assets?q=${encodeURIComponent(qs)}`)
  }

  return (
    <header className="w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur-lg shadow-sm sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col lg:flex-row items-center gap-4 justify-between">
        <form onSubmit={submit} className="flex items-center gap-2 flex-1 min-w-0">
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search assets, serial, owner..."
            className="input w-full bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>

        <div className="flex items-center gap-3">
          <button className="btn btn-secondary">Notifications</button>
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 border border-slate-700">
            <div className="h-9 w-9 rounded-full bg-brand-600 flex items-center justify-center text-sm font-semibold uppercase text-white">
              {session?.user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:block text-sm text-slate-200 leading-none">
              <p className="font-medium">{session?.user?.name || 'User'}</p>
              <p className="text-xs text-slate-500">{session?.user?.email}</p>
            </div>
          </div>
          <button onClick={() => signOut({ callbackUrl: '/login' })} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
