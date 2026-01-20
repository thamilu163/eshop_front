/**
 * Type definitions for product-related entities
 */

export interface Category {
  id: number
  name: string
  description?: string
  imageUrl?: string
  active: boolean
  parentCategory?: Category | null
  parent_id?: number | null
  children?: Category[]
  createdAt: string
}

export interface Brand {
  id: number
  name: string
  slug?: string
  description?: string
  logoUrl?: string
}

/**
 * Backend API format for product creation
 */
export interface BackendProductRequest {
  name: string
  description: string
  sku: string
  friendlyUrl: string
  price: number
  discountPrice?: number
  stockQuantity: number
  imageUrl: string
  categoryId: number
  categoryType: string
  subCategory?: string
  categoryAttributes: CategoryAttributes
  brandId: number
  shopId: number
  tags: string[]
  featured: boolean
}

export interface CategoryAttributes {
  type?: string
  brand?: string
  size?: string
  availableSizes?: string[]
  color?: string
  availableColors?: string[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}
