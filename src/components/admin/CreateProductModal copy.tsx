import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { productApi } from '@/lib/api/product.api';
import { brandApi } from '@/lib/api/brand.api';
import { categoryApi } from '@/lib/api/category.api';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

// ------------------- Zod Schema -------------------
const createProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  brand: z.string().min(1, 'Brand is required'),
  category: z.string().min(1, 'Category is required'),
  discountPercent: 
    z.number().min(0, 'Discount must be at least 0').max(100, 'Discount cannot exceed 100').optional(),
  
  originalPrice: z.number().positive('Price must be positive'),
  stock: z.number().int().positive('Stock must be positive'),
});

type CreateProductForm = z.infer<typeof createProductSchema>;

interface CreateProductModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateProductModal = ({ onClose, onSuccess }: CreateProductModalProps) => {
  const [files, setFiles] = useState<File[]>([]);

  const { register, handleSubmit, formState: { errors } } = useForm<CreateProductForm>({
    resolver: zodResolver(createProductSchema),
  });

  // ------------------- Fetch Brands -------------------
  const { data: brandsData, isLoading: brandsLoading } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandApi.getAll(),
  });

  // ------------------- Fetch Categories -------------------
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll(),
  });

  const brands = brandsData?.result || [];
  const categories = categoriesData?.result || [];

  // ------------------- Create Product -------------------
  const createMutation = useMutation({
    mutationFn: (data: { formData: CreateProductForm; files: File[] }) =>
      productApi.create(data.formData, data.files),

    onSuccess: () => {
      toast.success('Product created successfully');
      onSuccess();
    },

    onError: () => {
      toast.error('Failed to create product');
    },
  });

  const onSubmit = (data: CreateProductForm) => {
    if (!data.discountPercent || data.discountPercent == 0) {
      delete data.discountPercent; 
    }

    if (files.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }
console.log(data);

    createMutation.mutate({ formData: data, files });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black/60 flex items-center justify-center z-50 p-4">
    <div className="
  bg-white dark:bg-gray-800
  rounded-2xl max-w-2xl w-full
  max-h-[85vh] flex flex-col shadow-2xl
">    
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Create Product
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
  
        <form
  onSubmit={handleSubmit(onSubmit)}
  className="p-6 space-y-4 overflow-y-auto flex-1 no-scrollbar"
>
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Product Name *
            </label>
            <input
              {...register('name')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
              bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
              focus:ring-2 focus:ring-primary-500"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>
  
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
              bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
              focus:ring-2 focus:ring-primary-500"
            />
          </div>
  
          {/* Brand + Category */}
          <div className="grid grid-cols-2 gap-4">
  
            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Brand *
              </label>
              <select
                {...register('brand')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                appearance-none"
              >
                <option value="">{brandsLoading ? 'Loading brands...' : 'Select Brand'}</option>
                {brands.map((brand: any) => (
                  <option key={brand._id} value={brand._id}>
                    {brand.name}
                  </option>
                ))}
              </select>
              {errors.brand && <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>}
            </div>
  
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category *
              </label>
              <select
                {...register('category')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                appearance-none"
              >
                <option value="">{categoriesLoading ? 'Loading categories...' : 'Select Category'}</option>
                {categories.map((category: any) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
            </div>
  
          </div>
  
          {/* Price + Discount + Stock */}
          <div className="grid grid-cols-3 gap-4">
  
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Original Price *
              </label>
              <input
                {...register('originalPrice', { valueAsNumber: true })}
                type="number"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Discount %
              </label>
              <input
                {...register('discountPercent', {
                  setValueAs: (v) => (v === '' ? undefined : Number(v)),
                })}
                type="number"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Stock *
              </label>
              <input
                {...register('stock', { valueAsNumber: true })}
                type="number"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>
  
          </div>
  
          {/* Images */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Product Images *
            </label>
  
            <div className="grid grid-cols-4 gap-3">
  
              {files.map((file, i) => {
                const preview = URL.createObjectURL(file);
  
                return (
                  <div key={i} className="relative group">
                    <img
                      src={preview}
                      className="w-full h-24 object-cover rounded border"
                    />
  
                    <button
                      type="button"
                      onClick={() => {
                        const updated = files.filter((_, index) => index !== i);
                        setFiles(updated);
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
  
              {files.length < 5 && (
                <label className="flex items-center justify-center border-2 border-dashed rounded-lg h-24 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">+ Add</span>
  
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const selectedFiles = Array.from(e.target.files || []);
  
                      if (files.length + selectedFiles.length > 5) {
                        toast.error("Maximum 5 images allowed");
                        return;
                      }
  
                      setFiles([...files, ...selectedFiles]);
                    }}
                  />
                </label>
              )}
            </div>
          </div>
  
          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
  
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
  
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Product'}
            </button>
  
          </div>
  
        </form>
      </div>
    </div>
  );
};