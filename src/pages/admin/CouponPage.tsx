import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Ticket } from "lucide-react";
import toast from "react-hot-toast";
import { couponApi } from "@/lib/api/coupon.api";
import { URL_Base } from "./UsersPage";
import { CreateCouponModal } from "@/components/admin/CreateCouponModel";
import { EditCouponModal } from "@/components/admin/EditCouponModel";

export const AdminCouponsPage = () => {

  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["coupons", page],
    queryFn: () => couponApi.getAll(page, 10),
  });

  const deleteMutation = useMutation({
    mutationFn: couponApi.softDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast.success("Coupon archived");
    },
  });

  const coupons = data?.result || [];
  const totalPages = data?.pages || 1;

  const getStatus = (start: string, end: string) => {

    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (now < startDate) return "Upcoming";
    if (now > endDate) return "Expired";

    return "Active";
  };

  const statusColor = (status: string) => {

    if (status === "Active") return "bg-green-100 text-green-700";
    if (status === "Expired") return "bg-red-100 text-red-700";

    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100">
  
      {/* Header */}
      <div className="flex justify-between items-center">
  
        <div>
          <h1 className="text-3xl font-bold">Coupons</h1>
  
          <p className="text-gray-500 dark:text-gray-400">
            Manage discount coupons
          </p>
        </div>
  
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl"
        >
          <Plus size={18} />
          Add Coupon
        </button>
  
      </div>
  
      {/* Table */}
      <div className="
        bg-white dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700 
        rounded-2xl overflow-hidden
      ">
  
        {isLoading ? (
  
          <div className="p-6 animate-pulse space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-xl"/>
            ))}
          </div>
  
        ) : (
  
          <table className="w-full">
  
            {/* Header */}
            <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
              <tr>
                {["Coupon","Discount","Dates","Status","Actions"].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-xs text-gray-500 dark:text-gray-300 uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
  
            {/* Body */}
            <tbody className="divide-y dark:divide-gray-700">
  
              {coupons.map((coupon:any)=>{
  
                const status = getStatus(
                  coupon.startDate,
                  coupon.endDate
                );
  
                return (
  
                  <tr key={coupon._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
  
                    {/* Coupon */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
  
                        {coupon.image ? (
                          <img
                            src={`${URL_Base}/${coupon.image}`}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                            <Ticket size={18}/>
                          </div>
                        )}
  
                        <div>
                          <p className="font-medium">
                            {coupon.name}
                          </p>
  
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {coupon.type}
                          </p>
                        </div>
  
                      </div>
                    </td>
  
                    {/* Discount */}
                    <td className="px-6 py-4 font-medium">
                      {coupon.type === "amount"
                        ? `$${coupon.discount}`
                        : `${coupon.discount}%`}
                    </td>
  
                    {/* Dates */}
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <div>
                        {new Date(coupon.startDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        to {new Date(coupon.endDate).toLocaleDateString()}
                      </div>
                    </td>
  
                    {/* Status */}
                    <td className="px-6 py-4">
  
                      <span className={`px-3 py-1 text-xs rounded-full ${
                        status === "Active"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : status === "Expired"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}>
                        {status}
                      </span>
  
                    </td>
  
                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-3">
  
                        <button
                          onClick={()=>setEditingCoupon(coupon)}
                          className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600"
                        >
                          <Edit size={18}/>
                        </button>
  
                        <button
                          onClick={()=>{
                            if(confirm("Archive coupon?")){
                              deleteMutation.mutate(coupon._id);
                            }
                          }}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600"
                        >
                          <Trash2 size={18}/>
                        </button>
  
                      </div>
                    </td>
  
                  </tr>
                )
              })}
  
            </tbody>
  
          </table>
        )}
  
      </div>
  
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i)=> (
            <button
              key={i}
              onClick={()=>setPage(i+1)}
              className={`px-4 py-2 rounded-xl border dark:border-gray-700 ${
                page === i+1
                  ? "bg-primary-600 text-white"
                  : "hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {i+1}
            </button>
          ))}
        </div>
      )}
  
      {/* Modals */}
      {showCreateModal && (
        <CreateCouponModal
          onClose={()=>setShowCreateModal(false)}
          onSuccess={()=>{
            queryClient.invalidateQueries({ queryKey:["coupons"] });
            setShowCreateModal(false);
          }}
        />
      )}
  
      {editingCoupon && (
        <EditCouponModal
          coupon={editingCoupon}
          onClose={()=>setEditingCoupon(null)}
          onSuccess={()=>{
            queryClient.invalidateQueries({ queryKey:["coupons"] });
            setEditingCoupon(null);
          }}
        />
      )}
  
    </div>
  );
};