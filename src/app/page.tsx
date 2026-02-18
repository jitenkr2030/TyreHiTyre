'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Search, ShoppingCart, Filter, Plus, Minus, IndianRupee, Eye, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Navigation } from '@/components/navigation'
import { TyreImage } from '@/components/tyre-image'

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

interface CartItem {
  id: string
  tyre: Tyre
  quantity: number
}

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tyres, setTyres] = useState<Tyre[]>([])
  const [filteredTyres, setFilteredTyres] = useState<Tyre[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedTubeType, setSelectedTubeType] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  useEffect(() => {
    fetchTyres()
    loadCartFromStorage()
  }, [])

  useEffect(() => {
    filterTyres()
  }, [tyres, searchTerm, selectedBrand, selectedType, selectedTubeType, minPrice, maxPrice])

  const loadCartFromStorage = () => {
    try {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        setCart(JSON.parse(savedCart))
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error)
    }
  }

  const fetchTyres = async () => {
    try {
      const response = await fetch('/api/tyres')
      const data = await response.json()
      setTyres(data)
      setFilteredTyres(data)
    } catch (error) {
      console.error('Error fetching tyres:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterTyres = () => {
    let filtered = tyres

    if (searchTerm) {
      filtered = filtered.filter(tyre => 
        tyre.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tyre.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tyre.size.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedBrand) {
      filtered = filtered.filter(tyre => tyre.brand === selectedBrand)
    }

    if (selectedType) {
      filtered = filtered.filter(tyre => tyre.type === selectedType)
    }

    if (selectedTubeType) {
      filtered = filtered.filter(tyre => tyre.tubeType === selectedTubeType)
    }

    if (minPrice) {
      filtered = filtered.filter(tyre => tyre.sellingPrice >= parseFloat(minPrice))
    }

    if (maxPrice) {
      filtered = filtered.filter(tyre => tyre.sellingPrice <= parseFloat(maxPrice))
    }

    setFilteredTyres(filtered)
  }

  const addToCart = async (tyre: Tyre) => {
    try {
      const existingItem = cart.find(item => item.tyre.id === tyre.id)
      let newCart: CartItem[]

      if (existingItem) {
        newCart = cart.map(item =>
          item.tyre.id === tyre.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        newCart = [...cart, { id: tyre.id, tyre, quantity: 1 }]
      }

      setCart(newCart)
      localStorage.setItem('cart', JSON.stringify(newCart))

      // Show success feedback
      const button = document.querySelector(`[data-tyre-id="${tyre.id}"]`) as HTMLButtonElement
      if (button) {
        const originalText = button.innerHTML
        button.innerHTML = '✓ Added'
        button.classList.add('bg-green-600', 'hover:bg-green-700')
        button.disabled = true
        
        setTimeout(() => {
          button.innerHTML = originalText
          button.classList.remove('bg-green-600', 'hover:bg-green-700')
          button.disabled = false
        }, 1500)
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  const removeFromCart = (id: string) => {
    const newCart = cart.filter(item => item.id !== id)
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
    } else {
      const newCart = cart.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
      setCart(newCart)
      localStorage.setItem('cart', JSON.stringify(newCart))
    }
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.tyre.sellingPrice * item.quantity), 0)
  }

  const brands = [...new Set(tyres.map(tyre => tyre.brand))]
  const types = [...new Set(tyres.map(tyre => tyre.type))]
  const tubeTypes = [...new Set(tyres.map(tyre => tyre.tubeType))]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search by brand, model, or size (e.g., 205/55 R16)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Vertical Search Bar */}
            <div className="mt-4 hidden lg:block">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-3 text-sm">Quick Search</h3>
                <div className="space-y-2">
                  <Input
                    placeholder="Brand (e.g., MRF, CEAT)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="text-sm"
                  />
                  <Input
                    placeholder="Size (e.g., 205/55 R16)"
                    className="text-sm"
                  />
                  <Input
                    placeholder="Model (e.g., Zapper, Acelere)"
                    className="text-sm"
                  />
                  <Button size="sm" className="w-full">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </div>

            {showFilters && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Brand</Label>
                  <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Brands</SelectItem>
                      {brands.map(brand => (
                        <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Vehicle Type</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      {types.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tube Type</Label>
                  <Select value={selectedTubeType} onValueChange={setSelectedTubeType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tube type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Tube Types</SelectItem>
                      {tubeTypes.map(tubeType => (
                        <SelectItem key={tubeType} value={tubeType}>{tubeType}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Price Range</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTyres.map(tyre => {
              const discount = Math.round(((tyre.mrp - tyre.sellingPrice) / tyre.mrp) * 100)
              return (
                <Card key={tyre.id} className="hover:shadow-lg transition-all overflow-hidden">
                  <div className="aspect-video relative">
                    <TyreImage
                      brand={tyre.brand}
                      model={tyre.model}
                      size={tyre.size}
                      className="w-full h-full"
                    />
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{tyre.brand}</CardTitle>
                        <p className="text-sm text-gray-600">{tyre.model}</p>
                      </div>
                      {discount > 0 && (
                        <Badge variant="destructive" className="text-xs">{discount}% OFF</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-700">{tyre.size}</p>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">{tyre.type}</Badge>
                        <Badge variant="outline" className="text-xs">{tyre.tubeType}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500 line-through">MRP: ₹{tyre.mrp}</p>
                          <p className="text-xl font-bold text-green-600">₹{tyre.sellingPrice}</p>
                          <p className="text-xs text-gray-500">per tyre</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${tyre.stock > 10 ? 'text-green-600' : tyre.stock > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                            {tyre.stock > 10 ? 'In Stock' : tyre.stock > 0 ? `Only ${tyre.stock} left` : 'Out of Stock'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/tyre/${tyre.id}`)}
                          className="flex-1"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          onClick={() => addToCart(tyre)}
                          className="flex-1"
                          disabled={tyre.stock === 0}
                          size="sm"
                          data-tyre-id={tyre.id}
                        >
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {filteredTyres.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No tyres found matching your criteria.</p>
            <p className="text-gray-400 text-sm">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>

      {/* Cart Dialog */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <ShoppingCart className="w-5 h-5 mr-2 inline" />
              Shopping Cart ({getTotalItems()} items)
            </DialogTitle>
          </DialogHeader>
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Your cart is empty</p>
              <Button onClick={() => setShowCart(false)} className="mt-4">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.tyre.brand} {item.tyre.model}</h4>
                    <p className="text-sm text-gray-600">{item.tyre.size}</p>
                    <p className="text-sm text-gray-600">{item.tyre.type} • {item.tyre.tubeType}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.tyre.stock}
                      >
                        +
                      </Button>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{item.tyre.sellingPrice * item.quantity}</p>
                      <p className="text-sm text-gray-500">₹{item.tyre.sellingPrice} each</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-lg font-bold">₹{getTotalPrice()}</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" onClick={() => setShowCart(false)}>
                    Continue Shopping
                  </Button>
                  <Button className="flex-1">
                    Proceed to Checkout
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}