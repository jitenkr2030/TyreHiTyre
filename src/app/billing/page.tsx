'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Download, FileText, Receipt, Plus, Filter, Calendar, DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react'
import { toast } from 'sonner'

interface Bill {
  id: string
  billNumber: string
  type: 'SALES' | 'PURCHASE'
  entityId: string
  entityName: string
  totalAmount: number
  gstAmount: number
  grandTotal: number
  status: 'PAID' | 'UNPAID' | 'PARTIAL'
  createdAt: string
  items: BillItem[]
}

interface BillItem {
  id: string
  name: string
  description: string
  quantity: number
  price: number
  total: number
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  totalAmount: number
  gstAmount: number
  grandTotal: number
  status: string
  createdAt: string
  items: any[]
}

interface Purchase {
  id: string
  purchaseNumber: string
  supplierName: string
  totalAmount: number
  gstAmount: number
  grandTotal: number
  status: string
  createdAt: string
  items: any[]
}

export default function BillingPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch orders and purchases
      const [ordersRes, purchasesRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/purchases')
      ])

      let ordersData = []
      let purchasesData = []

      if (ordersRes.ok) {
        ordersData = await ordersRes.json()
        setOrders(ordersData)
      }

      if (purchasesRes.ok) {
        purchasesData = await purchasesRes.json()
        setPurchases(purchasesData)
      }

      // Generate bills from orders and purchases
      const generatedBills: Bill[] = []
      
      // Generate sales invoices from orders
      ordersData.forEach((order: any) => {
        generatedBills.push({
          id: order.id,
          billNumber: `INV-${order.orderNumber}`,
          type: 'SALES',
          entityId: order.customerId,
          entityName: order.customer?.name || 'Unknown Customer',
          totalAmount: order.totalAmount,
          gstAmount: order.gstAmount,
          grandTotal: order.grandTotal,
          status: order.status === 'delivered' ? 'PAID' : 'UNPAID',
          createdAt: order.createdAt,
          items: order.items?.map((item: any) => ({
            id: item.id,
            name: item.tyre?.brand + ' ' + item.tyre?.model,
            description: `Size: ${item.tyre?.size}`,
            quantity: item.quantity,
            price: item.price,
            total: item.total
          })) || []
        })
      })

      // Generate purchase bills from purchases
      purchasesData.forEach((purchase: any) => {
        generatedBills.push({
          id: purchase.id,
          billNumber: `BILL-${purchase.purchaseNumber}`,
          type: 'PURCHASE',
          entityId: purchase.supplierId,
          entityName: purchase.supplier?.name || 'Unknown Supplier',
          totalAmount: purchase.totalAmount,
          gstAmount: purchase.gstAmount,
          grandTotal: purchase.grandTotal,
          status: purchase.status === 'completed' ? 'PAID' : 'UNPAID',
          createdAt: purchase.createdAt,
          items: purchase.items?.map((item: any) => ({
            id: item.id,
            name: item.tyre?.brand + ' ' + item.tyre?.model,
            description: `Size: ${item.tyre?.size}`,
            quantity: item.quantity,
            price: item.price,
            total: item.total
          })) || []
        })
      })

      setBills(generatedBills)
    } catch (error) {
      console.error('Error fetching billing data:', error)
      toast.error('Failed to load billing data')
    } finally {
      setLoading(false)
    }
  }

  const generateSalesInvoice = async (order: Order) => {
    try {
      const response = await fetch('/api/invoices/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Invoice-${order.orderNumber}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Sales invoice generated successfully')
      } else {
        throw new Error('Failed to generate invoice')
      }
    } catch (error) {
      console.error('Error generating sales invoice:', error)
      toast.error('Failed to generate sales invoice')
    }
  }

  const generatePurchaseBill = async (purchase: Purchase) => {
    try {
      const response = await fetch('/api/invoices/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchaseId: purchase.id })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Bill-${purchase.purchaseNumber}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Purchase bill generated successfully')
      } else {
        throw new Error('Failed to generate bill')
      }
    } catch (error) {
      console.error('Error generating purchase bill:', error)
      toast.error('Failed to generate purchase bill')
    }
  }

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.entityName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || bill.status === statusFilter
    const matchesType = typeFilter === 'all' || bill.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'UNPAID': return 'bg-red-100 text-red-800'
      case 'PARTIAL': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID': return <CheckCircle className="h-4 w-4" />
      case 'UNPAID': return <XCircle className="h-4 w-4" />
      case 'PARTIAL': return <Clock className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Billing System</h1>
          <p className="text-gray-600">Manage invoices and bills</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bills.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Invoices</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bills.filter(b => b.type === 'SALES').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Purchase Bills</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bills.filter(b => b.type === 'PURCHASE').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unpaid Bills</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bills.filter(b => b.status === 'UNPAID').length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bills" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bills">All Bills</TabsTrigger>
          <TabsTrigger value="sales">Sales Invoices</TabsTrigger>
          <TabsTrigger value="purchase">Purchase Bills</TabsTrigger>
        </TabsList>

        <TabsContent value="bills">
          <Card>
            <CardHeader>
              <CardTitle>All Bills</CardTitle>
              <CardDescription>Manage your invoices and bills</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search bills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="SALES">Sales Invoices</SelectItem>
                    <SelectItem value="PURCHASE">Purchase Bills</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="UNPAID">Unpaid</SelectItem>
                    <SelectItem value="PARTIAL">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bills Table */}
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bill Number
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer/Supplier
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBills.map((bill) => (
                        <tr key={bill.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {bill.billNumber}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <Badge variant={bill.type === 'SALES' ? 'default' : 'secondary'}>
                              {bill.type}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {bill.entityName}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{bill.grandTotal.toFixed(2)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <Badge className={getStatusColor(bill.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(bill.status)}
                                {bill.status}
                              </div>
                            </Badge>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(bill.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedBill(bill)}
                                  >
                                    View
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>
                                      {bill.type === 'SALES' ? 'Sales Invoice' : 'Purchase Bill'} - {bill.billNumber}
                                    </DialogTitle>
                                    <DialogDescription>
                                      {bill.type === 'SALES' ? 'Invoice' : 'Bill'} details for {bill.entityName}
                                    </DialogDescription>
                                  </DialogHeader>
                                  {selectedBill && (
                                    <div className="space-y-6">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-sm font-medium text-gray-500">Bill Number</p>
                                          <p className="text-lg font-semibold">{selectedBill.billNumber}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-gray-500">Date</p>
                                          <p className="text-lg">{new Date(selectedBill.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-gray-500">
                                            {selectedBill.type === 'SALES' ? 'Customer' : 'Supplier'}
                                          </p>
                                          <p className="text-lg">{selectedBill.entityName}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-gray-500">Status</p>
                                          <Badge className={getStatusColor(selectedBill.status)}>
                                            {selectedBill.status}
                                          </Badge>
                                        </div>
                                      </div>

                                      <div>
                                        <h4 className="font-semibold mb-3">Items</h4>
                                        <div className="border rounded-lg overflow-hidden">
                                          <table className="w-full">
                                            <thead className="bg-gray-50">
                                              <tr>
                                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Item</th>
                                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Description</th>
                                                <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Qty</th>
                                                <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Price</th>
                                                <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Total</th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                              {selectedBill.items.map((item) => (
                                                <tr key={item.id}>
                                                  <td className="px-4 py-2 text-sm">{item.name}</td>
                                                  <td className="px-4 py-2 text-sm text-gray-500">{item.description}</td>
                                                  <td className="px-4 py-2 text-sm text-right">{item.quantity}</td>
                                                  <td className="px-4 py-2 text-sm text-right">₹{item.price.toFixed(2)}</td>
                                                  <td className="px-4 py-2 text-sm text-right font-medium">₹{item.total.toFixed(2)}</td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      </div>

                                      <div className="border-t pt-4">
                                        <div className="space-y-2">
                                          <div className="flex justify-between text-sm">
                                            <span>Subtotal:</span>
                                            <span>₹{selectedBill.totalAmount.toFixed(2)}</span>
                                          </div>
                                          <div className="flex justify-between text-sm">
                                            <span>GST (18%):</span>
                                            <span>₹{selectedBill.gstAmount.toFixed(2)}</span>
                                          </div>
                                          <div className="flex justify-between text-lg font-semibold">
                                            <span>Grand Total:</span>
                                            <span>₹{selectedBill.grandTotal.toFixed(2)}</span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex justify-end gap-2">
                                        <Button
                                          onClick={() => {
                                            if (selectedBill.type === 'SALES') {
                                              const order = orders.find(o => o.id === selectedBill.id)
                                              if (order) generateSalesInvoice(order)
                                            } else {
                                              const purchase = purchases.find(p => p.id === selectedBill.id)
                                              if (purchase) generatePurchaseBill(purchase)
                                            }
                                          }}
                                        >
                                          <Download className="h-4 w-4 mr-2" />
                                          Download PDF
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (bill.type === 'SALES') {
                                    const order = orders.find(o => o.id === bill.id)
                                    if (order) generateSalesInvoice(order)
                                  } else {
                                    const purchase = purchases.find(p => p.id === bill.id)
                                    if (purchase) generatePurchaseBill(purchase)
                                  }
                                }}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredBills.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-semibold text-gray-900">No bills found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                          ? 'Try adjusting your search or filters'
                          : 'No bills have been generated yet'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Sales Invoices</CardTitle>
              <CardDescription>Generate and manage sales invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Order #{order.orderNumber}</h4>
                        <p className="text-sm text-gray-500">Customer: {order.customerName}</p>
                        <p className="text-sm text-gray-500">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{order.grandTotal.toFixed(2)}</p>
                        <Badge className={getStatusColor(order.status === 'delivered' ? 'PAID' : 'UNPAID')}>
                          {order.status === 'delivered' ? 'Paid' : 'Unpaid'}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button onClick={() => generateSalesInvoice(order)}>
                        <Download className="h-4 w-4 mr-2" />
                        Generate Invoice
                      </Button>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <div className="text-center py-12">
                    <Receipt className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No orders found</h3>
                    <p className="mt-1 text-sm text-gray-500">No orders to generate invoices from</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchase">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Bills</CardTitle>
              <CardDescription>Generate and manage purchase bills</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {purchases.map((purchase) => (
                  <div key={purchase.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Purchase #{purchase.purchaseNumber}</h4>
                        <p className="text-sm text-gray-500">Supplier: {purchase.supplierName}</p>
                        <p className="text-sm text-gray-500">Date: {new Date(purchase.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{purchase.grandTotal.toFixed(2)}</p>
                        <Badge className={getStatusColor(purchase.status === 'completed' ? 'PAID' : 'UNPAID')}>
                          {purchase.status === 'completed' ? 'Paid' : 'Unpaid'}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button onClick={() => generatePurchaseBill(purchase)}>
                        <Download className="h-4 w-4 mr-2" />
                        Generate Bill
                      </Button>
                    </div>
                  </div>
                ))}
                {purchases.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No purchases found</h3>
                    <p className="mt-1 text-sm text-gray-500">No purchases to generate bills from</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}