'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Plus, Edit, Trash2, Package, Phone, Mail, MapPin, Search, X, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Navigation } from '@/components/navigation'

interface Supplier {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  gstNumber?: string
  createdAt: string
  updatedAt: string
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

interface Purchase {
  id: string
  purchaseNumber: string
  supplier: {
    id: string
    name: string
    phone: string
  }
  items: Array<{
    id: string
    tyre: {
      id: string
      brand: string
      model: string
      size: string
    }
    quantity: number
    price: number
    total: number
  }>
  totalAmount: number
  gstAmount: number
  grandTotal: number
  status: string
  createdAt: string
}

interface FormErrors {
  name?: string
  phone?: string
  email?: string
  address?: string
  gstNumber?: string
}

export default function SuppliersPage() {
  const { data: session, status } = useSession()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [tyres, setTyres] = useState<Tyre[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddSupplier, setShowAddSupplier] = useState(false)
  const [showEditSupplier, setShowEditSupplier] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showAddPurchase, setShowAddPurchase] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [selectedPurchaseSupplier, setSelectedPurchaseSupplier] = useState('')
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [newSupplier, setNewSupplier] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    gstNumber: ''
  })

  useEffect(() => {
    fetchSuppliers()
    fetchTyres()
    fetchPurchases()
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

  const fetchPurchases = async () => {
    try {
      const response = await fetch('/api/purchases')
      const data = await response.json()
      setPurchases(data)
    } catch (error) {
      console.error('Error fetching purchases:', error)
    }
  }

  const validateForm = (): boolean => {
    const errors: FormErrors = {}

    if (!newSupplier.name.trim()) {
      errors.name = 'Supplier name is required'
    }

    if (!newSupplier.phone.trim()) {
      errors.phone = 'Phone number is required'
    } else if (!/^[6-9]\d{9}$/.test(newSupplier.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit phone number'
    }

    if (newSupplier.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newSupplier.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (newSupplier.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(newSupplier.gstNumber.toUpperCase())) {
      errors.gstNumber = 'Please enter a valid GST number'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const resetForm = () => {
    setNewSupplier({
      name: '',
      phone: '',
      email: '',
      address: '',
      gstNumber: ''
    })
    setFormErrors({})
  }

  const addSupplier = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSupplier)
      })

      if (response.ok) {
        await fetchSuppliers()
        resetForm()
        setShowAddSupplier(false)
      } else {
        const error = await response.json()
        console.error('Error adding supplier:', error)
      }
    } catch (error) {
      console.error('Error adding supplier:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateSupplier = async () => {
    if (!selectedSupplier || !validateForm()) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/suppliers/${selectedSupplier.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSupplier)
      })

      if (response.ok) {
        await fetchSuppliers()
        resetForm()
        setShowEditSupplier(false)
        setSelectedSupplier(null)
      }
    } catch (error) {
      console.error('Error updating supplier:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteSupplier = async () => {
    if (!selectedSupplier) return

    try {
      const response = await fetch(`/api/suppliers/${selectedSupplier.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchSuppliers()
        setShowDeleteConfirm(false)
        setSelectedSupplier(null)
      }
    } catch (error) {
      console.error('Error deleting supplier:', error)
    }
  }

  const startEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setNewSupplier({
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email || '',
      address: supplier.address || '',
      gstNumber: supplier.gstNumber || ''
    })
    setShowEditSupplier(true)
  }

  const startDelete = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setShowDeleteConfirm(true)
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
        supplierId: selectedPurchaseSupplier,
        purchaseItems: purchaseItems.filter(item => item.tyreId && item.quantity > 0 && item.price > 0)
      }

      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchaseData)
      })

      if (response.ok) {
        setSelectedPurchaseSupplier('')
        setPurchaseItems([])
        setShowAddPurchase(false)
        await fetchTyres()
        await fetchPurchases()
      }
    } catch (error) {
      console.error('Error placing purchase:', error)
    }
  }

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone.includes(searchTerm) ||
    (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const calculateProfitMargin = (purchasePrice: number, sellingPrice: number) => {
    if (purchasePrice === 0) return 0
    return ((sellingPrice - purchasePrice) / purchasePrice * 100).toFixed(1)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Supplier Management</h1>
          <p className="text-gray-600">Manage your suppliers and purchase orders</p>
        </div>
        <Tabs defaultValue="suppliers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="purchases">Purchase History</TabsTrigger>
          </TabsList>

          <TabsContent value="suppliers" className="space-y-6">
            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search suppliers by name or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Dialog open={showAddPurchase} onOpenChange={setShowAddPurchase}>
                  <DialogTrigger asChild>
                    <Button variant="outline">New Purchase</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>New Purchase Order</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div>
                        <Label>Supplier *</Label>
                        <Select value={selectedPurchaseSupplier} onValueChange={setSelectedPurchaseSupplier}>
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
                              <Label>Purchase Price</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
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
                              <span>₹{calculateTotal().subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>GST (18%):</span>
                              <span>₹{calculateTotal().gst.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg">
                              <span>Grand Total:</span>
                              <span>₹{calculateTotal().grandTotal.toFixed(2)}</span>
                            </div>
                          </div>
                          <Button
                            onClick={placePurchase}
                            className="w-full mt-4"
                            disabled={!selectedPurchaseSupplier || purchaseItems.length === 0}
                          >
                            Place Purchase Order
                          </Button>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={showAddSupplier} onOpenChange={setShowAddSupplier}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Supplier
                    </Button>
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
                          className={formErrors.name ? 'border-red-500' : ''}
                        />
                        {formErrors.name && (
                          <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="supplier-phone">Phone *</Label>
                        <Input
                          id="supplier-phone"
                          value={newSupplier.phone}
                          onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                          placeholder="Phone number"
                          className={formErrors.phone ? 'border-red-500' : ''}
                        />
                        {formErrors.phone && (
                          <p className="text-sm text-red-500 mt-1">{formErrors.phone}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="supplier-email">Email</Label>
                        <Input
                          id="supplier-email"
                          type="email"
                          value={newSupplier.email}
                          onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                          placeholder="Email address"
                          className={formErrors.email ? 'border-red-500' : ''}
                        />
                        {formErrors.email && (
                          <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="supplier-address">Address</Label>
                        <Textarea
                          id="supplier-address"
                          value={newSupplier.address}
                          onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                          placeholder="Complete address"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="supplier-gst">GST Number</Label>
                        <Input
                          id="supplier-gst"
                          value={newSupplier.gstNumber}
                          onChange={(e) => setNewSupplier({...newSupplier, gstNumber: e.target.value.toUpperCase()})}
                          placeholder="GSTIN (e.g., 27AAPCS1234C1ZV)"
                          className={formErrors.gstNumber ? 'border-red-500' : ''}
                        />
                        {formErrors.gstNumber && (
                          <p className="text-sm text-red-500 mt-1">{formErrors.gstNumber}</p>
                        )}
                      </div>
                      <Button onClick={addSupplier} className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? 'Adding...' : 'Add Supplier'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Suppliers Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Suppliers ({filteredSuppliers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredSuppliers.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">
                      {searchTerm ? 'No suppliers found matching your search' : 'No suppliers added yet'}
                    </p>
                    {!searchTerm && (
                      <Button onClick={() => setShowAddSupplier(true)} className="mt-4">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Supplier
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Supplier Details</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>GST Number</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSuppliers.map(supplier => (
                          <TableRow key={supplier.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{supplier.name}</p>
                                <p className="text-sm text-gray-500">
                                  Added {new Date(supplier.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center text-sm">
                                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                  {supplier.phone}
                                </div>
                                {supplier.email && (
                                  <div className="flex items-center text-sm">
                                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                    {supplier.email}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {supplier.address ? (
                                <div className="flex items-start text-sm max-w-xs">
                                  <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                                  <span className="line-clamp-2">{supplier.address}</span>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">Not provided</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {supplier.gstNumber ? (
                                <Badge variant="secondary">{supplier.gstNumber}</Badge>
                              ) : (
                                <span className="text-gray-400 text-sm">Not provided</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => startEdit(supplier)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => startDelete(supplier)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="purchases" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Purchase History</CardTitle>
              </CardHeader>
              <CardContent>
                {purchases.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No purchase orders found</p>
                    <Button onClick={() => setShowAddPurchase(true)} className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Purchase Order
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {purchases.map(purchase => (
                      <div key={purchase.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium">{purchase.purchaseNumber}</h3>
                            <p className="text-sm text-gray-600">
                              Supplier: {purchase.supplier.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(purchase.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant={purchase.status === 'completed' ? 'default' : 'secondary'}>
                              {purchase.status}
                            </Badge>
                            <p className="font-bold mt-1">₹{purchase.grandTotal}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {purchase.items.map(item => {
                            const tyre = tyres.find(t => t.id === item.tyre.id)
                            const profitMargin = tyre ? calculateProfitMargin(item.price, tyre.sellingPrice) : '0'
                            return (
                              <div key={item.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                                <div>
                                  <p className="font-medium">{item.tyre.brand} {item.tyre.model}</p>
                                  <p className="text-gray-600">{item.tyre.size}</p>
                                </div>
                                <div className="text-right">
                                  <p>Qty: {item.quantity} × ₹{item.price}</p>
                                  <p className="text-green-600">Profit: {profitMargin}%</p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Supplier Dialog */}
      <Dialog open={showEditSupplier} onOpenChange={setShowEditSupplier}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={newSupplier.name}
                onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                placeholder="Supplier name"
                className={formErrors.name ? 'border-red-500' : ''}
              />
              {formErrors.name && (
                <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone *</Label>
              <Input
                id="edit-phone"
                value={newSupplier.phone}
                onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                placeholder="Phone number"
                className={formErrors.phone ? 'border-red-500' : ''}
              />
              {formErrors.phone && (
                <p className="text-sm text-red-500 mt-1">{formErrors.phone}</p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={newSupplier.email}
                onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                placeholder="Email address"
                className={formErrors.email ? 'border-red-500' : ''}
              />
              {formErrors.email && (
                <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-address">Address</Label>
              <Textarea
                id="edit-address"
                value={newSupplier.address}
                onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                placeholder="Complete address"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-gst">GST Number</Label>
              <Input
                id="edit-gst"
                value={newSupplier.gstNumber}
                onChange={(e) => setNewSupplier({...newSupplier, gstNumber: e.target.value.toUpperCase()})}
                placeholder="GSTIN (e.g., 27AAPCS1234C1ZV)"
                className={formErrors.gstNumber ? 'border-red-500' : ''}
              />
              {formErrors.gstNumber && (
                <p className="text-sm text-red-500 mt-1">{formErrors.gstNumber}</p>
              )}
            </div>
            <div className="flex space-x-2">
              <Button onClick={updateSupplier} className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Supplier'}
              </Button>
              <Button variant="outline" onClick={() => setShowEditSupplier(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertCircle className="w-5 h-5 mr-2" />
              Confirm Delete
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Are you sure you want to delete supplier "{selectedSupplier?.name}"? This action cannot be undone.
              </AlertDescription>
            </Alert>
            <div className="flex space-x-2">
              <Button onClick={deleteSupplier} variant="destructive" className="flex-1">
                Delete Supplier
              </Button>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}