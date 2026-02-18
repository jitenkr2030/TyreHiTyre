'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Search, 
  AlertTriangle, 
  Package, 
  TrendingUp, 
  Download, 
  Filter,
  Edit,
  History,
  BarChart3,
  Eye
} from 'lucide-react'

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
  image?: string
  createdAt: string
  updatedAt: string
}

interface StockUpdate {
  id: string
  tyreId: string
  previousStock: number
  newStock: number
  reason: string
  type: 'MANUAL' | 'ORDER' | 'PURCHASE'
  createdAt: string
  tyre: Tyre
}

interface BrandStock {
  brand: string
  totalStock: number
  totalValue: number
  tyreCount: number
  lowStockCount: number
}

interface SizeStock {
  size: string
  totalStock: number
  totalValue: number
  tyreCount: number
}

export default function InventoryManagement() {
  const [tyres, setTyres] = useState<Tyre[]>([])
  const [stockHistory, setStockHistory] = useState<StockUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('all')
  const [selectedSize, setSelectedSize] = useState('all')
  const [stockUpdateOpen, setStockUpdateOpen] = useState(false)
  const [selectedTyre, setSelectedTyre] = useState<Tyre | null>(null)
  const [updateReason, setUpdateReason] = useState('')
  const [newStockValue, setNewStockValue] = useState('')
  const [brandStocks, setBrandStocks] = useState<BrandStock[]>([])
  const [sizeStocks, setSizeStocks] = useState<SizeStock[]>([])
  const [historyOpen, setHistoryOpen] = useState(false)

  useEffect(() => {
    fetchInventory()
    fetchStockHistory()
  }, [])

  useEffect(() => {
    calculateBrandStocks()
    calculateSizeStocks()
  }, [tyres])

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/tyres')
      const data = await response.json()
      if (data.success) {
        setTyres(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStockHistory = async () => {
    try {
      // In a real implementation, this would fetch from a stock history API
      // For now, we'll use a mock implementation
      const mockHistory: StockUpdate[] = []
      setStockHistory(mockHistory)
    } catch (error) {
      console.error('Failed to fetch stock history:', error)
    }
  }

  const calculateBrandStocks = () => {
    const brandMap = new Map<string, BrandStock>()
    
    tyres.forEach(tyre => {
      const existing = brandMap.get(tyre.brand) || {
        brand: tyre.brand,
        totalStock: 0,
        totalValue: 0,
        tyreCount: 0,
        lowStockCount: 0
      }
      
      existing.totalStock += tyre.stock
      existing.totalValue += tyre.stock * tyre.sellingPrice
      existing.tyreCount += 1
      if (tyre.stock < 5) existing.lowStockCount += 1
      
      brandMap.set(tyre.brand, existing)
    })
    
    setBrandStocks(Array.from(brandMap.values()).sort((a, b) => b.totalStock - a.totalStock))
  }

  const calculateSizeStocks = () => {
    const sizeMap = new Map<string, SizeStock>()
    
    tyres.forEach(tyre => {
      const existing = sizeMap.get(tyre.size) || {
        size: tyre.size,
        totalStock: 0,
        totalValue: 0,
        tyreCount: 0
      }
      
      existing.totalStock += tyre.stock
      existing.totalValue += tyre.stock * tyre.sellingPrice
      existing.tyreCount += 1
      
      sizeMap.set(tyre.size, existing)
    })
    
    setSizeStocks(Array.from(sizeMap.values()).sort((a, b) => b.totalStock - a.totalStock))
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { status: 'Out of Stock', color: 'destructive', progress: 0 }
    if (stock < 5) return { status: 'Low Stock', color: 'warning', progress: (stock / 20) * 100 }
    return { status: 'In Stock', color: 'success', progress: Math.min((stock / 50) * 100, 100) }
  }

  const handleStockUpdate = async () => {
    if (!selectedTyre || !newStockValue || !updateReason) return

    try {
      const response = await fetch(`/api/tyres/${selectedTyre.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          stock: parseInt(newStockValue),
          stockUpdateReason: updateReason
        })
      })

      if (response.ok) {
        await fetchInventory()
        setStockUpdateOpen(false)
        setSelectedTyre(null)
        setUpdateReason('')
        setNewStockValue('')
      }
    } catch (error) {
      console.error('Failed to update stock:', error)
    }
  }

  const exportToCSV = () => {
    const csvContent = [
      ['Brand', 'Model', 'Size', 'Type', 'Stock', 'MRP', 'Selling Price', 'Value'],
      ...filteredTyres.map(tyre => [
        tyre.brand,
        tyre.model,
        tyre.size,
        tyre.type,
        tyre.stock.toString(),
        tyre.mrp.toString(),
        tyre.sellingPrice.toString(),
        (tyre.stock * tyre.sellingPrice).toString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const filteredTyres = tyres.filter(tyre => {
    const matchesSearch = tyre.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tyre.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tyre.size.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBrand = selectedBrand === 'all' || tyre.brand === selectedBrand
    const matchesSize = selectedSize === 'all' || tyre.size === selectedSize
    return matchesSearch && matchesBrand && matchesSize
  })

  const totalStock = tyres.reduce((sum, tyre) => sum + tyre.stock, 0)
  const totalValue = tyres.reduce((sum, tyre) => sum + (tyre.stock * tyre.sellingPrice), 0)
  const lowStockItems = tyres.filter(tyre => tyre.stock < 5).length
  const outOfStockItems = tyres.filter(tyre => tyre.stock === 0).length

  const brands = Array.from(new Set(tyres.map(tyre => tyre.brand)))
  const sizes = Array.from(new Set(tyres.map(tyre => tyre.size)))

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Manage your tyre stock and track inventory levels</p>
        </div>
        <Button onClick={exportToCSV} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStock}</div>
            <p className="text-xs text-muted-foreground">Units across all tyres</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current inventory value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Items with stock &lt; 5</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{outOfStockItems}</div>
            <p className="text-xs text-muted-foreground">Items with zero stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <AlertDescription className="text-orange-700">
            You have {lowStockItems} items with low stock (less than 5 units). Consider restocking soon.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Stock Overview</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="brands">Brand Analysis</TabsTrigger>
          <TabsTrigger value="sizes">Size Analysis</TabsTrigger>
          <TabsTrigger value="history">Stock History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Brand-wise Stock */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Brand-wise Stock
                </CardTitle>
                <CardDescription>Current stock levels by brand</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {brandStocks.slice(0, 5).map((brand) => (
                    <div key={brand.brand} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{brand.brand}</span>
                        <span className="text-sm text-muted-foreground">
                          {brand.totalStock} units • ₹{brand.totalValue.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={(brand.totalStock / Math.max(...brandStocks.map(b => b.totalStock))) * 100} className="h-2" />
                      {brand.lowStockCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {brand.lowStockCount} low stock items
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Size-wise Stock */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Size-wise Stock
                </CardTitle>
                <CardDescription>Current stock levels by tyre size</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sizeStocks.slice(0, 5).map((size) => (
                    <div key={size.size} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{size.size}</span>
                        <span className="text-sm text-muted-foreground">
                          {size.totalStock} units • {size.tyreCount} types
                        </span>
                      </div>
                      <Progress value={(size.totalStock / Math.max(...sizeStocks.map(s => s.totalStock))) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search & Filter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by brand, model, or size..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brands</SelectItem>
                    {brands.map(brand => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sizes</SelectItem>
                    {sizes.map(size => (
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Table */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Items</CardTitle>
              <CardDescription>
                Showing {filteredTyres.length} of {tyres.length} items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Brand</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTyres.map((tyre) => {
                      const stockStatus = getStockStatus(tyre.stock)
                      const value = tyre.stock * tyre.sellingPrice
                      return (
                        <TableRow key={tyre.id}>
                          <TableCell className="font-medium">{tyre.brand}</TableCell>
                          <TableCell>{tyre.model}</TableCell>
                          <TableCell>{tyre.size}</TableCell>
                          <TableCell>{tyre.type}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{tyre.stock}</span>
                              <Progress value={stockStatus.progress} className="h-2 w-16" />
                            </div>
                          </TableCell>
                          <TableCell>₹{value.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={stockStatus.color as any}>
                              {stockStatus.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Dialog open={stockUpdateOpen && selectedTyre?.id === tyre.id} onOpenChange={setStockUpdateOpen}>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedTyre(tyre)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Update Stock</DialogTitle>
                                    <DialogDescription>
                                      Update stock level for {tyre.brand} {tyre.model}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="currentStock">Current Stock</Label>
                                      <Input id="currentStock" value={tyre.stock} disabled />
                                    </div>
                                    <div>
                                      <Label htmlFor="newStock">New Stock</Label>
                                      <Input
                                        id="newStock"
                                        type="number"
                                        value={newStockValue}
                                        onChange={(e) => setNewStockValue(e.target.value)}
                                        placeholder="Enter new stock quantity"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="reason">Reason</Label>
                                      <Textarea
                                        id="reason"
                                        value={updateReason}
                                        onChange={(e) => setUpdateReason(e.target.value)}
                                        placeholder="Reason for stock update (e.g., Purchase return, Stock adjustment, etc.)"
                                      />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                      <Button variant="outline" onClick={() => setStockUpdateOpen(false)}>
                                        Cancel
                                      </Button>
                                      <Button onClick={handleStockUpdate}>
                                        Update Stock
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brands" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Brand Analysis</CardTitle>
              <CardDescription>Detailed breakdown by tyre brands</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Brand</TableHead>
                      <TableHead>Total Stock</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>Product Types</TableHead>
                      <TableHead>Low Stock Items</TableHead>
                      <TableHead>Stock Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {brandStocks.map((brand) => {
                      const hasLowStock = brand.lowStockCount > 0
                      return (
                        <TableRow key={brand.brand}>
                          <TableCell className="font-medium">{brand.brand}</TableCell>
                          <TableCell>{brand.totalStock}</TableCell>
                          <TableCell>₹{brand.totalValue.toLocaleString()}</TableCell>
                          <TableCell>{brand.tyreCount}</TableCell>
                          <TableCell>
                            {hasLowStock ? (
                              <Badge variant="destructive">{brand.lowStockCount} items</Badge>
                            ) : (
                              <Badge variant="secondary">All good</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Progress value={(brand.totalStock / Math.max(...brandStocks.map(b => b.totalStock))) * 100} className="h-2 w-24" />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sizes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Size Analysis</CardTitle>
              <CardDescription>Detailed breakdown by tyre sizes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Size</TableHead>
                      <TableHead>Total Stock</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>Product Types</TableHead>
                      <TableHead>Stock Distribution</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sizeStocks.map((size) => (
                      <TableRow key={size.size}>
                        <TableCell className="font-medium">{size.size}</TableCell>
                        <TableCell>{size.totalStock}</TableCell>
                        <TableCell>₹{size.totalValue.toLocaleString()}</TableCell>
                        <TableCell>{size.tyreCount}</TableCell>
                        <TableCell>
                          <Progress value={(size.totalStock / Math.max(...sizeStocks.map(s => s.totalStock))) * 100} className="h-2 w-24" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Stock Movement History
              </CardTitle>
              <CardDescription>Track all stock changes over time</CardDescription>
            </CardHeader>
            <CardContent>
              {stockHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No stock history available yet.</p>
                  <p className="text-sm">Stock movements will appear here as you make updates.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Tyre</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Previous Stock</TableHead>
                        <TableHead>New Stock</TableHead>
                        <TableHead>Change</TableHead>
                        <TableHead>Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stockHistory.map((update) => {
                        const change = update.newStock - update.previousStock
                        return (
                          <TableRow key={update.id}>
                            <TableCell>{new Date(update.createdAt).toLocaleString()}</TableCell>
                            <TableCell>
                              {update.tyre.brand} {update.tyre.model}
                              <div className="text-sm text-muted-foreground">{update.tyre.size}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={update.type === 'MANUAL' ? 'default' : 'secondary'}>
                                {update.type}
                              </Badge>
                            </TableCell>
                            <TableCell>{update.previousStock}</TableCell>
                            <TableCell>{update.newStock}</TableCell>
                            <TableCell>
                              <span className={change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-muted-foreground'}>
                                {change > 0 ? '+' : ''}{change}
                              </span>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{update.reason}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}