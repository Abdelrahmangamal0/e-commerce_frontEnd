import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "@/lib/api/order.api";
import { formatCurrency } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import toast from "react-hot-toast";
import { OrderStatusEnum } from "@/types";
import { useEffect } from "react";

export const OrdersPage = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => orderApi.getUserOrders(),
  });
  

  const cancelOrderMutation = useMutation({
    mutationFn: orderApi.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order cancelled successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    },
  });

  const handleCancelOrder = (orderId: string) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      cancelOrderMutation.mutate(orderId);
    }
  };

  const orders = data?.data?.result?.slice()
  .sort(
    (a: any, b: any) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  ) || [];

// console.log(orders , '00');

  if (isLoading) {
    return <div className="p-10 text-center">Loading orders...</div>;
  }

  if (!orders.length) {
    return (
      <div className="text-center py-20">
        <Package className="w-20 h-20 mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Orders Yet</h2>
        <Link to="/products" className="text-primary-600">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order: any) => {
          const canCancel =
            order.status == OrderStatusEnum.Pending ||
            order.status == OrderStatusEnum.Placed;
console.log(canCancel);

          return (
            <div
              key={order._id}
              className="bg-white p-6 rounded-xl shadow hover:shadow-md transition"
            >
              <div className="flex justify-between mb-4">
                <div>
                  <h3 className="font-semibold">Order #{order._id.slice(-6)}</h3>
                  <p className="text-sm text-gray-500">Status: {order.status}</p>
                </div>

                <div className="text-right font-bold text-primary-600">
                  {formatCurrency(order.totalPrice)}
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                {order.items?.length} items
              </div>

              {/* Cancel button */}
              {canCancel && (
                <button
                  onClick={() => handleCancelOrder(order._id)}
                  disabled={cancelOrderMutation.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  Cancel Order
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};