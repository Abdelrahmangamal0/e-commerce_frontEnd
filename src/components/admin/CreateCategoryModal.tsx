import { useForm } from "react-hook-form";
import { categoryApi } from "@/lib/api/category.api";
import { brandApi } from "@/lib/api/brand.api";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { X, ImagePlus } from "lucide-react";
import { useEffect, useState } from "react";

export const CreateCategoryModal = ({ onClose, onSuccess }: any) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  const { register, handleSubmit } = useForm();

  const { data: brandsData } = useQuery({
    queryKey: ["brands"],
    queryFn: () => brandApi.getAll(),
  });

  const brands = brandsData?.result || [];

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const toggleBrand = (id: string) => {
    setSelectedBrands((prev) =>
      prev.includes(id)
        ? prev.filter((b) => b !== id)
        : [...prev, id]
    );
  };

  const mutation = useMutation({
    mutationFn: (data: any) => categoryApi.create(data, file!),

    onSuccess: () => {
      toast.success("Category created");
      onSuccess();
    },

    onError: () => toast.error("Failed to create category"),
  });

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          w-full max-w-md
          bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          rounded-2xl shadow-2xl
          max-h-[85vh] flex flex-col
        "
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Create Category
          </h2>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Form (scroll هنا بس) */}
        <form
          onSubmit={handleSubmit((data) => {
            if (selectedBrands.length === 0) {
              toast.error("Select at least one brand");
              return;
            }

            mutation.mutate({
              ...data,
              brands: selectedBrands,
            });
          })}
         className="p-6 space-y-5 overflow-y-auto flex-1 no-scrollbar"
        >
          {/* Name */}
          <input
            {...register("name")}
            placeholder="Category Name"
            className="
              w-full px-4 py-2.5 rounded-xl border
              border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-900
              text-gray-900 dark:text-gray-100
              focus:ring-2 focus:ring-primary-500 outline-none
            "
          />

          {/* Description */}
          <textarea
            {...register("description")}
            placeholder="Description"
            className="
              w-full px-4 py-2.5 rounded-xl border
              border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-900
              text-gray-900 dark:text-gray-100
              focus:ring-2 focus:ring-primary-500 outline-none
            "
          />

          {/* Brands */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Brands
            </label>

            <div
              className="
              mt-2 border border-gray-200 dark:border-gray-700
              rounded-xl p-3 max-h-40 overflow-y-auto space-y-2
            "
            >
              {brands.map((brand: any) => (
                <div
                  key={brand._id}
                  onClick={() => toggleBrand(brand._id)}
                  className={`
                    cursor-pointer px-3 py-2 rounded-lg transition
                    ${
                      selectedBrands.includes(brand._id)
                        ? "bg-primary-600 text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }
                  `}
                >
                  {brand.name}
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
              <ImagePlus className="h-4 w-4" />
              Category Image
            </label>

            <div
              className="
              border-2 border-dashed border-gray-300 dark:border-gray-600
              rounded-xl p-5 text-center hover:border-primary-400 transition
            "
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="categoryImage"
                onChange={(e) => {
                  const selected = e.target.files?.[0];
                  if (!selected) return;

                  const url = URL.createObjectURL(selected);
                  setFile(selected);
                  setPreview(url);
                }}
              />

              <label htmlFor="categoryImage" className="cursor-pointer block">
                {preview ? (
                  <img
                    src={preview}
                    className="w-32 h-32 object-cover rounded-xl mx-auto"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
                    <ImagePlus className="h-10 w-10" />
                    <p className="text-sm">Click to upload image</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-5 py-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {mutation.isPending ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};