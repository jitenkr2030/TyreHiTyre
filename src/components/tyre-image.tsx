import React, { useState } from 'react'
import Image from 'next/image'
import { Package } from 'lucide-react'

interface TyreImageProps {
  brand: string
  model: string
  size?: string
  className?: string
}

export function TyreImage({ brand, model, size, className }: TyreImageProps) {
  const [imageError, setImageError] = useState(false)
  
  // Generate a consistent image URL based on tyre properties
  const getImageUrl = () => {
    const brandLower = brand.toLowerCase().replace(/\s+/g, '-')
    const modelLower = model.toLowerCase().replace(/\s+/g, '-')
    const sizeParam = size ? size.toLowerCase().replace(/\s+/g, '-') : 'default'
    return `https://picsum.photos/seed/${brandLower}-${modelLower}-${sizeParam}/400/300.jpg`
  }

  const imageUrl = getImageUrl()

  if (imageError) {
    return (
      <div className={`relative bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <Package className="w-12 h-12 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500 text-sm font-medium">{brand}</p>
          <p className="text-gray-400 text-xs">{model}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`}>
      <Image
        src={imageUrl}
        alt={`${brand} ${model} tyre`}
        width={400}
        height={300}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
        unoptimized
      />
      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-gray-700">
        {brand}
      </div>
    </div>
  )
}