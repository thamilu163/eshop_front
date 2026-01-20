/**
 * Backend API Mapper
 * Transforms frontend form data to backend API format
 */

import type { ProductFormData } from '@/lib/validation/schemas/product-form-schema'
import type { BackendProductRequest, CategoryAttributes, Category } from '@/types/product'
import { generateSlug, calculateFinalPrice } from '@/lib/validation/schemas/product-form-schema'

/**
 * Map form data to backend API request format
 */
export function mapFormToBackendRequest(
  formData: ProductFormData,
  category: Category | undefined,
  subCategory: Category | undefined,
  brandName: string | undefined,
  shopId: number
): BackendProductRequest {
  const categoryName = category?.name || ''
  const subCategoryName = subCategory?.name
  
  return {
    name: formData.name,
    description: formData.description,
    sku: formData.sku,
    friendlyUrl: formData.slug || generateSlug(formData.name),
    price: formData.sellingPrice,
    discountPrice: formData.discountType !== 'NONE' 
      ? calculateFinalPrice(formData.sellingPrice, formData.discountType, formData.discountValue)
      : undefined,
    stockQuantity: formData.stockQuantity,
    imageUrl: formData.images[0] || '',
    categoryId: formData.categoryId,
    categoryType: determineCategoryType(categoryName),
    subCategory: subCategoryName,
    categoryAttributes: buildCategoryAttributes(formData, categoryName, brandName),
    brandId: formData.brandId || 0,
    shopId: shopId,
    tags: extractTags(formData.name, formData.description, categoryName),
    featured: formData.featured
  }
}

/**
 * Determine category type from category name
 */
function determineCategoryType(categoryName: string): string {
  const mapping: Record<string, string> = {
    'Electronics': 'ELECTRONICS',
    'Fashion & Apparel': 'FASHION',
    'Home & Living': 'HOME',
    'Beauty, Health & Personal Care': 'BEAUTY',
    'Grocery & Essentials': 'GROCERY',
    'Sports, Fitness & Outdoor': 'SPORTS',
    'Toys, Kids & Baby': 'TOYS',
    'Books, Office & Stationery': 'BOOKS',
    'Automotive': 'AUTOMOTIVE',
    'Industrial & B2B': 'INDUSTRIAL',
    'Digital Products': 'DIGITAL',
    'Luxury & Specialty': 'LUXURY',
    'Services': 'SERVICES'
  }
  
  return mapping[categoryName] || 'OTHER'
}

/**
 * Build category-specific attributes
 */
function buildCategoryAttributes(
  formData: ProductFormData,
  categoryName: string,
  brandName?: string
): CategoryAttributes {
  const attributes: CategoryAttributes = {}
  
  // Add brand
  if (brandName) {
    attributes.brand = brandName
  }
  
  // Category-specific attributes
  if (categoryName.toLowerCase().includes('electronic') || 
      categoryName.toLowerCase().includes('smartphone') ||
      categoryName.toLowerCase().includes('laptop')) {
    attributes.type = 'SMARTPHONE' // or 'LAPTOP', etc.
  }
  
  // Add any custom attributes from form
  if (formData.attributes) {
    Object.assign(attributes, formData.attributes)
  }
  
  return attributes
}

/**
 * Extract tags from product name and description
 */
function extractTags(name: string, description: string, categoryName: string): string[] {
  const text = `${name} ${description} ${categoryName}`.toLowerCase()
  
  // Remove common words
  const stopWords = new Set(['the', 'and', 'for', 'with', 'from', 'this', 'that', 'are', 'was', 'were'])
  
  const words = text
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word))
  
  // Return unique tags, limited to 10
  return [...new Set(words)].slice(0, 10)
}
