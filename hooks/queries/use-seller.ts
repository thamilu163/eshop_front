import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sellerApi } from '@/features/seller/api/seller-api';
import { queryKeys } from '@/lib/query-keys';
import { StoreDTO, ProductDTO, PageResponse, PageRequest } from '@/types';

export function useMyStore() {
  return useQuery<StoreDTO>({
    queryKey: queryKeys.seller.store(),
    queryFn: () => sellerApi.getMyStore(),
    enabled: true,
  });
}

export function useStoreExists() {
  return useQuery<boolean>({
    queryKey: queryKeys.seller.storeExists(),
    queryFn: () => sellerApi.checkStoreExists(),
    enabled: true,
  });
}

export function useCreateStore() {
  const queryClient = useQueryClient();
  return useMutation<StoreDTO, unknown, Partial<StoreDTO>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: (storeData) => sellerApi.createStore(storeData as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.seller.store() });
      queryClient.invalidateQueries({ queryKey: queryKeys.seller.storeExists() });
    },
  });
}

export function useUpdateStore() {
  const queryClient = useQueryClient();
  return useMutation<StoreDTO, unknown, Partial<StoreDTO>>({
    mutationFn: (storeData) => sellerApi.updateStore(storeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.seller.store() });
    },
  });
}

export function useMyProducts(params: PageRequest) {
  return useQuery<PageResponse<ProductDTO>>({
    queryKey: queryKeys.seller.products(params),
    queryFn: () => sellerApi.getMyProducts(params),
    enabled: !!params,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation<ProductDTO, unknown, Partial<ProductDTO>>({
    mutationFn: (productData) => sellerApi.createProduct(productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.seller.products({}) });
    },
  });
}

export function useUpdateProduct(id: number) {
  const queryClient = useQueryClient();
  return useMutation<ProductDTO, unknown, Partial<ProductDTO>>({
    mutationFn: (productData) => sellerApi.updateProduct(id, productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.seller.products({}) });
    },
  });
}

export function useDeleteProduct(id: number) {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, void>({
    mutationFn: () => sellerApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.seller.products({}) });
    },
  });
}
