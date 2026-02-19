import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Test basic database connection
    await db.$queryRaw`SELECT 1`
    
    // Get database info
    const result = await db.$queryRaw`
      SELECT 
        version() as postgresql_version,
        current_database() as database_name,
        current_user as current_user,
        inet_server_addr() as server_ip
    `
    
    // Test tyre table
    const tyreCount = await db.tyre.count()
    
    // Type assertion for the database result
    const dbInfo = result as any[]
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      postgresql_info: dbInfo[0],
      tyre_count: tyreCount,
      timestamp: new Date().toISOString(),
      message: tyreCount > 0 ? 'Database is ready with data' : 'Database is connected but empty'
    })
  } catch (error) {
    console.error('Database health check error:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      help: 'Please check DATABASE_URL environment variable'
    }, { status: 500 })
  }
}