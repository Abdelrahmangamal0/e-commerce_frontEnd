import { useForm } from "react-hook-form";
import { brandApi } from "@/lib/api/brand.api";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { X, ImagePlus } from "lucide-react";
import { useState } from "react";
import { URL_Base } from "@/pages/admin/UsersPage";

export const EditBrandModal = ({ brand, onClose, onSuccess }: any) => {

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(brand?.image || "");

  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: brand.name,
      slogan: brand.slogan,
    },
  });

  // ✅ Mutation for update brand data
  const updateMutation = useMutation({
    mutationFn: (data: any) => brandApi.update(brand._id, data),
    onSuccess: () => {
      toast.success("Brand updated");
      onSuccess();
    },
  });

  // ✅ Mutation for image update
  const attachmentMutation = useMutation({
    mutationFn: (file: File) =>
      brandApi.updateAttachment(brand._id, file),
    onSuccess: () => {
      toast.success("Image updated");
      onSuccess();
    },
  });

  const onSubmit = (data: any) => {

    const cleanData: any = {};

    if (data.name?.trim()) cleanData.name = data.name;
    if (data.slogan?.trim()) cleanData.slogan = data.slogan;

    updateMutation.mutate(cleanData);

    if (file) {
      attachmentMutation.mutate(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
  
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
  
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Edit Brand
          </h2>
  
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
  
        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 space-y-5"
        >
  
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Brand Name
            </label>
            <input
              {...register("name")}
              className="w-full mt-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl 
              bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
              focus:ring-2 focus:ring-primary-500 outline-none transition"
              placeholder="Brand name"
            />
          </div>
  
          {/* Slogan */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Slogan
            </label>
            <input
              {...register("slogan")}
              className="w-full mt-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl 
              bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
              focus:ring-2 focus:ring-primary-500 outline-none transition"
              placeholder="Brand slogan"
            />
          </div>
  
          {/* Image Upload */}
          <div className="space-y-3">
  
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <ImagePlus className="h-4 w-4" />
              Brand Image
            </label>
  
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-center hover:border-primary-400 transition">
  
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="brandImage"
                onChange={(e) => {
                  const selected = e.target.files?.[0];
                  if (!selected) return;
  
                  setFile(selected);
                  setPreview(URL.createObjectURL(selected));
                }}
              />
  
              <label htmlFor="brandImage" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
  
                  {preview ? (
                    <img
                      src={`${URL_Base}/${preview}`}
                      className="w-32 h-32 object-cover rounded-xl shadow"
                    />
                  ) : (
                    <>
                      <ImagePlus className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Click to upload brand image
                      </p>
                    </>
                  )}
  
                </div>
              </label>
            </div>
  
          </div>
  
          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
  
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
                : "Update Brand"}
            </button>
  
          </div>
  
        </form>
  
      </div>
    </div>
  );
};