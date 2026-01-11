"use client"

import React from 'react'
import { useForm } from 'react-hook-form'
import { useCreateProduct, useCategories, useBrands } from '@/features/products/hooks/use-products'
import ProductImageUploader from '@/components/ProductImageUploader'
import CategoryRequestModal from '@/components/CategoryRequestModal'
import { productImagesApi } from '@/lib/api/product-images'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type FormValues = {
  name: string
  price: number
  discountPrice?: number
  stockQuantity?: number
  categoryId?: number
  newCategoryName?: string
  brandId?: number
  imageUrl?: string
  description?: string
}

export default function CreateProductPage() {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({ defaultValues: { price: 0, stockQuantity: 0 } })
  const createMut = useCreateProduct()
  const categories = useCategories()
  const brands = useBrands()
  const router = useRouter()

  // Defensive lists in case API returns wrapped objects
  const categoryList: any[] = Array.isArray(categories.data)
    ? categories.data
    : (categories.data as any)?.categories ?? (categories.data as any)?.items ?? [];

  const brandList: any[] = Array.isArray(brands.data)
    ? brands.data
    : (brands.data as any)?.brands ?? (brands.data as any)?.items ?? [];

  const [createdProductId, setCreatedProductId] = React.useState<string | null>(null)
  const [images, setImages] = React.useState<any[]>([])
  // Remove direct new category creation for sellers
  const [showRequestModal, setShowRequestModal] = React.useState(false)

  const onSubmit = async (data: FormValues) => {
    try {
      let product;
      if (showRequestModal && data.newCategoryName) {
        // Call auto-create category API
        product = await fetch('/api/products/with-category', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.name,
            price: data.price,
            discountPrice: data.discountPrice,
            stockQuantity: data.stockQuantity,
            newCategoryName: data.newCategoryName,
            brandId: data.brandId,
            imageUrl: data.imageUrl,
            description: data.description,
          }),
        }).then(res => {
          if (!res.ok) throw new Error('Failed to create product: ' + res.status);
          return res.json();
        });
      } else {
        // Standard API (categoryId must exist)
        product = await createMut.mutateAsync(data as any);
      }
      toast.success('Product created');
      const pid = product?.id != null ? String(product.id) : null;
      if (pid) {
        setCreatedProductId(pid);
        // fetch any existing images for this product
        const imgs = await productImagesApi.getForProduct(pid).catch(() => []);
        setImages(imgs);
      } else {
        // fallback navigation
        router.push('/seller/products');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create product');
    }
  };

  // Live watched values for preview
  const watchedImage = watch('imageUrl') ?? '';
  const watchedDescription = watch('description') ?? '';
  const watchedName = watch('name') ?? '';
  const watchedPrice = watch('price') ?? 0;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Add Product</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: form inputs */}
        <div className="space-y-4">
        <div className="mb-3">
          <label className="block mb-1">Title</label>
          <Input {...register('name', { required: true })} />
          {errors.name && <div className="text-red-600 text-sm">Name is required</div>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="mb-3">
            <label className="block mb-1">Price</label>
            <Input type="number" step="0.01" {...register('price', { valueAsNumber: true, required: true })} />
            {errors.price && <div className="text-red-600 text-sm">Price is required</div>}
          </div>

          <div className="mb-3">
            <label className="block mb-1">Discount Price</label>
            <Input type="number" step="0.01" {...register('discountPrice', { valueAsNumber: true })} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="mb-3">
            <label className="block mb-1">Stock Quantity</label>
            <Input type="number" {...register('stockQuantity', { valueAsNumber: true })} />
          </div>

          <div className="mb-3">
            <label className="block mb-1">Image URL</label>
            <Input {...register('imageUrl')} placeholder="https://... or data:image/...base64,..." />
            <p className="text-xs text-muted-foreground mt-1">Paste a full image URL or a base64 data URL. Preview appears on the right.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="mb-3">
            <label className="block mb-1">Category</label>
            <select
              {...register('categoryId', { valueAsNumber: true })}
              className="rounded-md border px-3 py-2 w-full"
            >
              <option value="">Select category</option>
              {categoryList.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button
              type="button"
              className="mt-2 text-blue-600 underline text-sm"
              onClick={() => setShowRequestModal(true)}
            >
              Can't find your category? Request New
            </button>
          </div>
        {/* Category Request Modal */}
        {showRequestModal && (
          <CategoryRequestModal
            onClose={() => setShowRequestModal(false)}
            onSuccess={() => {
              toast.success('Request submitted! Admin will review it.');
              setShowRequestModal(false);
            }}
          />
        )}

          <div className="mb-3">
            <label className="block mb-1">Brand</label>
            <select {...register('brandId', { valueAsNumber: true })} className="rounded-md border px-3 py-2 w-full">
              <option value="">Select brand</option>
              {brandList.map((b: any) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-3">
          <label className="block mb-1">Description</label>
          <textarea {...register('description')} className="w-full rounded-md border px-3 py-2 h-32" />
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>Create</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
        </div>

        {/* Right: preview panel or uploader if product created */}
        <div className="border rounded-lg p-4 bg-white">
          <h3 className="text-lg font-medium mb-3">Live Preview</h3>
          <div className="flex flex-col gap-3">
            <div className="w-full h-56 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
              {watchedImage ? (
                // show provided image; allow data URLs
                <img src={watchedImage} alt={watchedName || 'Product image'} className="w-full h-full object-cover" />
              ) : (
                <div className="text-sm text-gray-500">No image provided</div>
              )}
            </div>

            <div>
              <h4 className="text-lg font-semibold">{watchedName || 'Product title'}</h4>
              <div className="text-primary font-medium">{watchedPrice ? `$${Number(watchedPrice).toFixed(2)}` : 'Price'}</div>
            </div>

            <div>
              <h5 className="text-sm font-medium mb-1">Description</h5>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{watchedDescription || 'Product description will appear here.'}</p>
            </div>
          </div>
        </div>
        {createdProductId && (
          <div className="lg:col-span-2">
            <h3 className="text-xl font-semibold mt-4">Manage Images</h3>
            <ProductImageUploader productId={createdProductId} images={images} onImagesChange={setImages} />
            <div className="flex justify-end mt-4">
              <button className="btn btn-primary" onClick={() => router.push('/seller/products')}>Finish</button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
