'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Search, Plus, Edit, Trash2, Package, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface Supplier {
  id: string
  name: string
  phone: string
  email: string
  address: string
  gstNumber?: string
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
  description: string
}

interface PurchaseItem {
  tyreId: string
  tyre: Tyre
  quantity: number
  purchasePrice: number
  total: number
  profitMargin: number
}

interface Purchase {
  id: string
  purchaseNumber: string
  supplier: Supplier
  items: PurchaseItem[]
  subtotal: number
  gstAmount: number
  grandTotal: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
  createdAt: string
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [tyres, setTyres] = useState<Tyre[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null)
  
  const [formData, setFormData] = useState({
    supplierId: '',
    notes: ''
  })
  
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([])
  const [selectedTyre, setSelectedTyre] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [purchasePrice, setPurchasePrice] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [purchasesRes, suppliersRes, tyresRes] = await Promise.all([
        fetch('/api/purchases'),
        fetch('/api/suppliers'),
        fetch('/api/tyres')
      ])

      if (purchasesRes.ok) {
        const purchasesData = await purchasesRes.json()
        setPurchases(purchasesData.map((p: any) => ({
          ...p,
          items: p.items || []
        })))
      }

      if (suppliersRes.ok) {
        setSuppliers(await suppliersRes.json())
      }

      if (tyresRes.ok) {
        setTyres(await tyresRes.json())
      }
    } catch (error) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const calculateTotals = () => {
    const subtotal = purchaseItems.reduce((sum, item) => sum + item.total, 0)
    const gstAmount = subtotal * 0.18
    const grandTotal = subtotal + gstAmount
    
    return { subtotal, gstAmount, grandTotal }
  }

  const addPurchaseItem = () => {
    if (!selectedTyre || !purchasePrice || quantity <= 0) {
      toast.error('Please select tyre, enter purchase price and quantity')
      return
    }

    const tyre = tyres.find(t => t.id === selectedTyre)
    if (!tyre) return

    const price = parseFloat(purchasePrice)
    const total = price * quantity
    const profitMargin = ((tyre.sellingPrice - price) / price * 100)

    const newItem: PurchaseItem = {
      tyreId: selectedTyre,
      tyre,
      quantity,
      purchasePrice: price,
      total,
      profitMargin
    }

    setPurchaseItems([...purchaseItems, newItem])
    setSelectedTyre('')
    setQuantity(1)
    setPurchasePrice('')
  }

  const removePurchaseItem = (index: number) => {
    setPurchaseItems(purchaseItems.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.supplierId || purchaseItems.length === 0) {
      toast.error('Please select supplier and add at least one item')
      return
    }

    try {
      const { subtotal, gstAmount, grandTotal } = calculateTotals()
      
      const payload = {
        supplierId: formData.supplierId,
        items: purchaseItems.map(item => ({
          tyreId: item.tyreId,
          quantity: item.quantity,
          price: item.purchasePrice
        })),
        subtotal,
        gstAmount,
        grandTotal,
        notes: formData.notes
      }

      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        toast.success('Purchase order created successfully')
        setDialogOpen(false)
        resetForm()
        fetchData()
      } else {
        toast.error('Failed to create purchase order')
      }
    } catch (error) {
      toast.error('Error creating purchase order')
    }
  }

  const resetForm = () => {
    setFormData({ supplierId: '', notes: '' })
    setPurchaseItems([])
    setSelectedTyre('')
    setQuantity(1)
    setPurchasePrice('')
    setEditingPurchase(null)
  }

  const updatePurchaseStatus = async (purchaseId: string, status: string) => {
    try {
      const response = await fetch(`/api/purchases/${purchaseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        toast.success('Purchase status updated successfully')
        fetchData()
      } else {
        toast.error('Failed to update status')
      }
    } catch (error) {
      toast.error('Error updating status')
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      confirmed: 'default',
      completed: 'default',
      cancelled: 'destructive'
    }
    
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const filteredPurchases = purchases.filter(purchase =>
    purchase.purchaseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const { subtotal, gstAmount, grandTotal } = calculateTotals()

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Purchase Management</h1>
          <p className="text-muted-foreground">Create and manage purchase orders from suppliers</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              New Purchase
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Purchase Order</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplier">Supplier *</Label>
                  <Select value={formData.supplierId} onValueChange={(value) => setFormData({ ...formData, supplierId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Add Items</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="tyre">Tyre</Label>
                    <Select value={selectedTyre} onValueChange={setSelectedTyre}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tyre" />
                      </SelectTrigger>
                      <SelectContent>
                        {tyres.map((tyre) => (
                          <SelectItem key={tyre.id} value={tyre.id}>
                            {tyre.brand} {tyre.model} {tyre.size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="purchasePrice">Purchase Price</Label>
                    <Input
                      id="purchasePrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <Button type="button" onClick={addPurchaseItem} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>

                {purchaseItems.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tyre</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Margin</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {purchaseItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{item.tyre.brand} {item.tyre.model}</p>
                                <p className="text-sm text-muted-foreground">{item.tyre.size}</p>
                              </div>
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>₹{item.purchasePrice.toFixed(2)}</TableCell>
                            <TableCell>₹{item.total.toFixed(2)}</TableCell>
                            <TableCell>
                              <span className={item.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {item.profitMargin.toFixed(1)}%
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removePurchaseItem(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes for this purchase..."
                  rows={3}
                />
              </div>

              {purchaseItems.length > 0 && (
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18%):</span>
                    <span>₹{gstAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Grand Total:</span>
                    <span>₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={purchaseItems.length === 0}>
                  Create Purchase Order
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search purchases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredPurchases.map((purchase) => (
          <Card key={purchase.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-xl">{purchase.purchaseNumber}</CardTitle>
                  <p className="text-muted-foreground">
                    {purchase.supplier.name} • {new Date(purchase.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(purchase.status)}
                  {purchase.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => updatePurchaseStatus(purchase.id, 'confirmed')}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirm
                    </Button>
                  )}
                  {purchase.status === 'confirmed' && (
                    <Button
                      size="sm"
                      onClick={() => updatePurchaseStatus(purchase.id, 'completed')}
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Complete
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Items</p>
                    <p className="font-medium">{purchase.items.length} items</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Quantity</p>
                    <p className="font-medium">{purchase.items.reduce((sum, item) => sum + item.quantity, 0)} units</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Grand Total</p>
                    <p className="font-bold text-lg">₹{purchase.grandTotal.toLocaleString()}</p>
                  </div>
                </div>

                {purchase.items.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tyre</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Purchase Price</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Selling Price</TableHead>
                          <TableHead>Profit Margin</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {purchase.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{item.tyre.brand} {item.tyre.model}</p>
                                <p className="text-sm text-muted-foreground">{item.tyre.size}</p>
                              </div>
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>₹{item.purchasePrice.toFixed(2)}</TableCell>
                            <TableCell>₹{item.total.toFixed(2)}</TableCell>
                            <TableCell>₹{item.tyre.sellingPrice.toFixed(2)}</TableCell>
                            <TableCell>
                              <span className={item.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {item.profitMargin.toFixed(1)}%
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {purchase.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Notes:</p>
                    <p>{purchase.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredPurchases.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-muted-foreground">
                {searchTerm ? 'No purchases found matching your search.' : 'No purchase orders yet.'}
              </div>
              {!searchTerm && (
                <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Purchase Order
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}