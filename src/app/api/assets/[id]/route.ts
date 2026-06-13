import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const asset = await prisma.asset.findUnique({ where: { id: params.id } })
  if (!asset) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(asset)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const asset = await prisma.asset.update({
    where: { id: params.id },
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
    },
  })

  return NextResponse.json(asset)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.asset.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
