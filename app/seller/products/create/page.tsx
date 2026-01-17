"use client"

import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'
import { useCategories, useBrands, useCreateProduct } from '@/features/products/hooks/use-products'
import { productApi } from '@/features/products/api/product-api'
import { productFormSchema, type ProductFormData, generateSlug, generateSKU, calculateFinalPrice } from '@/lib/validation/schemas/product-form-schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Package, DollarSign, Warehouse, Image as ImageIcon, Settings, Truck, Search, FileText } from 'lucide-react'
import { VariantManager, type VariantCombination } from '@/components/product/VariantManager'

export default function CreateProductPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('basic')
  const [variantCombinations, setVariantCombinations] = useState<VariantCombination[]>([])
  
  const categories = useCategories()
  const brands = useBrands()
  const createMutation = useCreateProduct()

  // Fetch category tree for hierarchical data
  const { data: categoryTree } = useQuery({
    queryKey: ['categoryTree'],
    queryFn: () => productApi.getCategoryTree(),
    staleTime: 15 * 60 * 1000,
  })

  // Get all categories (including children) for sub-category lookup
  const allCategories = React.useMemo(() => {
    const raw = categories.data
    if (Array.isArray(raw)) return raw
    return []
  }, [categories.data])

  // Filter to show only top-level categories in main dropdown
  const categoryList = React.useMemo(() => {
    if (Array.isArray(categoryTree) && categoryTree.length > 0) {
      return categoryTree
    }
    // Fallback to filtered list
    return allCategories.filter((cat: any) => !cat.parentCategory && !cat.parent_id)
  }, [categoryTree, allCategories])

  const brandList = React.useMemo(() => {
    const raw = brands.data
    if (Array.isArray(raw)) return raw
    return []
  }, [brands.data])

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema) as any, // Type assertion to fix Zod default value type inference
    defaultValues: {
      sellingPrice: 0,
      mrp: 0,
      discountType: 'NONE',
      discountValue: 0,
      taxType: 'GST',
      taxPercentage: 18,
      stockQuantity: 0,
      stockStatus: 'IN_STOCK',
      minOrderQuantity: 1,
      maxOrderQuantity: 999,
      lowStockThreshold: 5,
      weightUnit: 'KG',
      dimensionUnit: 'CM',
      deliveryTime: 7,
      status: 'DRAFT',
      featured: false,
      newArrival: false,
      freeShipping: false,
      hasVariants: false,
      countryOfOrigin: 'India',
      images: [],
      primaryImageIndex: 0,
    }
  })

  // Watch values for auto-generation and preview
  const watchName = watch('name')
  const watchSellingPrice = watch('sellingPrice')
  const watchDiscountType = watch('discountType')
  const watchDiscountValue = watch('discountValue')
  const watchCategoryId = watch('categoryId')
  const watchBrandId = watch('brandId')

  // Auto-generate slug from name
  React.useEffect(() => {
    if (watchName) {
      setValue('slug', generateSlug(watchName))
    }
  }, [watchName, setValue])

  // Auto-generate SKU
  const handleGenerateSKU = () => {
    const category = categoryList.find((c: any) => c.id === watchCategoryId)
    const brand = brandList.find((b: any) => b.id === watchBrandId)
    const sku = generateSKU(category?.name || 'PROD', brand?.name)
    setValue('sku', sku)
  }

  // Calculate final price
  const finalPrice = React.useMemo(() => {
    return calculateFinalPrice(watchSellingPrice || 0, watchDiscountType, watchDiscountValue || 0)
  }, [watchSellingPrice, watchDiscountType, watchDiscountValue])

  const onSubmit = async (data: ProductFormData) => {
    try {
      console.log('Submitting product:', data)
      // await createMutation.mutateAsync(data as any)
      toast.success('Product created successfully!')
      router.push('/seller/products')
    } catch (error: any) {
      console.error('Error creating product:', error)
      toast.error(error?.message || 'Failed to create product')
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create New Product</h1>
        <p className="text-muted-foreground mt-1">Add a new product to your store catalog</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic" className="text-xs sm:text-sm">
                  <Package className="w-4 h-4 mr-1" />
                  Basic
                </TabsTrigger>
                <TabsTrigger value="pricing" className="text-xs sm:text-sm">
                  <DollarSign className="w-4 h-4 mr-1" />
                  Pricing
                </TabsTrigger>
                <TabsTrigger value="inventory" className="text-xs sm:text-sm">
                  <Warehouse className="w-4 h-4 mr-1" />
                  Inventory
                </TabsTrigger>
                <TabsTrigger value="advanced" className="text-xs sm:text-sm">
                  <Settings className="w-4 h-4 mr-1" />
                  Advanced
                </TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Essential product details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Product Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        {...register('name')}
                        placeholder="e.g., Samsung Galaxy S24 Ultra (12GB RAM, 256GB)"
                      />
                      <p className="text-xs text-muted-foreground">
                        Use format: Brand + Model + Key Feature. This appears in search results and product listings.
                      </p>
                      {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                    </div>

                    {/* SKU */}
                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU (Stock Keeping Unit) *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="sku"
                          {...register('sku')}
                          placeholder="e.g., MOB-SAM-S24U-881911"
                        />
                        <Button type="button" variant="outline" onClick={handleGenerateSKU}>
                          Generate
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Unique internal code for inventory tracking. Click "Generate" to auto-create from category and brand.
                      </p>
                      {errors.sku && <p className="text-sm text-red-500">{errors.sku.message}</p>}
                    </div>

                    {/* Category & Brand */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="categoryId">Category *</Label>
                        <Controller
                          name="categoryId"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categoryList.map((cat: any) => (
                                  <SelectItem key={cat.id} value={cat.id.toString()}>
                                    {cat.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        <p className="text-xs text-muted-foreground">Choose the main category. Sub-category will appear after selection.</p>
                        {errors.categoryId && <p className="text-sm text-red-500">{errors.categoryId.message}</p>}
                      </div>
                    </div>

                    {/* Sub-Category */}
                    <div className="space-y-2">
                      <Label htmlFor="subCategoryId">
                        Sub-Category {watchCategoryId ? `(Parent: ${watchCategoryId})` : '(Select category first)'}
                      </Label>
                      <Controller
                        name="subCategoryId"
                        control={control}
                        render={({ field }) => {
                          // Get sub-categories for the selected category
                          const selectedCategory = categoryList.find((c: any) => c.id === watchCategoryId)
                          const subCategories = selectedCategory?.children || []
                          
                          console.log('Sub-category debug:', {
                            watchCategoryId,
                            selectedCategory,
                            subCategories,
                            categoryListLength: categoryList.length
                          })
                          
                          return (
                            <Select 
                              onValueChange={(val) => field.onChange(val ? Number(val) : undefined)} 
                              value={field.value?.toString()}
                              disabled={!watchCategoryId}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={watchCategoryId ? "Select sub-category (optional)" : "Select a category first"} />
                              </SelectTrigger>
                              <SelectContent>
                                {subCategories.length > 0 ? (
                                  subCategories.map((subCat: any) => (
                                    <SelectItem key={subCat.id} value={subCat.id.toString()}>
                                      {subCat.name}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="none" disabled>
                                    No sub-categories available
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          )
                        }}
                      />
                    </div>

                    {/* Brand */}
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="brandId">Brand</Label>
                        <Controller
                          name="brandId"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select brand" />
                              </SelectTrigger>
                              <SelectContent>
                                {brandList.map((brand: any) => (
                                  <SelectItem key={brand.id} value={brand.id.toString()}>
                                    {brand.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>

                    {/* Short Description */}
                    <div className="space-y-2">
                      <Label htmlFor="shortDescription">Short Description</Label>
                      <Input
                        id="shortDescription"
                        {...register('shortDescription')}
                        placeholder="Brief product summary (max 500 chars)"
                        maxLength={500}
                      />
                    </div>

                    {/* Full Description */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="description">Full Description *</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const categoryName = categoryList.find((c: any) => c.id === watchCategoryId)?.name
                            const brandName = brandList.find((b: any) => b.id === watchBrandId)?.name
                            
                            const autoDesc = `Introducing the ${watchName || 'product'}${brandName ? ` by ${brandName}` : ''}. ${categoryName ? `Perfect for ${categoryName.toLowerCase()} needs.` : ''} This product combines quality, performance, and value to meet your expectations.`
                            
                            setValue('description', autoDesc)
                            toast.success('Description generated! Feel free to edit it.')
                          }}
                          disabled={!watchName}
                        >
                          ✨ Generate Description
                        </Button>
                      </div>
                      <Textarea
                        id="description"
                        {...register('description')}
                        placeholder="Detailed product description..."
                        className="min-h-[120px]"
                      />
                      <p className="text-xs text-muted-foreground">Detailed information shown on the product page. Include features, specifications, and benefits.</p>
                      {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pricing & Tax Tab */}
              <TabsContent value="pricing" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Pricing & Tax</CardTitle>
                    <CardDescription>Set product pricing and tax configuration</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* MRP & Selling Price */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="mrp">MRP (₹) *</Label>
                        <Input
                          id="mrp"
                          type="number"
                          step="0.01"
                          {...register('mrp', { valueAsNumber: true })}
                          placeholder="0.00"
                        />
                        <p className="text-xs text-muted-foreground">Maximum Retail Price (printed price)</p>
                        {errors.mrp && <p className="text-sm text-red-500">{errors.mrp.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sellingPrice">Selling Price (₹) *</Label>
                        <Input
                          id="sellingPrice"
                          type="number"
                          step="0.01"
                          {...register('sellingPrice', { valueAsNumber: true })}
                          placeholder="0.00"
                        />
                        <p className="text-xs text-muted-foreground">Actual price customers pay (should be ≤ MRP)</p>
                        {errors.sellingPrice && <p className="text-sm text-red-500">{errors.sellingPrice.message}</p>}
                      </div>
                    </div>

                    {/* Discount */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="discountType">Discount Type</Label>
                        <Controller
                          name="discountType"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="NONE">No Discount</SelectItem>
                                <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                                <SelectItem value="FLAT">Flat Amount (₹)</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="discountValue">Discount Value</Label>
                        <Input
                          id="discountValue"
                          type="number"
                          step="0.01"
                          {...register('discountValue', { valueAsNumber: true })}
                          placeholder="0"
                          disabled={watchDiscountType === 'NONE'}
                        />
                      </div>
                    </div>

                    {/* Final Price Display */}
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Final Price:</span>
                        <span className="text-2xl font-bold text-primary">₹{finalPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Tax Configuration */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="taxType">Tax Type</Label>
                        <Controller
                          name="taxType"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="GST">GST</SelectItem>
                                <SelectItem value="VAT">VAT</SelectItem>
                                <SelectItem value="NONE">No Tax</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="taxPercentage">Tax Percentage (%)</Label>
                        <Input
                          id="taxPercentage"
                          type="number"
                          step="0.01"
                          {...register('taxPercentage', { valueAsNumber: true })}
                          placeholder="18"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Inventory Tab */}
              <TabsContent value="inventory" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Inventory Management</CardTitle>
                    <CardDescription>Manage stock and availability</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Stock Quantity & Status */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                        <Input
                          id="stockQuantity"
                          type="number"
                          {...register('stockQuantity', { valueAsNumber: true })}
                          placeholder="0"
                        />
                        {errors.stockQuantity && <p className="text-sm text-red-500">{errors.stockQuantity.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stockStatus">Stock Status</Label>
                        <Controller
                          name="stockStatus"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="IN_STOCK">In Stock</SelectItem>
                                <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                                <SelectItem value="PRE_ORDER">Pre-Order</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>

                    {/* Order Limits */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="minOrderQuantity">Min Order Qty</Label>
                        <Input
                          id="minOrderQuantity"
                          type="number"
                          {...register('minOrderQuantity', { valueAsNumber: true })}
                          placeholder="1"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="maxOrderQuantity">Max Order Qty</Label>
                        <Input
                          id="maxOrderQuantity"
                          type="number"
                          {...register('maxOrderQuantity', { valueAsNumber: true })}
                          placeholder="999"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lowStockThreshold">Low Stock Alert</Label>
                        <Input
                          id="lowStockThreshold"
                          type="number"
                          {...register('lowStockThreshold', { valueAsNumber: true })}
                          placeholder="5"
                        />
                      </div>
                    </div>

                    {/* Warehouse */}
                    <div className="space-y-2">
                      <Label htmlFor="warehouse">Warehouse / Location</Label>
                      <Input
                        id="warehouse"
                        {...register('warehouse')}
                        placeholder="e.g., Warehouse A, Mumbai"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping */}
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping & Logistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Weight */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.01"
                          {...register('weight', { valueAsNumber: true })}
                          placeholder="0.00"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="weightUnit">Unit</Label>
                        <Controller
                          name="weightUnit"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="KG">Kilograms (kg)</SelectItem>
                                <SelectItem value="G">Grams (g)</SelectItem>
                                <SelectItem value="LB">Pounds (lb)</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>

                    {/* Dimensions */}
                    <div className="grid grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="length">Length</Label>
                        <Input
                          id="length"
                          type="number"
                          step="0.01"
                          {...register('length', { valueAsNumber: true })}
                          placeholder="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="width">Width</Label>
                        <Input
                          id="width"
                          type="number"
                          step="0.01"
                          {...register('width', { valueAsNumber: true })}
                          placeholder="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="height">Height</Label>
                        <Input
                          id="height"
                          type="number"
                          step="0.01"
                          {...register('height', { valueAsNumber: true })}
                          placeholder="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dimensionUnit">Unit</Label>
                        <Controller
                          name="dimensionUnit"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="CM">CM</SelectItem>
                                <SelectItem value="M">M</SelectItem>
                                <SelectItem value="IN">IN</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>

                    {/* Shipping Charges */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="shippingCharges">Shipping Charges (₹)</Label>
                        <Input
                          id="shippingCharges"
                          type="number"
                          step="0.01"
                          {...register('shippingCharges', { valueAsNumber: true })}
                          placeholder="0.00"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="deliveryTime">Delivery Time (days)</Label>
                        <Input
                          id="deliveryTime"
                          type="number"
                          {...register('deliveryTime', { valueAsNumber: true })}
                          placeholder="7"
                        />
                      </div>
                    </div>

                    {/* Free Shipping */}
                    <div className="flex items-center space-x-2">
                      <Controller
                        name="freeShipping"
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            id="freeShipping"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                      <Label htmlFor="freeShipping">Offer Free Shipping</Label>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced" className="space-y-4 mt-4">
                {/* SEO */}
                <Card>
                  <CardHeader>
                    <CardTitle>SEO & Visibility</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="seoTitle">SEO Title</Label>
                      <Input
                        id="seoTitle"
                        {...register('seoTitle')}
                        placeholder="Product title for search engines (max 60 chars)"
                        maxLength={60}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seoDescription">SEO Description</Label>
                      <Textarea
                        id="seoDescription"
                        {...register('seoDescription')}
                        placeholder="Meta description (max 160 chars)"
                        maxLength={160}
                        className="min-h-[80px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slug">URL Slug</Label>
                      <Input
                        id="slug"
                        {...register('slug')}
                        placeholder="product-url-slug"
                      />
                      <p className="text-xs text-muted-foreground">Auto-generated from product name</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="status">Product Status</Label>
                        <Controller
                          name="status"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="DRAFT">Draft</SelectItem>
                                <SelectItem value="PUBLISHED">Published</SelectItem>
                                <SelectItem value="INACTIVE">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      <div className="space-y-4 pt-8">
                        <div className="flex items-center space-x-2">
                          <Controller
                            name="featured"
                            control={control}
                            render={({ field }) => (
                              <Checkbox
                                id="featured"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            )}
                          />
                          <Label htmlFor="featured">Featured Product</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Controller
                            name="newArrival"
                            control={control}
                            render={({ field }) => (
                              <Checkbox
                                id="newArrival"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            )}
                          />
                          <Label htmlFor="newArrival">New Arrival</Label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Compliance */}
                <Card>
                  <CardHeader>
                    <CardTitle>Compliance & Legal</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="hsnCode">HSN / SAC Code</Label>
                        <Input
                          id="hsnCode"
                          {...register('hsnCode')}
                          placeholder="e.g., 8517"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="countryOfOrigin">Country of Origin</Label>
                        <Input
                          id="countryOfOrigin"
                          {...register('countryOfOrigin')}
                          placeholder="India"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="manufacturer">Manufacturer Details</Label>
                      <Input
                        id="manufacturer"
                        {...register('manufacturer')}
                        placeholder="Manufacturer name and address"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="warrantyPeriod">Warranty Period</Label>
                        <Input
                          id="warrantyPeriod"
                          type="number"
                          {...register('warrantyPeriod', { valueAsNumber: true })}
                          placeholder="12"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="warrantyUnit">Warranty Unit</Label>
                        <Controller
                          name="warrantyUnit"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select unit" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="DAYS">Days</SelectItem>
                                <SelectItem value="MONTHS">Months</SelectItem>
                                <SelectItem value="YEARS">Years</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="returnPolicy">Return Policy</Label>
                      <Textarea
                        id="returnPolicy"
                        {...register('returnPolicy')}
                        placeholder="Describe the return policy for this product"
                        className="min-h-[80px]"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Form Actions */}
            <div className="flex justify-between mt-6">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <div className="flex gap-2">
                <Button type="submit" variant="outline" disabled={isSubmitting}>
                  Save as Draft
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Product'}
                </Button>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Live Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white rounded-lg border p-4 space-y-3">
                    {/* Image Placeholder */}
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-300" />
                    </div>

                    {/* Product Info */}
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-2">
                        {watchName || 'Product Name'}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {categoryList.find((c: any) => c.id === watchCategoryId)?.name || 'Category'}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-primary">
                        ₹{finalPrice.toFixed(2)}
                      </span>
                      {watchDiscountType !== 'NONE' && watchSellingPrice > 0 && (
                        <span className="text-sm text-muted-foreground line-through">
                          ₹{watchSellingPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2">
                      {watch('featured') && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Featured
                        </span>
                      )}
                      {watch('newArrival') && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          New
                        </span>
                      )}
                      {watch('freeShipping') && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Free Shipping
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
