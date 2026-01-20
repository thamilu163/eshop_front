"use client"

import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth-nextauth'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'
import { useCategories, useBrands, useCreateProduct } from '@/features/products/hooks/use-products'
import { productApi } from '@/features/products/api/product-api'
import { productFormSchema, type ProductFormData, generateSlug, generateSKU, calculateFinalPrice } from '@/lib/validation/schemas/product-form-schema'
import { mapFormToBackendRequest } from '@/lib/product/backend-mapper'
import { PRODUCT_FORM_CONSTANTS } from '@/lib/product/constants'
import type { Category, Brand } from '@/types/product'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Package, DollarSign, Warehouse, Image as ImageIcon, Settings } from 'lucide-react'

export default function CreateProductPage() {
  const router = useRouter()
  const { user, isLoading, hasRole } = useAuth()
  const [activeTab, setActiveTab] = useState('basic')
  
  const categories = useCategories()
  const brands = useBrands()
  const createMutation = useCreateProduct()

  // Fetch category tree for hierarchical data
  const { data: categoryTree } = useQuery({
    queryKey: ['categoryTree'],
    queryFn: () => productApi.getCategoryTree(),
    staleTime: PRODUCT_FORM_CONSTANTS.STALE_TIME_MS,
  })

  // Get all categories (including children) for sub-category lookup
  const allCategories = React.useMemo((): Category[] => {
    const raw = categories.data
    if (Array.isArray(raw)) return raw as Category[]
    return []
  }, [categories.data])

  // Filter to show only top-level categories in main dropdown
  const categoryList = React.useMemo((): Category[] => {
    if (Array.isArray(categoryTree) && categoryTree.length > 0) {
      return categoryTree as Category[]
    }
    // Fallback to filtered list
    return allCategories.filter(cat => !cat.parentCategory && !cat.parent_id)
  }, [categoryTree, allCategories])

  const brandList = React.useMemo((): Brand[] => {
    const raw = brands.data
    if (Array.isArray(raw)) return raw as Brand[]
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(productFormSchema) as any,
    defaultValues: {
      sellingPrice: 0,
      mrp: 0,
      discountType: 'NONE',
      discountValue: 0,
      taxType: 'GST',
      taxPercentage: PRODUCT_FORM_CONSTANTS.DEFAULT_TAX_PERCENTAGE,
      stockQuantity: 0,
      stockStatus: PRODUCT_FORM_CONSTANTS.DEFAULT_STOCK_STATUS,
      minOrderQuantity: PRODUCT_FORM_CONSTANTS.DEFAULT_MIN_ORDER_QUANTITY,
      maxOrderQuantity: PRODUCT_FORM_CONSTANTS.DEFAULT_MAX_ORDER_QUANTITY,
      lowStockThreshold: PRODUCT_FORM_CONSTANTS.DEFAULT_LOW_STOCK_THRESHOLD,
      weightUnit: PRODUCT_FORM_CONSTANTS.DEFAULT_WEIGHT_UNIT,
      dimensionUnit: PRODUCT_FORM_CONSTANTS.DEFAULT_DIMENSION_UNIT,
      deliveryTime: PRODUCT_FORM_CONSTANTS.DEFAULT_DELIVERY_DAYS,
      status: PRODUCT_FORM_CONSTANTS.DEFAULT_PRODUCT_STATUS,
      featured: false,
      newArrival: false,
      freeShipping: false,
      hasVariants: false,
      countryOfOrigin: PRODUCT_FORM_CONSTANTS.DEFAULT_COUNTRY_OF_ORIGIN,
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
  const watchSubCategoryId = watch('subCategoryId')
  const watchBrandId = watch('brandId')

  // Auto-generate slug from name
  React.useEffect(() => {
    if (watchName) {
      setValue('slug', generateSlug(watchName))
    }
  }, [watchName, setValue])

  // Auto-generate SKU
  const handleGenerateSKU = React.useCallback(() => {
    const category = categoryList.find(c => c.id === watchCategoryId)
    const brand = brandList.find(b => b.id === watchBrandId)
    const sku = generateSKU(category?.name || 'PROD', brand?.name)
    setValue('sku', sku)
  }, [categoryList, brandList, watchCategoryId, watchBrandId, setValue])

  // Get dynamic helper text for product name
  const productNameHelperText = React.useMemo(() => {
    if (!watchCategoryId) {
      return "Use format: Brand + Model + Key Feature. This appears in search results and product listings."
    }

    const category = categoryList.find(c => c.id === watchCategoryId)
    const categoryName = category?.name?.toLowerCase() || ''
    
    if (categoryName.includes('electronic') || categoryName.includes('mobile') || categoryName.includes('laptop')) {
      return "Format: Brand + Model + Specs (RAM/Storage) + Color (e.g., Samsung Galaxy S24 Ultra 12GB/256GB Titanium Gray)"
    }
    
    if (categoryName.includes('fashion') || categoryName.includes('clothing') || categoryName.includes('wear')) {
      return "Format: Brand + Type + Material + Color + Gender (e.g., Levi's Men's 501 Original Fit Cotton Jeans Blue)"
    }

    if (categoryName.includes('home') || categoryName.includes('furniture')) {
      return "Format: Brand + Product + Material + Dimensions (e.g., IKEA Billy Bookcase Engineered Wood 80x28x202 cm)"
    }

    if (categoryName.includes('beauty') || categoryName.includes('health')) {
      return "Format: Brand + Product Name + Volume/Weight + Variant (e.g., Nivea Soft Light Moisturizer Cream 300ml)"
    }
    
    if (categoryName.includes('book')) {
      return "Format: Title + Author + Binding + Edition (e.g., Atomic Habits by James Clear Hardcover 1st Edition)"
    }

    if (categoryName.includes('grocery') || categoryName.includes('essential') || categoryName.includes('food') || categoryName.includes('fruit') || categoryName.includes('vegetable')) {
      return "Format: Brand (if any) + Product Name + Quantity/Weight (e.g., Tata Salt Iodized 1kg)"
    }

    return `Use format: Brand + Model + Key Feature appropriate for ${category?.name || 'this category'}`
  }, [watchCategoryId, categoryList])

  // Get dynamic placeholder for product name
  const productNamePlaceholder = React.useMemo(() => {
    if (!watchCategoryId) {
      return "e.g., Samsung Galaxy S24 Ultra (12GB RAM, 256GB)"
    }

    const category = categoryList.find(c => c.id === watchCategoryId)
    const categoryName = category?.name?.toLowerCase() || ''
    
    if (categoryName.includes('electronic') || categoryName.includes('mobile') || categoryName.includes('laptop')) {
      return "e.g., Samsung Galaxy S24 Ultra 12GB/256GB Titanium Gray"
    }
    
    if (categoryName.includes('fashion') || categoryName.includes('clothing') || categoryName.includes('wear')) {
      return "e.g., Levi's Men's 501 Original Fit Cotton Jeans Blue"
    }

    if (categoryName.includes('home') || categoryName.includes('furniture')) {
      return "e.g., IKEA Billy Bookcase Engineered Wood 80x28x202 cm"
    }

    if (categoryName.includes('beauty') || categoryName.includes('health')) {
      return "e.g., Nivea Soft Light Moisturizer Cream 300ml"
    }
    
    if (categoryName.includes('book')) {
      return "e.g., Atomic Habits by James Clear Hardcover 1st Edition"
    }

    if (categoryName.includes('grocery') || categoryName.includes('essential') || categoryName.includes('food') || categoryName.includes('fruit') || categoryName.includes('vegetable')) {
      return "e.g., Fortune Sunlite Refined Sunflower Oil 1L"
    }

    return "e.g., Product Name + Variant + Key Feature"
  }, [watchCategoryId, categoryList])

  // Calculate final price
  const finalPrice = React.useMemo(() => {
    return calculateFinalPrice(watchSellingPrice || 0, watchDiscountType, watchDiscountValue || 0)
  }, [watchSellingPrice, watchDiscountType, watchDiscountValue])

  // Form submission with backend mapping
  const onSubmit = React.useCallback(async (data: ProductFormData) => {
    try {
      // Get category and brand details for mapping
      // const category = categoryList.find(c => c.id === data.categoryId)
      // const subCategory = category?.children?.find((sc: any) => sc.id === data.subCategoryId)
      // const brand = brandList.find(b => b.id === data.brandId)
      
      // Get shop/store ID from session
      // const shopId = user?.storeId || user?.shopId || 1
      
      // Map form data to backend API format
      // Submit to backend
      const backendRequest = mapFormToBackendRequest(
        data,
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         (categoryList as any[]).find(c => c.id === data.categoryId),
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         (categoryList as any[]).find(c => c.id === data.categoryId)?.children?.find((sc: any) => sc.id === data.subCategoryId),
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         (brandList as any[]).find(b => b.id === data.brandId)?.name,
         1 // Default store ID for now until we have it in user session
      )
      
      // Submit to backend
      await createMutation.mutateAsync(backendRequest as unknown as Record<string, unknown>)
      
      toast.success('Product created successfully!')
      router.push('/seller/products')
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to create product'
      toast.error(errorMessage)
    }
  }, [categoryList, brands.data, user, createMutation, router])

  // Check if selected category is "Grocery & Essentials" and sub-category is "Fruits & Vegetables"
  const isGrocery = React.useMemo(() => {
    if (!watchCategoryId || !watchSubCategoryId) return false
    
    // Find selected category and sub-category names
    const category = categoryList.find(c => c.id === watchCategoryId)
    const categoryName = category?.name?.toLowerCase() || ''
    
    // Note: In a real app we might check IDs, but strict string matching is safer for now if IDs vary
    // Checking for "Grocery" main category
    const isGroceryMain = categoryName.includes('grocery') || categoryName.includes('essential')
    
    if (!isGroceryMain) return false

    // Check sub-category
    const subCategories = category?.children || []
    const subCategory = subCategories.find((sc: Category) => sc.id === watchSubCategoryId)
    const subCategoryName = subCategory?.name?.toLowerCase() || ''

    return subCategoryName.includes('fruit') || subCategoryName.includes('vegetable')
  }, [watchCategoryId, watchSubCategoryId, categoryList])

  // Handle next tab
  const handleNext = React.useCallback(() => {
    switch (activeTab) {
      case 'basic':
        // If grocery, go to details tab, else pricing
        if (isGrocery) {
          setActiveTab('details')
        } else {
          setActiveTab('pricing')
        }
        break
      case 'details':
        setActiveTab('pricing')
        break
      case 'pricing':
        setActiveTab('inventory')
        break
      case 'inventory':
        setActiveTab('advanced')
        break
      default:
        break
    }
  }, [activeTab, isGrocery])

  // Authentication is handled by the middleware and layout Guard
  // We just need to wait for auth to load to access user ID
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Double check role just in case (though Layout guard catches this)
  if (!user || (!hasRole('SELLER') && !hasRole('ADMIN'))) {
    return null
  }

  // Add loading and error states
  if (categories.isLoading || brands.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product data...</p>
        </div>
      </div>
    )
  }

  if (categories.isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Error Loading Categories</CardTitle>
            <CardDescription>
              {categories.error?.message || 'Unable to load product categories'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => categories.refetch()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (brands.isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Error Loading Brands</CardTitle>
            <CardDescription>
              {brands.error?.message || 'Unable to load brands'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => brands.refetch()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
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
              <TabsList className={`grid w-full ${isGrocery ? 'grid-cols-5' : 'grid-cols-4'}`}>
                <TabsTrigger value="basic" className="text-xs sm:text-sm">
                  <Package className="w-4 h-4 mr-1" />
                  Basic
                </TabsTrigger>
                {isGrocery && (
                  <TabsTrigger value="details" className="text-xs sm:text-sm">
                    <Package className="w-4 h-4 mr-1" />
                    Freshness
                  </TabsTrigger>
                )}
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
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
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
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          const selectedCategory = categoryList.find((c: any) => c.id === watchCategoryId)
                          const subCategories = selectedCategory?.children || []
                          
                          /* console.log removed */
                          
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
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
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

                    {/* Product Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        {...register('name')}
                        placeholder={productNamePlaceholder}
                      />
                      <p className="text-xs text-muted-foreground">
                        {productNameHelperText}
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
                      <Label htmlFor="description">Full Description *</Label>
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

              <TabsContent value="details" className="space-y-4 mt-4">
                {/* 3. Quality & Freshness Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>3. Quality & Freshness Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Freshness Type</Label>
                        <Controller
                          name="attributes.freshnessType"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Fresh">Fresh</SelectItem>
                                <SelectItem value="Organic">Organic</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Grade / Quality</Label>
                        <Controller
                          name="attributes.grade"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Grade" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="A">Grade A</SelectItem>
                                <SelectItem value="Premium">Premium</SelectItem>
                                <SelectItem value="Standard">Standard</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Ripeness Level</Label>
                        <Controller
                          name="attributes.ripeness"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Raw">Raw</SelectItem>
                                <SelectItem value="Semi-ripe">Semi-ripe</SelectItem>
                                <SelectItem value="Ripe">Ripe</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Shelf Life</Label>
                        <Input {...register('attributes.shelfLife')} placeholder="e.g., 3-5 days" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 4. Source Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>4. Source Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Origin / Farm Location</Label>
                        <Input {...register('attributes.origin')} placeholder="e.g., Nashik Farms" />
                      </div>
                      <div className="space-y-2">
                        <Label>Harvest Date (Optional)</Label>
                        <Input type="date" {...register('attributes.harvestDate')} />
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                         <Controller
                          name="attributes.isOrganic"
                          control={control}
                          render={({ field }) => (
                            <Checkbox 
                              checked={field.value === 'Yes'}
                              onCheckedChange={(checked) => field.onChange(checked ? 'Yes' : 'No')}
                            />
                          )}
                        />
                        <Label>Organic Certified</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                         <Controller
                          name="attributes.isPesticideFree"
                          control={control}
                          render={({ field }) => (
                            <Checkbox 
                              checked={field.value === 'Yes'}
                              onCheckedChange={(checked) => field.onChange(checked ? 'Yes' : 'No')}
                            />
                          )}
                        />
                        <Label>Pesticide Free</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 5. Packaging & Storage */}
                <Card>
                  <CardHeader>
                    <CardTitle>5. Packaging & Storage</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Packaging Type</Label>
                        <Controller
                          name="attributes.packagingType"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Loose">Loose</SelectItem>
                                <SelectItem value="Packed">Packed</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Storage Instructions</Label>
                        <Input {...register('attributes.storageInstructions')} placeholder="e.g., Store in refrigerator" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                 {/* 6. Optional (Nice to Have) */}
                <Card>
                  <CardHeader>
                    <CardTitle>6. Optional Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label>Nutrition Info</Label>
                        <Textarea {...register('attributes.nutritionInfo')} placeholder="e.g., Calories: 52, Fat: 0.2g..." />
                      </div>
                       <div className="space-y-2">
                        <Label>Usage Tips</Label>
                        <Textarea {...register('attributes.usageTips')} placeholder="e.g., Best for juice / salad" />
                      </div>
                       <div className="grid grid-cols-2 gap-4">
                         <div className="flex items-center space-x-2 py-4">
                           <Controller
                            name="attributes.isSeasonal"
                            control={control}
                            render={({ field }) => (
                              <Checkbox 
                                checked={field.value === 'Yes'}
                                onCheckedChange={(checked) => field.onChange(checked ? 'Yes' : 'No')}
                              />
                            )}
                          />
                          <Label>Seasonal Product</Label>
                        </div>
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
                {activeTab !== 'advanced' ? (
                  <Button type="button" onClick={handleNext}>
                    Next
                  </Button>
                ) : (
                  <>
                    <Button type="submit" variant="outline" disabled={isSubmitting}>
                      Save as Draft
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Creating...' : 'Create Product'}
                    </Button>
                  </>
                )}
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
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
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
