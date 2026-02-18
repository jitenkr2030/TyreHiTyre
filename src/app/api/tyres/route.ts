import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const brand = searchParams.get('brand');
    const type = searchParams.get('type');
    const tubeType = searchParams.get('tubeType');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    const where: any = {};

    if (search) {
      where.OR = [
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { size: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (brand) {
      where.brand = { contains: brand, mode: 'insensitive' };
    }

    if (type) {
      where.type = type;
    }

    if (tubeType) {
      where.tubeType = tubeType;
    }

    if (minPrice || maxPrice) {
      where.sellingPrice = {};
      if (minPrice) where.sellingPrice.gte = parseFloat(minPrice);
      if (maxPrice) where.sellingPrice.lte = parseFloat(maxPrice);
    }

    const tyres = await db.tyre.findMany({
      where,
      orderBy: { brand: 'asc' }
    });

    return NextResponse.json(tyres);
  } catch (error) {
    console.error('Error fetching tyres:', error);
    return NextResponse.json({ error: 'Failed to fetch tyres' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tyre = await db.tyre.create({
      data: body
    });
    return NextResponse.json(tyre);
  } catch (error) {
    console.error('Error creating tyre:', error);
    return NextResponse.json({ error: 'Failed to create tyre' }, { status: 500 });
  }
}