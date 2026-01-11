const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export interface ProductImage {
  id: string;
  productId: string;
  cloudinaryUrl: string;
  thumbnailUrl: string;
  altText: string;
  displayOrder: number;
  isPrimary: boolean;
  width: number;
  height: number;
}

export const productImagesApi = {
  async upload(
    productId: string,
    file: File,
    altText?: string,
    isPrimary = false
  ): Promise<ProductImage> {
    const formData = new FormData();
    formData.append('productId', productId);
    formData.append('file', file);
    if (altText) formData.append('altText', altText);
    formData.append('isPrimary', String(isPrimary));

    const response = await fetch(`${API_BASE}/api/product-images`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Upload failed');
    return response.json();
  },

  async getForProduct(productId: string): Promise<ProductImage[]> {
    const response = await fetch(
      `${API_BASE}/api/product-images/product/${productId}`
    );
    if (!response.ok) throw new Error('Failed to fetch images');
    return response.json();
  },

  async delete(imageId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/product-images/${imageId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Delete failed');
  },

  async setPrimary(productId: string, imageId: string): Promise<void> {
    const response = await fetch(
      `${API_BASE}/api/product-images/product/${productId}/primary/${imageId}`,
      { method: 'PUT' }
    );
    if (!response.ok) throw new Error('Failed to set primary');
  },
};
