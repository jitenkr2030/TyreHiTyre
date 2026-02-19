'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { TrendingUp, Package, AlertTriangle, DollarSign, BarChart3, Users, ShoppingCart, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Navigation } from '@/components/navigation'

interface DashboardData {
  salesToday: number
  salesThisMonth: number
  totalStock: number
  totalStockValue: number
  lowStockAlert: number
  lowStockTyres: Array<{
    id: string
    brand: string
    model: string
    size: string
    stock: number
  }>
  totalProfit: number
  profitMargin: number
  sales7Days: Array<{
    date: string
    sales: number
    orders: number
  }>
  topSellingTyres: Array<{
    id: string
    brand: string
    model: string
    size: string
    sellingPrice: number
    totalSold: number
    totalRevenue: number
  }>
  recentOrders: Array<{
    id: string
    orderNumber: string
    totalAmount: number
    grandTotal: number
    status: string
    createdAt: string
    customer: {
      id: string
      name: string
      phone: string
    }
    orderItems: Array<{
      tyre: {
        brand: string
        model: string
        size: string
      }
    }>
  }>
  orderStatusCounts: Record<string, number>
  dailyAverage: number
  bestPerformingBrand: string
  bestBrandSales: number
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const [dashboard, setDashboard] = useState<DashboardData>({
    salesToday: 0,
    salesThisMonth: 0,
    totalStock: 0,
    totalStockValue: 0,
    lowStockAlert: 0,
    lowStockTyres: [],
    totalProfit: 0,
    profitMargin: 0,
    sales7Days: [],
    topSellingTyres: [],
    recentOrders: [],
    orderStatusCounts: {},
    dailyAverage: 0,
    bestPerformingBrand: 'N/A',
    bestBrandSales: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if (data && typeof data === 'object') {
        setDashboard({
          salesToday: data.salesToday || 0,
          salesThisMonth: data.salesThisMonth || 0,
          totalStock: data.totalStock || 0,
          totalStockValue: data.totalStockValue || 0,
          lowStockAlert: data.lowStockAlert || 0,
          lowStockTyres: data.lowStockTyres || [],
          totalProfit: data.totalProfit || 0,
          profitMargin: data.profitMargin || 0,
          sales7Days: data.sales7Days || [],
          topSellingTyres: data.topSellingTyres || [],
          recentOrders: data.recentOrders || [],
          orderStatusCounts: data.orderStatusCounts || {},
          dailyAverage: data.dailyAverage || 0,
          bestPerformingBrand: data.bestPerformingBrand || 'N/A',
          bestBrandSales: data.bestBrandSales || 0
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'staff')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
            <a href="/auth/signin" className="text-blue-600 hover:text-blue-800">
              Go to Sign In
            </a>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your tyre business</p>
        </div>
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales Today</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(dashboard.salesToday || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Today's revenue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales This Month</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(dashboard.salesThisMonth || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Monthly revenue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(dashboard.totalStock || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Units worth {formatCurrency(dashboard.totalStockValue || 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {dashboard.lowStockAlert || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Items need restocking
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sales Chart and Business Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                Last 7 Days Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard.sales7Days.map((day, index) => {
                  const maxSales = Math.max(...dashboard.sales7Days.map(d => d.sales))
                  const percentage = maxSales > 0 ? (day.sales / maxSales) * 100 : 0
                  
                  return (
                    <div key={day.date} className="flex items-center space-x-4">
                      <div className="w-16 text-sm text-gray-600">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                            <div 
                              className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                              {formatCurrency(day.sales)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 w-12 text-right">
                            {day.orders} orders
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                Business Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Daily Average</p>
                      <p className="text-sm text-gray-600">This month</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatCurrency(dashboard.dailyAverage)}</p>
                    <p className="text-xs text-gray-500">Per day</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Profit Margin</p>
                      <p className="text-sm text-gray-600">Overall</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-green-600">
                      {dashboard.profitMargin.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">Average margin</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Best Brand</p>
                      <p className="text-sm text-gray-600">Top performer</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{dashboard.bestPerformingBrand}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(dashboard.bestBrandSales)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                      <DollarSign className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">Total Profit</p>
                      <p className="text-sm text-gray-600">All time</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-orange-600">
                      {formatCurrency(dashboard.totalProfit)}
                    </p>
                    <p className="text-xs text-gray-500">Net profit</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Selling Tyres and Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                Top Selling Tyres
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard.topSellingTyres.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No sales data available</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {dashboard.topSellingTyres.map((tyre, index) => (
                    <div key={tyre.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-bold text-green-600">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{tyre.brand} {tyre.model}</p>
                          <p className="text-sm text-gray-600">{tyre.size}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{tyre.totalSold} units</p>
                        <p className="text-sm text-gray-500">{formatCurrency(tyre.totalRevenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2 text-blue-500" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard.recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No orders found</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {dashboard.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{order.orderNumber}</p>
                          <Badge 
                            variant={order.status === 'completed' ? 'default' : 
                                   order.status === 'pending' ? 'secondary' : 'outline'}
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{order.customer.name}</p>
                        <p className="text-xs text-gray-500">
                          {order.orderItems.length} items • {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(order.grandTotal)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a 
                href="/"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-center"
              >
                <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <p className="font-medium">New Sale</p>
                <p className="text-sm text-gray-500">Create order</p>
              </a>
              <a 
                href="/purchase"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-center"
              >
                <FileText className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <p className="font-medium">New Purchase</p>
                <p className="text-sm text-gray-500">Add stock</p>
              </a>
              <a 
                href="/inventory"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-center"
              >
                <Package className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <p className="font-medium">Manage Stock</p>
                <p className="text-sm text-gray-500">View inventory</p>
              </a>
              <a 
                href="/orders"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-center"
              >
                <Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <p className="font-medium">View Orders</p>
                <p className="text-sm text-gray-500">Order history</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}