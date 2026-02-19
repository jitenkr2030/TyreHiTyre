import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Test database connection first
    await db.$queryRaw`SELECT 1`
    
    // Check if tables exist by trying to count tyres
    let tyreCount = 0
    try {
      tyreCount = await db.tyre.count()
    } catch (error) {
      // Table doesn't exist, we need to create schema
      console.log('Tables do not exist, creating schema...')
    }
    
    // If no tyres, try to create schema and add sample data
    if (tyreCount === 0) {
      try {
        // Create schema (this will create all tables)
        await db.$executeRaw`
          CREATE TABLE IF NOT EXISTS "User" (
            "id" TEXT NOT NULL,
            "name" TEXT,
            "email" TEXT NOT NULL,
            "emailVerified" TIMESTAMP(3),
            "image" TEXT,
            "password" TEXT,
            "role" TEXT NOT NULL DEFAULT 'customer',
            "phone" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            
            CONSTRAINT "User_pkey" PRIMARY KEY ("id")
          );
        `
        
        await db.$executeRaw`
          CREATE TABLE IF NOT EXISTS "Account" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "type" TEXT NOT NULL,
            "provider" TEXT NOT NULL,
            "providerAccountId" TEXT NOT NULL,
            "refresh_token" TEXT,
            "access_token" TEXT,
            "expires_at" INTEGER,
            "token_type" TEXT,
            "scope" TEXT,
            "id_token" TEXT,
            "session_state" TEXT,
            
            CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
          );
        `
        
        await db.$executeRaw`
          CREATE TABLE IF NOT EXISTS "Session" (
            "id" TEXT NOT NULL,
            "sessionToken" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "expires" TIMESTAMP(3) NOT NULL,
            
            CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
          );
        `
        
        await db.$executeRaw`
          CREATE TABLE IF NOT EXISTS "VerificationToken" (
            "identifier" TEXT NOT NULL,
            "token" TEXT NOT NULL,
            "expires" TIMESTAMP(3) NOT NULL,
            
            CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier", "token")
          );
        `
        
        await db.$executeRaw`
          CREATE TABLE IF NOT EXISTS "Customer" (
            "id" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "phone" TEXT NOT NULL,
            "email" TEXT,
            "address" TEXT,
            "userId" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            
            CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
          );
        `
        
        await db.$executeRaw`
          CREATE TABLE IF NOT EXISTS "Tyre" (
            "id" TEXT NOT NULL,
            "brand" TEXT NOT NULL,
            "model" TEXT NOT NULL,
            "size" TEXT NOT NULL,
            "type" TEXT NOT NULL,
            "tubeType" TEXT NOT NULL,
            "mrp" FLOAT NOT NULL,
            "sellingPrice" FLOAT NOT NULL,
            "stock" INTEGER NOT NULL DEFAULT 0,
            "description" TEXT,
            "image" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            
            CONSTRAINT "Tyre_pkey" PRIMARY KEY ("id")
          );
        `
        
        await db.$executeRaw`
          CREATE TABLE IF NOT EXISTS "Supplier" (
            "id" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "phone" TEXT NOT NULL,
            "email" TEXT,
            "address" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            
            CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
          );
        `
        
        await db.$executeRaw`
          CREATE TABLE IF NOT EXISTS "Order" (
            "id" TEXT NOT NULL,
            "orderNumber" TEXT NOT NULL,
            "customerId" TEXT NOT NULL,
            "totalAmount" FLOAT NOT NULL,
            "gstAmount" FLOAT NOT NULL,
            "grandTotal" FLOAT NOT NULL,
            "paymentMethod" TEXT NOT NULL,
            "status" TEXT NOT NULL DEFAULT 'pending',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            
            CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
          );
        `
        
        await db.$executeRaw`
          CREATE TABLE IF NOT EXISTS "Purchase" (
            "id" TEXT NOT NULL,
            "purchaseNumber" TEXT NOT NULL,
            "supplierId" TEXT NOT NULL,
            "totalAmount" FLOAT NOT NULL,
            "gstAmount" FLOAT NOT NULL,
            "grandTotal" FLOAT NOT NULL,
            "status" TEXT NOT NULL DEFAULT 'completed',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            
            CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
          );
        `
        
        await db.$executeRaw`
          CREATE TABLE IF NOT EXISTS "OrderItem" (
            "id" TEXT NOT NULL,
            "orderId" TEXT NOT NULL,
            "tyreId" TEXT NOT NULL,
            "quantity" INTEGER NOT NULL,
            "price" FLOAT NOT NULL,
            "total" FLOAT NOT NULL,
            
            CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
          );
        `
        
        await db.$executeRaw`
          CREATE TABLE IF NOT EXISTS "PurchaseItem" (
            "id" TEXT NOT NULL,
            "purchaseId" TEXT NOT NULL,
            "tyreId" TEXT NOT NULL,
            "quantity" INTEGER NOT NULL,
            "price" FLOAT NOT NULL,
            "total" FLOAT NOT NULL,
            
            CONSTRAINT "PurchaseItem_pkey" PRIMARY KEY ("id")
          );
        `
        
        // Add sample data
        const sampleTyres = [
          {
            id: '1',
            brand: 'MRF',
            model: 'Zapper S',
            size: '140/70 R17',
            type: 'Bike',
            tubeType: 'Tubeless',
            mrp: 2500,
            sellingPrice: 2200,
            stock: 50,
            description: 'High-performance bike tyre for city riding',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: '2',
            brand: 'CEAT',
            model: 'Acelere',
            size: '205/55 R16',
            type: 'Car',
            tubeType: 'Tubeless',
            mrp: 6500,
            sellingPrice: 5800,
            stock: 30,
            description: 'Fuel-efficient car tyre for sedans',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: '3',
            brand: 'Apollo',
            model: 'Amazer 3G',
            size: '185/65 R14',
            type: 'Car',
            tubeType: 'Tube',
            mrp: 4500,
            sellingPrice: 4000,
            stock: 25,
            description: 'Comfortable car tyre for hatchbacks',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
        
        // Insert sample tyres
        for (const tyre of sampleTyres) {
          await db.tyre.create({
            data: tyre
          })
        }
        
        tyreCount = sampleTyres.length
        
        return NextResponse.json({
          status: 'success',
          message: 'Database schema created and initialized with sample data',
          tablesCreated: true,
          tyreCount,
          sampleData: sampleTyres.map(t => ({
            brand: t.brand,
            model: t.model,
            size: t.size,
            price: `₹${t.sellingPrice}`
          }))
        })
        
      } catch (schemaError) {
        console.error('Schema creation error:', schemaError)
        return NextResponse.json({
          status: 'error',
          message: 'Failed to create database schema',
          error: schemaError instanceof Error ? schemaError.message : 'Unknown error'
        }, { status: 500 })
      }
    }
    
    return NextResponse.json({
      status: 'success',
      message: tyreCount > 0 ? 'Database ready with data' : 'Database connected but empty',
      tyreCount,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}