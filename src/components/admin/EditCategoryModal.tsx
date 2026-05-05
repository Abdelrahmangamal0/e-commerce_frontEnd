import { useForm } from "react-hook-form";
import { categoryApi } from "@/lib/api/category.api";
import { brandApi } from "@/lib/api/brand.api";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { X, ImagePlus } from "lucide-react";
import { useState } from "react";
import { URL_Base } from "@/pages/admin/UsersPage";

export const EditCategoryModal = ({ category, onClose, onSuccess }: any) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(category?.image || "");
  const [selectedBrands, setSelectedBrands] = useState<string[]>(category.brands || []);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: category.name,
      description: category.description,
    },
  });

  const { data: brandsData } = useQuery({
    queryKey: ["brands"],
    queryFn: () => brandApi.getAll(),
  });

  const brands = brandsData?.result || [];

  const toggleBrand = (id: string) => {
    setSelectedBrands((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const updateMutation = useMutation({
    mutationFn: (data: any) => categoryApi.update(category._id, data),
    onSuccess: () => {
      toast.success("Category updated");
      onSuccess();
    },
  });

  const attachmentMutation = useMutation({
    mutationFn: (file: File) => categoryApi.updateAttachment(category._id, file),
    onSuccess: () => {
      toast.success("Image updated");
      onSuccess();
    },
  });

  const onSubmit = (data: any) => {
    const cleanData: any = {};
    if (data.name?.trim()) cleanData.name = data.name;
    if (data.description?.trim()) cleanData.description = data.description;
    cleanData.brands = selectedBrands;

    updateMutation.mutate(cleanData);

    if (file) attachmentMutation.mutate(file);
  };

  return (
    <div
    className="fixed inset-0 bg-black/40 dark:bg-black/60 flex justify-center items-center z-50"
    onClick={onClose}
  >
    <div
      className="
        bg-white dark:bg-gray-800
        rounded-2xl w-full max-w-sm md:max-w-md 
        shadow-2xl max-h-[85vh] flex flex-col
      "
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          Edit Category
        </h2>
  
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
  
      {/* Form (scroll هنا بس + scrollbar مخفي) */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-5 md:p-6 space-y-5 overflow-y-auto flex-1 no-scrollbar"
      >
        {/* Category Name */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Category Name
          </label>
          <input
            {...register("name")}
            className="
              w-full mt-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl 
              bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
              focus:ring-2 focus:ring-primary-500 outline-none transition
            "
            placeholder="Category name"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            {...register("description")}
            className="
              w-full mt-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl 
              bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
              focus:ring-2 focus:ring-primary-500 outline-none transition resize-none
            "
            placeholder="Category description"
            rows={3}
          />
        </div>

        {/* Brands */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Brands
          </label>

          <div className="mt-2 border border-gray-300 dark:border-gray-600 rounded-xl p-3 max-h-40 overflow-y-auto space-y-2">

            {brands.map((brand: any) => (
              <div
                key={brand._id}
                onClick={() => toggleBrand(brand._id)}
                className={`cursor-pointer px-3 py-2 rounded-lg transition ${
                  selectedBrands.includes(brand._id)
                    ? "bg-blue-100 dark:bg-blue-600 text-blue-700 dark:text-white font-semibold border border-blue-300 dark:border-blue-500"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {brand.name}
              </div>
            ))}

          </div>
        </div>

        {/* Image */}
        <div className="space-y-2">

          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <ImagePlus className="h-4 w-4" />
            Category Image
          </label>

          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-center hover:border-blue-400 transition">

            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="categoryImage"
              onChange={(e) => {
                const selected = e.target.files?.[0];
                if (!selected) return;

                setFile(selected);
                setPreview(URL.createObjectURL(selected));
              }}
            />

            <label htmlFor="categoryImage" className="cursor-pointer">

              <div className="flex flex-col items-center gap-2">

                {preview ? (
                  <img
                    src={preview.startsWith('NEST') ? `${URL_Base}/${preview}` : preview}
                    className="w-32 h-32 object-cover rounded-xl shadow"
                  />
                ) : (
                  <>
                    <ImagePlus className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Click to upload category image
                    </p>
                  </>
                )}

              </div>

            </label>

          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-5 border-t border-gray-200 dark:border-gray-700">

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={updateMutation.isPending || attachmentMutation.isPending}
            className="px-5 py-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition disabled:opacity-50"
          >
            {(updateMutation.isPending || attachmentMutation.isPending)
              ? "Updating..."
              : "Update Category"}
          </button>

        </div>

      </form>
    </div>
  </div>
);
};