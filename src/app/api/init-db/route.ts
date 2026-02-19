import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    await db.$queryRaw`SELECT 1`
    
    // Sample data for initialization
    const sampleTyres = [
      {
        brand: 'MRF',
        model: 'Zapper S',
        size: '140/70 R17',
        type: 'Bike',
        tubeType: 'Tubeless',
        mrp: 2500,
        sellingPrice: 2200,
        stock: 50,
        description: 'High-performance bike tyre for city riding'
      },
      {
        brand: 'CEAT',
        model: 'Acelere',
        size: '205/55 R16',
        type: 'Car',
        tubeType: 'Tubeless',
        mrp: 6500,
        sellingPrice: 5800,
        stock: 30,
        description: 'Fuel-efficient car tyre for sedans'
      },
      {
        brand: 'Apollo',
        model: 'Amazer 3G',
        size: '185/65 R14',
        type: 'Car',
        tubeType: 'Tube',
        mrp: 4500,
        sellingPrice: 4000,
        stock: 25,
        description: 'Comfortable car tyre for hatchbacks'
      }
    ]
    
    // Check if tyres table has data
    const tyreCount = await db.tyre.count()
    
    if (tyreCount === 0) {
      // Initialize with sample data if empty
      await db.tyre.createMany({
        data: sampleTyres
      })
    }
    
    return NextResponse.json({
      status: 'Database connected and initialized',
      tyreCount: tyreCount > 0 ? tyreCount : sampleTyres.length,
      message: tyreCount > 0 ? 'Database ready' : 'Database initialized with sample data'
    })
  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json(
      { 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}