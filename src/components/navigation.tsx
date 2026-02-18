'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingCart, LogIn, LogOut, Menu, ChevronDown, Search, Car, Bike, Truck, Wrench } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'

export function Navigation() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  if (status === 'loading') {
    return <div className="h-16 bg-white shadow-sm"></div>
  }

  const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'staff'

  const carBrands = ['MRF', 'CEAT', 'Goodyear', 'Apollo', 'Bridgestone', 'JK', 'Michelin']
  const bikeBrands = ['MRF', 'CEAT', 'Apollo', 'Bridgestone', 'JK', 'Michelin', 'Pirelli']

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl md:text-2xl font-bold text-blue-600">
              🚗 Tyre Hi Tyre
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {/* Main Categories */}
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <Button variant="ghost" className="flex items-center space-x-1">
                  <Car className="w-4 h-4" />
                  <span>Car Tyres</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
                <div className="absolute top-full left-0 w-64 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 mt-2">
                  <div className="p-4">
                    <h3 className="font-semibold mb-3">Popular Car Tyre Brands</h3>
                    <div className="space-y-2">
                      {carBrands.map(brand => (
                        <Link
                          key={brand}
                          href={`/tyres/car/${brand.toLowerCase()}`}
                          className="block px-3 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors"
                        >
                          {brand} Tyres
                        </Link>
                      ))}
                      <Link
                        href="/tyres/car"
                        className="block px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors border-t mt-2"
                      >
                        All Car Tyres
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <Button variant="ghost" className="flex items-center space-x-1">
                  <Bike className="w-4 h-4" />
                  <span>Bike Tyres</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
                <div className="absolute top-full left-0 w-64 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 mt-2">
                  <div className="p-4">
                    <h3 className="font-semibold mb-3">Popular Bike Tyre Brands</h3>
                    <div className="space-y-2">
                      {bikeBrands.map(brand => (
                        <Link
                          key={brand}
                          href={`/tyres/bike/${brand.toLowerCase()}`}
                          className="block px-3 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors"
                        >
                          {brand} Tyres
                        </Link>
                      ))}
                      <Link
                        href="/tyres/bike"
                        className="block px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors border-t mt-2"
                      >
                        All Bike Tyres
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <Link href="/tyres/commercial">
                <Button variant="ghost" className="flex items-center space-x-1">
                  <Truck className="w-4 h-4" />
                  <span>Commercial</span>
                </Button>
              </Link>

              <Link href="/accessories">
                <Button variant="ghost" className="flex items-center space-x-1">
                  <Wrench className="w-4 h-4" />
                  <span>Accessories</span>
                </Button>
              </Link>

              <Link href="/more">
                <Button variant="ghost">More</Button>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search tyres by brand, model, or size..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                {searchTerm && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 mt-1">
                    <Link
                      href={`/search?q=${encodeURIComponent(searchTerm)}`}
                      className="block px-3 py-2 text-sm hover:bg-gray-100 transition-colors"
                    >
                      Search for "{searchTerm}"
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-2">
              {session ? (
                <>
                  <Link href="/orders">
                    <Button variant="outline" size="sm">
                      My Orders
                    </Button>
                  </Link>
                  
                  {isAdmin && (
                    <>
                      <Link href="/admin">
                        <Button variant="outline" size="sm">
                          Admin
                        </Button>
                      </Link>
                      <Link href="/suppliers">
                        <Button variant="outline" size="sm">
                          Suppliers
                        </Button>
                      </Link>
                      <Link href="/inventory">
                        <Button variant="outline" size="sm">
                          Inventory
                        </Button>
                      </Link>
                      <Link href="/billing">
                        <Button variant="outline" size="sm">
                          Billing
                        </Button>
                      </Link>
                    </>
                  )}
                  
                  <Link href="/cart">
                    <Button size="sm">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Cart
                    </Button>
                  </Link>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {session.user?.name} ({session.user?.role})
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => signOut()}
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <Link href="/auth/signin">
                  <Button size="sm">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="lg:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center">
                  <Car className="w-5 h-5 mr-2" />
                  Tyre Hi Tyre
                </SheetTitle>
              </SheetHeader>
              <div className="px-4 py-6 space-y-6">
                {/* Mobile Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search tyres..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Mobile Categories */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold flex items-center mb-3">
                      <Car className="w-4 h-4 mr-2" />
                      Car Tyres
                    </h3>
                    <div className="space-y-2 pl-6">
                      {carBrands.map(brand => (
                        <Link
                          key={brand}
                          href={`/tyres/car/${brand.toLowerCase()}`}
                          className="block py-1 text-sm hover:text-blue-600"
                        >
                          {brand} Tyres
                        </Link>
                      ))}
                      <Link
                        href="/tyres/car"
                        className="block py-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        All Car Tyres
                      </Link>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold flex items-center mb-3">
                      <Bike className="w-4 h-4 mr-2" />
                      Bike Tyres
                    </h3>
                    <div className="space-y-2 pl-6">
                      {bikeBrands.map(brand => (
                        <Link
                          key={brand}
                          href={`/tyres/bike/${brand.toLowerCase()}`}
                          className="block py-1 text-sm hover:text-blue-600"
                        >
                          {brand} Tyres
                        </Link>
                      ))}
                      <Link
                        href="/tyres/bike"
                        className="block py-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        All Bike Tyres
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Link
                      href="/tyres/commercial"
                      className="flex items-center py-2 text-sm hover:text-blue-600"
                    >
                      <Truck className="w-4 h-4 mr-2" />
                      Commercial Tyres
                    </Link>
                    <Link
                      href="/accessories"
                      className="flex items-center py-2 text-sm hover:text-blue-600"
                    >
                      <Wrench className="w-4 h-4 mr-2" />
                      Accessories
                    </Link>
                    <Link
                      href="/more"
                      className="py-2 text-sm hover:text-blue-600"
                    >
                      More
                    </Link>
                  </div>
                </div>

                {/* Mobile User Actions */}
                <div className="border-t pt-6 space-y-3">
                  {session ? (
                    <>
                      <Link href="/orders" className="block">
                        <Button variant="outline" className="w-full">
                          My Orders
                        </Button>
                      </Link>
                      {isAdmin && (
                        <>
                          <Link href="/admin" className="block">
                            <Button variant="outline" className="w-full">
                              Admin
                            </Button>
                          </Link>
                          <Link href="/suppliers" className="block">
                            <Button variant="outline" className="w-full">
                              Suppliers
                            </Button>
                          </Link>
                          <Link href="/inventory" className="block">
                            <Button variant="outline" className="w-full">
                              Inventory
                            </Button>
                          </Link>
                          <Link href="/billing" className="block">
                            <Button variant="outline" className="w-full">
                              Billing
                            </Button>
                          </Link>
                        </>
                      )}
                      <Link href="/cart" className="block">
                        <Button className="w-full">
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Cart
                        </Button>
                      </Link>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{session.user?.name} ({session.user?.role})</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => signOut()}
                        >
                          <LogOut className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Link href="/auth/signin" className="block">
                      <Button className="w-full">
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign In
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}