import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    console.log('Dashboard API called');
    
    // Simple test query first
    const tyreCount = await db.tyre.count();
    console.log('Tyre count:', tyreCount);
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get this month's start
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Total stock value (simplified)
    const stockData = await db.tyre.aggregate({
      _sum: {
        stock: true
      }
    });
    
    const totalStock = stockData._sum.stock || 0;
    const totalStockValue = totalStock * 3000; // Simplified calculation
    
    // Simple sales data
    const salesToday = 0;
    const salesThisMonth = 0;
    
    // Low stock alert
    const lowStockTyres = await db.tyre.findMany({
      where: {
        stock: {
          lt: 10
        }
      },
      select: {
        id: true,
        brand: true,
        model: true,
        size: true,
        stock: true
      },
      orderBy: { stock: 'asc' },
      take: 10
    });
    
    const dashboard = {
      salesToday,
      salesThisMonth,
      totalStock,
      totalStockValue,
      lowStockAlert: lowStockTyres.length,
      lowStockTyres,
      totalProfit: 0,
      profitMargin: 0,
      sales7Days: [],
      topSellingTyres: [],
      recentOrders: [],
      orderStatusCounts: {},
      dailyAverage: 0,
      bestPerformingBrand: 'N/A',
      bestBrandSales: 0
    };
    
    console.log('Dashboard data prepared:', dashboard);
    return NextResponse.json(dashboard);
  } catch (error) {
    console.error('Error in dashboard API:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch dashboard data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}