import { useState } from "react";
import toast from "react-hot-toast";
import { couponApi } from "@/lib/api/coupon.api";
import { X, ImagePlus } from "lucide-react";
import { URL_Base } from "@/pages/admin/UsersPage";

export const EditCouponModal = ({ coupon, onClose, onSuccess }: any) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(coupon.image || null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: coupon.name,
    discount: coupon.discount,
    duration: coupon.duration || "",
    type: coupon.type,
    startDate: coupon.startDate?.slice(0, 10),
    endDate: coupon.endDate?.slice(0, 10),
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!form.name || !form.discount) {
      toast.error("Name and discount are required");
      return;
    }

    try {
      setLoading(true);

      await couponApi.update(
        coupon._id,
        {
          name: form.name,
          discount: Number(form.discount),
          duration: form.duration ? Number(form.duration) : undefined,
          type: form.type,
          startDate: form.startDate,
          endDate: form.endDate,
        },
        file || undefined
      );

      toast.success("Coupon updated");
      onSuccess();
    } catch {
      toast.error("Error updating coupon");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
    className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50"
    
      onClick={onClose}
    >
      <div
        className="
        bg-white dark:bg-gray-800
        p-6 rounded-xl w-full max-w-md  shadow-lg
      "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Edit Coupon
          </h2>
  
          <button onClick={onClose}>
            <X className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
  
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
  
          {/* Name */}
          <input
            value={form.name}
            placeholder="Coupon Name"
            className="w-full border border-gray-300 dark:border-gray-600 px-2 py-2 rounded text-m 
            bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
  
          {/* Discount */}
          <input
            type="number"
            value={form.discount}
            placeholder="Discount"
            className="w-full border border-gray-300 dark:border-gray-600 px-2 py-2 rounded text-m 
            bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            onChange={(e) => setForm({ ...form, discount: e.target.value })}
          />
  
          {/* Duration */}
          <input
            type="number"
            value={form.duration}
            placeholder="Duration (days)"
            className="w-full border border-gray-300 dark:border-gray-600 px-2 py-2 rounded text-m 
            bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
          />
  
          {/* Type */}
          <select
            value={form.type}
            className="w-full border border-gray-300 dark:border-gray-600 px-2 py-2 rounded text-m 
            bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 appearance-none"
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="Percent">Percent (%)</option>
            <option value="Amount">Amount ($)</option>
          </select>
  
          {/* Dates */}
          <input
            type="date"
            value={form.startDate}
            className="w-full border border-gray-300 dark:border-gray-600 px-2 py-2 rounded text-m 
            bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
  
          <input
            type="date"
            value={form.endDate}
            className="w-full border border-gray-300 dark:border-gray-600 px-2 py-2 rounded text-m 
            bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          />
  
          {/* Image Upload */}
          <div className="space-y-1">
            <label className="text-m font-medium flex items-center gap-1 text-gray-700 dark:text-gray-300">
              <ImagePlus className="w-4 h-6" /> Coupon Image
            </label>
  
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-2 text-center">
              <input
                type="file"
                accept="image/*"
                hidden
                id="couponImage"
                onChange={(e) => {
                  const selected = e.target.files?.[0];
                  if (!selected) return;
  
                  setFile(selected);
                  setPreview(URL.createObjectURL(selected));
                }}
              />
  
              <label htmlFor="couponImage" className="cursor-pointer">
                {preview ? (
                  <img
                    src={`${URL_Base}/${preview}`}
                    className="w-24 h-24 object-cover mx-auto rounded-lg"
                  />
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    Click to upload image
                  </p>
                )}
              </label>
            </div>
          </div>
  
          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
  
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-m hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
  
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update"}
            </button>
  
          </div>
  
        </form>
      </div>
    </div>
  );
};