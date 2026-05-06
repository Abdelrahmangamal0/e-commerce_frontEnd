import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {  useQuery, useQueryClient } from "@tanstack/react-query";
import { productApi } from "@/lib/api/product.api";
import { brandApi } from "@/lib/api/brand.api";
import { categoryApi } from "@/lib/api/category.api";
import { URL_Base } from "@/pages/admin/UsersPage";

interface Props {
  product: any;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormDataType {
  name?: string;
  description?: string;
  originalPrice?: number;
  discountPercent?: number;
  stock?: number;
  brand?: string;
  category?: string;
}

export const EditProductModal = ({ product, onClose }: Props) => {
  const queryClient = useQueryClient();

  const { register, handleSubmit, setValue } = useForm<FormDataType>({
    defaultValues: {
      name: product.name,
      description: product.description,
      originalPrice: product.originalPrice,
      discountPercent: product.discountPercent || undefined,
      stock: product.stock,
      brand: product.brand || "",
      category: product.category || "",
    },
  });

  const { data: brandsData } = useQuery({
    queryKey: ["brands"],
    queryFn: () => brandApi.getAll(1, 1000),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryApi.getAll(1, 1000),
  });

  useEffect(() => {
    if (brandsData?.result) setValue("brand", product.brand || "");
    if (categoriesData?.result) setValue("category", product.category || "");
  }, [brandsData, categoriesData, setValue, product]);

  const [existingImages, setExistingImages] = useState<any[]>(product.images || []);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewImages((prev) => [...prev, ...files]);
    const previews = files.map((f) => URL.createObjectURL(f));
    setNewPreviews((prev) => [...prev, ...previews]);
  };

  const removeExistingImage = (img: any) => {
    setExistingImages((prev) => prev.filter((i) => i !== img));
    setRemovedImages((prev) => [...prev, img]);
  };

  const removeNewImage = (idx: number) => {
    setNewPreviews((prev) => prev.filter((_, i) => i !== idx));
    setNewImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const onSubmit = async (data: FormDataType) => {
    try {
      const filteredData: any = {};

      Object.keys(data).forEach((key) => {
        let value = (data as any)[key];

        if (key === "discountPercent") {
          value = value != null ? Number(value) : undefined;
          if (isNaN(value)) value = undefined;
        }

        if (value !== "" && value != null) {
          filteredData[key] = value;
        }
      });

      await productApi.update(product._id, filteredData);

      if (newImages.length || removedImages.length) {
        await productApi.updateAttachments(product._id, newImages, removedImages);
      }

      queryClient.invalidateQueries({ queryKey: ["products"] });
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 dark:bg-black/60 z-50 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          bg-white dark:bg-gray-800
          rounded-2xl max-w-2xl w-full
          max-h-[85vh] flex flex-col shadow-2xl
        "
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Edit Product
          </h2>
  
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white"
          >
            ✕
          </button>
        </div>
  
        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 space-y-4 overflow-y-auto flex-1 no-scrollbar"
        >
  
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Product Name
            </label>
            <input
              {...register("name")}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 
              bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
  
          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              {...register("description")}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 
              bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
  
          {/* Category & Brand */}
          <div className="grid grid-cols-2 gap-4">
  
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Category
              </label>
              <select
                {...register("category")}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 
                bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 appearance-none"
              >
                <option value="">Select category</option>
                {categoriesData?.result?.map((c: any) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
  
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Brand
              </label>
              <select
                {...register("brand")}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 
                bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 appearance-none"
              >
                <option value="">Select brand</option>
                {brandsData?.result?.map((b: any) => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>
  
          </div>
  
          {/* Images */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Product Images
            </label>
  
            <div className="grid grid-cols-4 gap-3">
  
              {existingImages.map((img, i) => (
                <div key={i} className="relative group">
                  <img
                    src={`${URL_Base}/${img}`}
                    className="w-full h-24 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(img)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                  >
                    ×
                  </button>
                </div>
              ))}
  
              {newPreviews.map((img, i) => (
                <div key={i} className="relative group">
                  <img
                    src={img}
                    className="w-full h-24 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                  >
                    ×
                  </button>
                </div>
              ))}
  
              <label className="flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg h-24 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">+ Add</span>
                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
  
            </div>
          </div>
  
          {/* Price / Discount / Stock */}
          <div className="grid grid-cols-3 gap-4">
  
            <input
              type="number"
              {...register("originalPrice")}
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 
              bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
  
            <input
              type="number"
              {...register("discountPercent")}
              placeholder="Discount %"
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 
              bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
  
            <input
              type="number"
              {...register("stock")}
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 
              bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
  
          </div>
  
          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
  
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
  
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Update Product
            </button>
  
          </div>
  
        </form>
      </div>
    </div>
  );
};