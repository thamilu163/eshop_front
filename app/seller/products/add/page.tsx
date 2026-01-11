import { Metadata } from "next";
import AddProductFormWrapper from '@/components/seller/AddProductFormWrapper';

export const metadata: Metadata = {
  title: "Add Product | Seller Dashboard",
  description: "Add a new product to your store",
};

export default function AddProductPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Add Product</h1>
        <p className="text-muted-foreground mt-2">
          Create a new product listing for your store
        </p>
      </div>

      {/* Client-only form component */}
      <AddProductFormWrapper />
    </div>
  );
}
