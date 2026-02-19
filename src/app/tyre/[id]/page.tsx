'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ShoppingCart, ArrowLeft, Star, Shield, Truck, Gauge, Package, CheckCircle } from 'lucide-react'
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

export default function TyreDetail() {
  const params = useParams()
  const router = useRouter()
  const tyreId = params.id as string
  
  const [tyre, setTyre] = useState<Tyre | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    if (tyreId) {
      fetchTyre()
    }
  }, [tyreId])

  const fetchTyre = async () => {
    try {
      const response = await fetch(`/api/tyres/${tyreId}`)
      if (response.ok) {
        const data = await response.json()
        setTyre(data)
      }
    } catch (error) {
      console.error('Error fetching tyre:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async () => {
    if (!tyre) return
    
    setAddingToCart(true)
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tyreId: tyre.id,
          quantity
        })
      })
      
      if (response.ok) {
        alert('Added to cart successfully!')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Failed to add to cart')
    } finally {
      setAddingToCart(false)
    }
  }

  const discount = tyre ? Math.round(((tyre.mrp - tyre.sellingPrice) / tyre.mrp) * 100) : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!tyre) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Tyre Not Found</h1>
            <Button onClick={() => router.push('/')}>Back to Shop</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Button variant="ghost" onClick={() => router.push('/')} className="p-0 h-auto">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <span>/</span>
          <span>{tyre.brand} {tyre.model}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Image */}
            <Card>
              <CardContent className="p-8">
                <div className="relative w-full h-96 rounded-lg overflow-hidden">
                  <TyreImage
                    brand={tyre.brand}
                    model={tyre.model}
                    size={tyre.size}
                    className="w-full h-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Product Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{tyre.brand} {tyre.model}</CardTitle>
                <p className="text-gray-600">{tyre.description || 'High-quality tyre for your vehicle'}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Specifications */}
                <div>
                  <h3 className="font-semibold mb-3">Specifications</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Size</p>
                      <p className="font-medium">{tyre.size}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <p className="font-medium">{tyre.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tube Type</p>
                      <p className="font-medium">{tyre.tubeType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Availability</p>
                      <p className={`font-medium ${tyre.stock > 10 ? 'text-green-600' : tyre.stock > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                        {tyre.stock > 10 ? 'In Stock' : tyre.stock > 0 ? `Only ${tyre.stock} left` : 'Out of Stock'}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Features */}
                <div>
                  <h3 className="font-semibold mb-3">Features & Benefits</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Enhanced grip and traction</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Improved fuel efficiency</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Long-lasting tread life</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">All-weather performance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Reduced road noise</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Superior braking performance</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Additional Information */}
                <div>
                  <h3 className="font-semibold mb-3">Additional Information</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <span>Warranty: 5 years</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Truck className="w-4 h-4" />
                      <span>Free shipping on orders above ₹2000</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Gauge className="w-4 h-4" />
                      <span>Speed rating: {tyre.type === 'Car' ? 'H' : tyre.type === 'Bike' ? 'S' : 'N'} (210 km/h)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Sidebar */}
          <div className="space-y-6">
            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Price</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-3xl font-bold text-green-600">₹{tyre.sellingPrice}</p>
                  <p className="text-sm text-gray-500 line-through">MRP: ₹{tyre.mrp}</p>
                  {discount > 0 && (
                    <Badge variant="destructive" className="mt-2">
                      {discount}% OFF
                    </Badge>
                  )}
                </div>

                <Separator />

                {/* Quantity Selector */}
                <div>
                  <label className="text-sm font-medium">Quantity</label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.min(tyre.stock, quantity + 1))}
                      disabled={quantity >= tyre.stock}
                    >
                      +
                    </Button>
                  </div>
                  {tyre.stock < 10 && tyre.stock > 0 && (
                    <p className="text-xs text-orange-600 mt-1">
                      Only {tyre.stock} left in stock
                    </p>
                  )}
                </div>

                {/* Add to Cart */}
                <Button
                  onClick={addToCart}
                  className="w-full"
                  disabled={tyre.stock === 0 || addingToCart}
                  size="lg"
                >
                  {addingToCart ? (
                    'Adding...'
                  ) : tyre.stock === 0 ? (
                    'Out of Stock'
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>

                {/* Trust Badges */}
                <div className="space-y-2 pt-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span>100% Genuine Product</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Truck className="w-4 h-4" />
                    <span>Fast Delivery</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Star className="w-4 h-4" />
                    <span>Best Price Guarantee</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold">4.5</span>
                  <span className="text-sm text-gray-500">(128 reviews)</span>
                </div>
                <Button variant="outline" className="w-full">
                  Read All Reviews
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}