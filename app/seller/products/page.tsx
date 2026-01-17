"use client"

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useProducts, useCategories } from '@/features/products/hooks/use-products'
import { toast } from 'sonner'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { productApi } from '@/features/products/api/product-api'
import type { ProductDTO } from '@/types'

export default function SellerProductsPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<number | undefined>(undefined)
  const [page, setPage] = useState(1)
  const [size] = useState(20)
  const params = useMemo(() => ({ page, size, query, categoryId: category }), [page, size, query, category])

  const productsQuery = useProducts(params)
  const categoriesQuery = useCategories()
  const qc = useQueryClient()

  const products = productsQuery.data?.content ?? []
  const totalPages = productsQuery.data?.totalPages ?? 1

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValues, setEditValues] = useState<{ name?: string; price?: number }>({})
  const [selected, setSelected] = useState<Record<number, boolean>>({})
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  // mutations with optimistic updates
  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<ProductDTO> }) => productApi.updateProduct(id, payload),
    onMutate: async ({ id, payload }) => {
      await qc.cancelQueries({ queryKey: ['products'] })
      const qdata = qc.getQueriesData({ queryKey: ['products'] })
      const snapshot = qdata.map(([k, d]) => [k, d])
      qdata.forEach(([key, data]: any) => {
        if (!data || !data.content) return
        qc.setQueryData(key, (old: any) => ({ ...old, content: old.content.map((p: any) => p.id === id ? { ...p, ...payload } : p) }))
      })
      return { snapshot }
    },
    onError: (err, variables, context: any) => {
      context?.snapshot?.forEach(([key, data]: any) => qc.setQueryData(key, data))
      toast.error('Update failed')
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['products'] }),
    onSuccess: () => toast.success('Product updated'),
  })

  const deleteMut = useMutation({
    mutationFn: (id: number) => productApi.deleteProduct(id),
    onMutate: async (id: number) => {
      await qc.cancelQueries({ queryKey: ['products'] })
      const qdata = qc.getQueriesData({ queryKey: ['products'] })
      const snapshot = qdata.map(([k, d]) => [k, d])
      qdata.forEach(([key, data]: any) => {
        if (!data || !data.content) return
        qc.setQueryData(key, (old: any) => ({ ...old, content: old.content.filter((p: any) => p.id !== id), totalElements: Math.max(0, (old.totalElements ?? 0) - 1) }))
      })
      return { snapshot }
    },
    onError: (err, id, context: any) => {
      context?.snapshot?.forEach(([key, data]: any) => qc.setQueryData(key, data))
      toast.error('Delete failed')
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['products'] }),
    onSuccess: () => toast.success('Product deleted'),
  })

  const bulkDelete = async (ids: number[]) => {
    if (ids.length === 0) return toast('No products selected')
    const qdata = qc.getQueriesData({ queryKey: ['products'] })
    const snapshot = qdata.map(([k, d]) => [k, d])
    try {
      qdata.forEach(([key, data]: any) => {
        if (!data || !data.content) return
        qc.setQueryData(key, (old: any) => ({ ...old, content: old.content.filter((p: any) => !ids.includes(p.id)), totalElements: Math.max(0, (old.totalElements ?? 0) - ids.length) }))
      })
      const results = await Promise.all(ids.map(id => fetch(`/api/products/${id}`, { method: 'DELETE' })))
      if (results.some(r => !r.ok)) throw new Error('some deletes failed')
      toast.success(`Deleted ${ids.length} products`)
      setSelected({})
    } catch (err) {
      snapshot.forEach(([key, data]: any) => qc.setQueryData(key, data))
      toast.error('Bulk delete failed')
    } finally {
      qc.invalidateQueries({ queryKey: ['products'] })
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Products</h1>
        <div className="flex gap-2 items-center">
          <input
            aria-label="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search products..."
            className="px-3 py-2 border rounded-md"
          />
          <select
            value={category ?? ''}
            onChange={(e) => { setCategory(e.target.value ? Number(e.target.value) : undefined); setPage(1); }}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All categories</option>
            {(Array.isArray(categoriesQuery.data) 
              ? categoriesQuery.data 
              : (categoriesQuery.data as any)?.categories ?? (categoriesQuery.data as any)?.items ?? []
            ).map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <Link href="/seller/products/create">
            <Button className="ml-2">Add Product</Button>
          </Link>
        </div>
      </div>

      {productsQuery.isLoading && (
        <div className="flex items-center justify-center py-8">
           <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
           <span className="ml-2 text-gray-600">Loading products...</span>
        </div>
      )}

      {productsQuery.isError && (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">
          <p className="font-semibold">Error loading products</p>
          <p className="text-sm">{(productsQuery.error as any)?.message || 'Please try again later.'}</p>
        </div>
      )}

      {!productsQuery.isLoading && !productsQuery.isError && products.length === 0 && (
         <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 text-center">
            <h3 className="text-lg font-semibold">No products found</h3>
            <p className="text-muted-foreground mt-1 mb-4">Get started by creating your first product listing.</p>
             <Link href="/seller/products/create">
                <Button>Add New Product</Button>
             </Link>
         </div>
      )}

      {!productsQuery.isLoading && !productsQuery.isError && products.length > 0 && (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full table-auto border-collapse">
            <thead className="bg-muted/50">
              <tr className="text-left border-b">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: ProductDTO, idx: number) => (
                <tr key={p.id} className="border-b transition-colors hover:bg-muted/20">
                  <td className="px-4 py-3">{((productsQuery.data?.number ?? 1) - 1) * size + idx + 1}</td>
                  <td className="px-4 py-3">
                    {editingId === p.id ? (
                      <input className="border rounded px-2 py-1 w-full" value={editValues.name ?? p.name} onChange={(e) => setEditValues(ev => ({ ...ev, name: e.target.value }))} autoFocus />
                    ) : (
                      <span className="font-medium">{p.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === p.id ? (
                      <input className="border rounded px-2 py-1 w-24" type="number" value={editValues.price ?? p.price} onChange={(e) => setEditValues(ev => ({ ...ev, price: Number(e.target.value) }))} />
                    ) : (
                      `₹${p.price.toFixed(2)}`
                    )}
                  </td>
                  <td className="px-4 py-3">
                     <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        (p.stockQuantity ?? 0) > 0 
                          ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20' 
                          : 'bg-red-50 text-red-700 ring-1 ring-red-600/20'
                      }`}>
                      {p.stockQuantity ?? 0 > 0 ? 'In Stock' : 'Out of Stock'} ({p.stockQuantity ?? 0})
                     </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    {editingId === p.id ? (
                      <div className="flex justify-end gap-2">
                         <Button size="sm" variant="ghost" onClick={() => { setEditingId(null); setEditValues({}); }}>Cancel</Button>
                         <Button size="sm" onClick={() => {
                          updateMut.mutateAsync({ id: p.id, payload: { name: editValues.name, price: editValues.price } }).then(() => setEditingId(null))
                        }}>Save</Button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setEditingId(p.id); setEditValues({ name: p.name, price: p.price }); }}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => { setConfirmDeleteId(p.id); }}>Delete</Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <div>Page {page} / {totalPages}</div>
        <div className="flex gap-2">
          <button className="px-3 py-1 border rounded" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</button>
          <button className="px-3 py-1 border rounded" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
        </div>
      </div>
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Confirm delete</h3>
            <p className="mb-4">Are you sure you want to delete this product?</p>
            <div className="flex justify-end gap-2">
              <button className="px-3 py-1 border rounded" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
              <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={() => {
                if (confirmDeleteId !== null) deleteMut.mutate(confirmDeleteId)
                setConfirmDeleteId(null)
              }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
