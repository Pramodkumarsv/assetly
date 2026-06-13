import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const ids: string[] = body.ids || []
  const action: string = body.action || ''

  if (!ids.length) return NextResponse.json({ error: 'No ids' }, { status: 400 })

  if (action === 'retire') {
    const updated = await prisma.asset.updateMany({
      where: { id: { in: ids } },
      data: { status: 'RETIRED' },
    })
    // return the updated records
    const records = await prisma.asset.findMany({ where: { id: { in: ids } } })
    return NextResponse.json(records)
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
