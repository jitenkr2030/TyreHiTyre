import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const tyre = await db.tyre.findUnique({
      where: {
        id
      }
    })

    if (!tyre) {
      return NextResponse.json({ error: 'Tyre not found' }, { status: 404 })
    }

    return NextResponse.json(tyre)
  } catch (error) {
    console.error('Error fetching tyre:', error)
    return NextResponse.json({ error: 'Failed to fetch tyre' }, { status: 500 })
  }
}