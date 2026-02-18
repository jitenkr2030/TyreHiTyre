import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const purchases = await db.purchase.findMany({
      include: {
        supplier: true,
        purchaseItems: {
          include: { tyre: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(purchases);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json({ error: 'Failed to fetch purchases' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { supplierId, purchaseItems } = body;
    
    // Generate purchase number
    const purchaseNumber = 'PUR' + Date.now();
    
    // Calculate totals
    const totalAmount = purchaseItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const gstAmount = totalAmount * 0.18; // 18% GST
    const grandTotal = totalAmount + gstAmount;
    
    // Create purchase
    const purchase = await db.purchase.create({
      data: {
        purchaseNumber,
        supplierId,
        totalAmount,
        gstAmount,
        grandTotal,
        status: 'completed'
      }
    });
    
    // Create purchase items and update stock
    for (const item of purchaseItems) {
      await db.purchaseItem.create({
        data: {
          purchaseId: purchase.id,
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
            increment: item.quantity
          }
        }
      });
    }
    
    const completePurchase = await db.purchase.findUnique({
      where: { id: purchase.id },
      include: {
        supplier: true,
        purchaseItems: {
          include: { tyre: true }
        }
      }
    });
    
    return NextResponse.json(completePurchase);
  } catch (error) {
    console.error('Error creating purchase:', error);
    return NextResponse.json({ error: 'Failed to create purchase' }, { status: 500 });
  }
}