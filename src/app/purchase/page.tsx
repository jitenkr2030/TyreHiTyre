'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Package, IndianRupee, Phone, Mail, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Supplier {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
}

interface Tyre {
  id: string
  brand: string
  model: string
  size: string
  type: string
  tubeType: string
  mrp: number
  sellingPrice: number
  stock: number
}

interface PurchaseItem {
  tyreId: string
  quantity: number
  price: number
}

export default function PurchasePage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [tyres, setTyres] = useState<Tyre[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([])
  const [showAddSupplier, setShowAddSupplier] = useState(false)
  const [showAddPurchase, setShowAddPurchase] = useState(false)
  const [newSupplier, setNewSupplier] = useState({ name: '', phone: '', email: '', address: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSuppliers()
    fetchTyres()
  }, [])

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers')
      const data = await response.json()
      setSuppliers(data)
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    }
  }

  const fetchTyres = async () => {
    try {
      const response = await fetch('/api/tyres')
      const data = await response.json()
      setTyres(data)
    } catch (error) {
      console.error('Error fetching tyres:', error)
    } finally {
      setLoading(false)
    }
  }

  const addSupplier = async () => {
    try {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSupplier)
      })

      if (response.ok) {
        await fetchSuppliers()
        setNewSupplier({ name: '', phone: '', email: '', address: '' })
        setShowAddSupplier(false)
      }
    } catch (error) {
      console.error('Error adding supplier:', error)
    }
  }

  const addPurchaseItem = () => {
    setPurchaseItems([...purchaseItems, { tyreId: '', quantity: 1, price: 0 }])
  }

  const updatePurchaseItem = (index: number, field: keyof PurchaseItem, value: string | number) => {
    const updated = [...purchaseItems]
    if (field === 'quantity' || field === 'price') {
      updated[index][field] = Number(value)
    } else {
      updated[index][field] = value as string
    }
    setPurchaseItems(updated)
  }

  const removePurchaseItem = (index: number) => {
    setPurchaseItems(purchaseItems.filter((_, i) => i !== index))
  }

  const calculateTotal = () => {
    const subtotal = purchaseItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const gst = subtotal * 0.18
    const grandTotal = subtotal + gst
    return { subtotal, gst, grandTotal }
  }

  const placePurchase = async () => {
    try {
      const purchaseData = {
        supplierId: selectedSupplier,
        purchaseItems: purchaseItems.filter(item => item.tyreId && item.quantity > 0 && item.price > 0)
      }

      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchaseData)
      })

      if (response.ok) {
        setSelectedSupplier('')
        setPurchaseItems([])
        setShowAddPurchase(false)
        await fetchTyres()
      }
    } catch (error) {
      console.error('Error placing purchase:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <a href="/" className="text-blue-600 hover:text-blue-800">
                ← Back
              </a>
              <h1 className="text-xl md:text-2xl font-bold text-blue-600">Purchase Management</h1>
            </div>
            <div className="flex items-center space-x-2">
              <a 
                href="/admin"
                className="hidden md:block px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Admin
              </a>
              <a 
                href="/"
                className="hidden md:block px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Sales
              </a>
            </div>
          </div>
          {/* Mobile Navigation */}
          <div className="md:hidden mt-2 flex space-x-2">
            <a 
              href="/"
              className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-center"
            >
              Sales
            </a>
            <a 
              href="/admin"
              className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-center"
            >
              Admin
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
          <div>
            <h2 className="text-xl font-semibold">Purchase Management</h2>
            <p className="text-gray-600">Manage suppliers and purchase orders</p>
          </div>
          <div className="flex space-x-2">
            <Dialog open={showAddSupplier} onOpenChange={setShowAddSupplier}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">Add Supplier</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Supplier</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="supplier-name">Name *</Label>
                    <Input
                      id="supplier-name"
                      value={newSupplier.name}
                      onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                      placeholder="Supplier name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplier-phone">Phone *</Label>
                    <Input
                      id="supplier-phone"
                      value={newSupplier.phone}
                      onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                      placeholder="Phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplier-email">Email</Label>
                    <Input
                      id="supplier-email"
                      type="email"
                      value={newSupplier.email}
                      onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                      placeholder="Email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplier-address">Address</Label>
                    <Textarea
                      id="supplier-address"
                      value={newSupplier.address}
                      onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                      placeholder="Address"
                      rows={3}
                    />
                  </div>
                  <Button onClick={addSupplier} className="w-full">
                    Add Supplier
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showAddPurchase} onOpenChange={setShowAddPurchase}>
              <DialogTrigger asChild>
                <Button size="sm">New Purchase</Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>New Purchase Order</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div>
                    <Label>Supplier *</Label>
                    <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map(supplier => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Purchase Items</h3>
                      <Button onClick={addPurchaseItem} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                      </Button>
                    </div>

                    {purchaseItems.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2 p-4 border rounded-lg">
                        <div className="flex-1">
                          <Label>Tyre</Label>
                          <Select
                            value={item.tyreId}
                            onValueChange={(value) => updatePurchaseItem(index, 'tyreId', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select tyre" />
                            </SelectTrigger>
                            <SelectContent>
                              {tyres.map(tyre => (
                                <SelectItem key={tyre.id} value={tyre.id}>
                                  {tyre.brand} {tyre.model} - {tyre.size}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-24">
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updatePurchaseItem(index, 'quantity', parseInt(e.target.value))}
                          />
                        </div>
                        <div className="w-32">
                          <Label>Price</Label>
                          <Input
                            type="number"
                            min="0"
                            value={item.price}
                            onChange={(e) => updatePurchaseItem(index, 'price', parseFloat(e.target.value))}
                          />
                        </div>
                        <div className="w-32 text-right">
                          <Label>Total</Label>
                          <p className="font-medium">₹{item.price * item.quantity}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePurchaseItem(index)}
                          className="text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {purchaseItems.length > 0 && (
                    <div className="border-t pt-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>₹{calculateTotal().subtotal}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>GST (18%):</span>
                          <span>₹{calculateTotal().gst}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg">
                          <span>Grand Total:</span>
                          <span>₹{calculateTotal().grandTotal}</span>
                        </div>
                      </div>
                      <Button
                        onClick={placePurchase}
                        className="w-full mt-4"
                        disabled={!selectedSupplier || purchaseItems.length === 0}
                      >
                        Place Purchase Order
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Suppliers List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Suppliers ({suppliers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {suppliers.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No suppliers added yet</p>
              ) : (
                <div className="space-y-4">
                  {suppliers.map(supplier => (
                    <div key={supplier.id} className="p-4 border rounded-lg">
                      <h3 className="font-medium text-lg">{supplier.name}</h3>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {supplier.phone}
                        </div>
                        {supplier.email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-4 h-4 mr-2" />
                            {supplier.email}
                          </div>
                        )}
                        {supplier.address && (
                          <div className="flex items-start text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2 mt-0.5" />
                            {supplier.address}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stock Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Current Stock Status</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-8">Loading stock data...</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {tyres.map(tyre => (
                    <div key={tyre.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <p className="font-medium">{tyre.brand} {tyre.model}</p>
                        <p className="text-sm text-gray-600">{tyre.size}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={tyre.stock > 20 ? "default" : tyre.stock > 10 ? "secondary" : "destructive"}>
                          {tyre.stock} units
                        </Badge>
                        <p className="text-sm text-gray-500">₹{tyre.mrp} cost</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}