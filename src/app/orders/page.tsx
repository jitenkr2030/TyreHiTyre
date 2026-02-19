'use client'

import { useState, useEffect } from 'react'
import { Search, Package, Calendar, Phone, MapPin, CreditCard, Download, Filter, X, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface OrderItem {
  id: string
  tyreId: string
  quantity: number
  price: number
  total: number
  tyre: {
    brand: string
    model: string
    size: string
  }
}

interface Order {
  id: string
  orderNumber: string
  customer: {
    name: string
    phone: string
    email?: string
    address: string
  }
  orderItems: OrderItem[]
  totalAmount: number
  gstAmount: number
  grandTotal: number
  paymentMethod: string
  status: string
  createdAt: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, searchTerm, statusFilter])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      const data = await response.json()
      setOrders(data)
      setFilteredOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = orders

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.phone.includes(searchTerm)
      )
    }

    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    setFilteredOrders(filtered)
  }

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders)
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId)
    } else {
      newExpanded.add(orderId)
    }
    setExpandedOrders(newExpanded)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-purple-100 text-purple-800'
      case 'shipped': return 'bg-indigo-100 text-indigo-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cod': return 'Cash on Delivery'
      case 'upi': return 'UPI Payment'
      case 'card': return 'Card Payment'
      default: return method
    }
  }

  const downloadInvoice = (order: Order) => {
    const invoiceContent = `
ORDER INVOICE
================
Order ID: ${order.orderNumber}
Date: ${new Date(order.createdAt).toLocaleDateString()}
Status: ${order.status.toUpperCase()}

CUSTOMER DETAILS
================
Name: ${order.customer.name}
Phone: ${order.customer.phone}
${order.customer.email ? `Email: ${order.customer.email}` : ''}
Address: ${order.customer.address}

ORDER ITEMS
===========
${order.orderItems.map(item => 
  `${item.tyre.brand} ${item.tyre.model} (${item.tyre.size}) - ${item.quantity} × ₹${item.price} = ₹${item.total}`
).join('\n')}

PAYMENT SUMMARY
===============
Subtotal: ₹${order.totalAmount}
GST (18%): ₹${order.gstAmount}
Grand Total: ₹${order.grandTotal}
Payment Method: ${getPaymentMethodLabel(order.paymentMethod)}

Thank you for your business!
    `.trim()

    const blob = new Blob([invoiceContent], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${order.orderNumber}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <a href="/" className="text-blue-600 hover:text-blue-700 transition-colors">
                ← Back to Shop
              </a>
              <h1 className="text-xl md:text-2xl font-bold">My Orders</h1>
            </div>
            <div className="flex items-center space-x-2">
              <a href="/purchase" className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                Purchase
              </a>
              <a href="/admin" className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                Admin
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by order ID, name, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg mb-2">
              {searchTerm || statusFilter ? 'No orders found matching your criteria' : 'No orders yet'}
            </p>
            <p className="text-gray-400 text-sm mb-4">
              {searchTerm || statusFilter ? 'Try adjusting your filters' : 'Start shopping to see your orders here'}
            </p>
            {!searchTerm && !statusFilter && (
              <a href="/" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Start Shopping
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-green-600">₹{order.grandTotal}</p>
                      <p className="text-sm text-gray-500">{getPaymentMethodLabel(order.paymentMethod)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Package className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">{order.orderItems.length} items</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{order.customer.name} • {order.customer.phone}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                        <span className="line-clamp-2">{order.customer.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleOrderExpansion(order.id)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {expandedOrders.has(order.id) ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-1" />
                          Hide Items
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-1" />
                          View Items
                        </>
                      )}
                    </Button>
                    
                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Order Details - {order.orderNumber}</DialogTitle>
                          </DialogHeader>
                          {selectedOrder && (
                            <div className="space-y-6">
                              <div>
                                <h4 className="font-medium mb-3">Customer Information</h4>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                  <p><strong>Name:</strong> {selectedOrder.customer.name}</p>
                                  <p><strong>Phone:</strong> {selectedOrder.customer.phone}</p>
                                  {selectedOrder.customer.email && <p><strong>Email:</strong> {selectedOrder.customer.email}</p>}
                                  <p><strong>Address:</strong> {selectedOrder.customer.address}</p>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-3">Order Items</h4>
                                <div className="space-y-3">
                                  {selectedOrder.orderItems.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                      <div>
                                        <p className="font-medium">{item.tyre.brand} {item.tyre.model}</p>
                                        <p className="text-sm text-gray-600">{item.tyre.size}</p>
                                        <p className="text-sm">Quantity: {item.quantity} × ₹{item.price}</p>
                                      </div>
                                      <span className="font-medium">₹{item.total}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-3">Payment Summary</h4>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                  <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>₹{selectedOrder.totalAmount}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>GST (18%):</span>
                                    <span>₹{selectedOrder.gstAmount}</span>
                                  </div>
                                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                                    <span>Total:</span>
                                    <span>₹{selectedOrder.grandTotal}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>Payment Method:</span>
                                    <span>{getPaymentMethodLabel(selectedOrder.paymentMethod)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadInvoice(order)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Invoice
                      </Button>
                    </div>
                  </div>

                  {expandedOrders.has(order.id) && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="space-y-2">
                        {order.orderItems.map((item) => (
                          <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div>
                              <p className="font-medium text-sm">{item.tyre.brand} {item.tyre.model}</p>
                              <p className="text-xs text-gray-600">{item.tyre.size}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm">{item.quantity} × ₹{item.price}</p>
                              <p className="font-medium">₹{item.total}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}