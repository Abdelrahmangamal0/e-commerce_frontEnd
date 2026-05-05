import { useForm } from "react-hook-form";
import { brandApi } from "@/lib/api/brand.api";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { X, ImagePlus } from "lucide-react";
import { useEffect, useState } from "react";

export const CreateBrandModal = ({ onClose, onSuccess }: any) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm();

  // ✅ FIX memory leak
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const mutation = useMutation({
    mutationFn: (data: any) => brandApi.create(data, file!),

    onSuccess: () => {
      toast.success("Brand created");
      reset();
      setPreview(null);
      setFile(null);
      onSuccess();
    },

    onError: () => toast.error("Failed to create brand"),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const url = URL.createObjectURL(selectedFile);

    setFile(selectedFile);
    setPreview(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
        w-full max-w-md rounded-2xl
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        shadow-2xl overflow-hidden
      "
      >

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Create Brand
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
          className="space-y-5 p-6"
        >

          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Brand Name
            </label>

            <input
              {...register("name")}
              placeholder="Enter brand name"
              className="
              mt-1 w-full px-4 py-2.5 rounded-xl border
              border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-900
              text-gray-900 dark:text-gray-100
              focus:ring-2 focus:ring-primary-500 outline-none
            "
            />
          </div>

          {/* Slogan */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Slogan
            </label>

            <input
              {...register("slogan")}
              placeholder="Enter slogan"
              className="
              mt-1 w-full px-4 py-2.5 rounded-xl border
              border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-900
              text-gray-900 dark:text-gray-100
              focus:ring-2 focus:ring-primary-500 outline-none
            "
            />
          </div>

          {/* Image */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
              <ImagePlus className="h-4 w-4" />
              Brand Image
            </label>

            <div className="
              border-2 border-dashed border-gray-300 dark:border-gray-600
              rounded-xl p-5 text-center
              hover:border-primary-400 transition
            ">

              <input
                type="file"
                accept="image/*"
                id="brandImage"
                className="hidden"
                onChange={handleImageChange}
              />

              <label htmlFor="brandImage" className="cursor-pointer block">

                {preview ? (
                  <div className="flex justify-center">
                    <img
                      src={preview}
                      className="w-32 h-32 object-cover rounded-xl shadow"
                    />
                  </div>
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
              {mutation.isPending ? "Creating..." : "Create Brand"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};