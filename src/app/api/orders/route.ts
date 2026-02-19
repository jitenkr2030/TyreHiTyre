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
      return NextResponse.json(customer?.orders || []);
    }
    
    const orders = await db.order.findMany({
      include: {
        customer: true,
        orderItems: {
          include: { tyre: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer, orderItems, paymentMethod } = body;
    
    // Generate order number
    const orderNumber = 'ORD' + Date.now();
    
    // Calculate totals
    const totalAmount = orderItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const gstAmount = totalAmount * 0.18; // 18% GST
    const grandTotal = totalAmount + gstAmount;
    
    // Create or find customer
    let customerRecord = await db.customer.findFirst({
      where: { phone: customer.phone }
    });
    
    if (!customerRecord) {
      customerRecord = await db.customer.create({
        data: customer
      });
    }
    
    // Create order
    const order = await db.order.create({
      data: {
        orderNumber,
        customerId: customerRecord.id,
        totalAmount,
        gstAmount,
        grandTotal,
        paymentMethod,
        status: 'confirmed'
      }
    });
    
    // Create order items and update stock
    for (const item of orderItems) {
      await db.orderItem.create({
        data: {
          orderId: order.id,
          tyreId: item.tyreId,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity
        }
      });
      
      // Update stock
      await db.tyre.update({
        where: { id: item.tyreId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });
    }
    
    const completeOrder = await db.order.findUnique({
      where: { id: order.id },
      include: {
        customer: true,
        orderItems: {
          include: { tyre: true }
        }
      }
    });
    
    return NextResponse.json(completeOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}