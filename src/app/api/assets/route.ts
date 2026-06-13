import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const assets = await prisma.asset.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(assets)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const userId = (session.user as any).id

  const asset = await prisma.asset.create({
    data: {
      name: body.name,
      type: body.type,
      status: body.status,
      serialNumber: body.serialNumber || null,
      brand: body.brand || null,
      model: body.model || null,
      purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
      purchasePrice: body.purchasePrice ? parseFloat(body.purchasePrice) : null,
      warrantyExpiry: body.warrantyExpiry ? new Date(body.warrantyExpiry) : null,
      location: body.location || null,
      assignedTo: body.assignedTo || null,
      notes: body.notes || null,
      imageUrl: body.imageUrl || null,
      userId,
    },
  })

  return NextResponse.json(asset, { status: 201 })
}
