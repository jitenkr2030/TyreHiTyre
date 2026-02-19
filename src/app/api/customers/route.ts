import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    
    if (phone) {
      const customer = await db.customer.findFirst({
        where: { phone },
        include: {
          orders: {
            include: {
              orderItems: {
                include: { tyre: true }
              }
            }
          }
        }
      });
      return NextResponse.json(customer);
    }
    
    const customers = await db.customer.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const customer = await db.customer.create({
      data: body
    });
    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}