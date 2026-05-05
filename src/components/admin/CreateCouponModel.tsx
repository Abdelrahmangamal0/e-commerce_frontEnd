import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { couponApi } from "@/lib/api/coupon.api";
import { X, ImagePlus } from "lucide-react";

export const CreateCouponModal = ({ onClose, onSuccess }: any) => {

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    discount: "",
    duration: "",
    type: "Percent",
    startDate: "",
    endDate: ""
  });

  const [loading, setLoading] = useState(false);

  // ✅ FIX memory leak
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!form.name || !form.discount || !form.startDate || !form.endDate) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      await couponApi.create(
        {
          name: form.name,
          discount: Number(form.discount),
          duration: form.duration ? Number(form.duration) : undefined,
          type: form.type,
          startDate: form.startDate,
          endDate: form.endDate
        },
        file || undefined
      );

      toast.success("Coupon created");
      onSuccess();

    } catch (error) {
      toast.error("Error creating coupon");
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
          p-6 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-lg
        "
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Create Coupon
        </h2>
  
        <form onSubmit={handleSubmit} className="space-y-4">
  
          <input
            placeholder="Coupon Name"
            className="
              w-full border border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-900
              text-gray-900 dark:text-gray-100
              p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500
            "
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
  
          <input
            type="number"
            placeholder="Discount"
            className="
              w-full border border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-900
              text-gray-900 dark:text-gray-100
              p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500
            "
            value={form.discount}
            onChange={(e) => setForm({ ...form, discount: e.target.value })}
          />
  
          <input
            type="number"
            placeholder="Duration (optional)"
            className="
              w-full border border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-900
              text-gray-900 dark:text-gray-100
              p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500
            "
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
          />
  
          <select
            className="
              w-full border border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-900
              text-gray-900 dark:text-gray-100
              p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500
            "
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="Percent">Percent</option>
            <option value="Amount">Amount</option>
          </select>
  
          <input
            type="date"
            className="
              w-full border border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-900
              text-gray-900 dark:text-gray-100
              p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500
            "
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
  
          <input
            type="date"
            className="
              w-full border border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-900
              text-gray-900 dark:text-gray-100
              p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500
            "
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          />
  
          {/* Image */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Coupon Image
            </label>
  
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-center hover:border-blue-400 transition">
  
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="couponImage"
                onChange={(e) => {
                  const selected = e.target.files?.[0] || null;
                  setFile(selected);
                  setPreview(selected ? URL.createObjectURL(selected) : null);
                }}
              />
  
              <label htmlFor="couponImage" className="cursor-pointer flex flex-col items-center gap-2">
  
                {preview ? (
                  <img
                    src={preview}
                    className="w-32 h-32 object-cover rounded-xl shadow"
                  />
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Click to upload coupon image
                  </p>
                )}
  
              </label>
            </div>
          </div>
  
          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
  
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
  
        </form>
      </div>
    </div>
  );
};