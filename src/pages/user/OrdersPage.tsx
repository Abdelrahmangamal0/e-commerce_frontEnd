import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatCurrency, formatDate, getOrderStatusLabel, getOrderStatusColor } from '@/lib/utils';
import { orderApi } from '@/lib/api/order.api';
import { Order, OrderStatusEnum } from '@/types';
import toast from 'react-hot-toast';
import { Package, X, AlertCircle, RefreshCw } from 'lucide-react';

export const OrdersPage = () => {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['user-orders', page],
    queryFn: () => orderApi.getUserOrders(page, 10),
    retry: false,
  });

  useEffect(() => {
    localStorage.setItem("ordersCount", "0");
    window.dispatchEvent(new Event("orders-cleared"));
  }, []);
  
  const cancelOrderMutation = useMutation({
    mutationFn: orderApi.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-orders'] });
      toast.success('Order cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    },
  });

  const handleCancelOrder = (orderId: string) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      cancelOrderMutation.mutate(orderId);
    }
  };

  const orders = data?.data?.result?.slice()
  .sort(
    (a: any, b: any) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  ) || [];


  
  const totalPages = data?.data?.pages || 1;

  // Check if endpoint doesn't exist (404 or 501)
  const endpointMissing = error && (
    (error as any)?.response?.status === 404 ||
    (error as any)?.response?.status === 501 ||
    (error as any)?.response?.status === 500
  );

  // ❗ Endpoint Missing
if (endpointMissing) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-gray-900 dark:text-gray-100">

      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="
        bg-yellow-50 dark:bg-yellow-900/20 
        border border-yellow-200 dark:border-yellow-800 
        rounded-xl p-6
      ">
        <div className="flex items-start gap-3">

          <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mt-0.5" />

          <div>
            <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-300 mb-2">
              Backend Endpoint Required
            </h3>

            <p className="text-yellow-800 dark:text-yellow-200 mb-4">
              The backend endpoint{" "}
              <code className="bg-yellow-100 dark:bg-yellow-800 px-2 py-1 rounded">
                GET /order/user/orders
              </code>{" "}
              needs to be implemented.
            </p>

            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              This endpoint should return a paginated list of orders for the authenticated user.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}


// ⏳ Loading
if (isLoading) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-gray-900 dark:text-gray-100">

      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="
            bg-white dark:bg-gray-800 
            border border-gray-200 dark:border-gray-700
            rounded-xl p-6 animate-pulse
          "
          >
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  );
}


// 📦 Empty
if (orders.length === 0) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-gray-900 dark:text-gray-100">

      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="
        bg-white dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700
        rounded-xl p-12 text-center
      ">

        <Package className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />

        <h2 className="text-xl font-semibold mb-2">
          No orders yet
        </h2>

        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Your order history will appear here once you place an order.
        </p>

        <a
          href="/products"
          className="
          inline-block bg-primary-600 text-white 
          px-6 py-3 rounded-lg font-semibold 
          hover:bg-primary-700 transition
        "
        >
          Start Shopping
        </a>

      </div>
    </div>
  );
}

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-gray-900 dark:text-gray-100">
  
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Orders</h1>
  
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 text-sm 
          border border-gray-300 dark:border-gray-700 
          bg-white dark:bg-gray-800 
          rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>
  
      <div className="space-y-4">
        {orders.map((order: Order) => {
  console.log(order);
  
          const canCancel =
            order.status === OrderStatusEnum.Pending ||
            order.status === OrderStatusEnum.Placed;
  
          return (
            <div
              key={order._id}
              className="
              bg-white dark:bg-gray-800 
              border border-gray-200 dark:border-gray-700
              rounded-xl shadow-sm overflow-hidden
            "
            >
              <div className="p-6">
  
                {/* Top */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Order #{order.orderId}
                    </h3>
  
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Placed on {order.createdAt ? formatDate(new Date(order.createdAt)) : 'N/A'}
                    </p>
                  </div>
  
                  <div className="text-right">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(order.status)}`}>
                      {getOrderStatusLabel(order.status)}
                    </span>
  
                    <p className="text-lg font-bold mt-2">
                      {formatCurrency(order.total)}
                    </p>
                  </div>
                </div>
  
                {/* Products */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <h4 className="text-sm font-medium mb-2">Products</h4>
  
                  <div className="space-y-2">
                    {order.products.map((product, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {typeof product.productId === 'object' && product.productId?.name
                            ? product.productId.name
                            : `Product ${idx + 1}`}{' '}
                          x {product.quantity}
                        </span>
  
                        <span className="font-medium">
                          {formatCurrency(product.finalPrice)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
  
                {/* Bottom */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 flex justify-between">
  
                  <div className="text-sm text-gray-600 dark:text-gray-200">
      {/* Address */}
<div>
  <p className="font-semibold">Address:</p>

  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mt-1">
    <p>
      <span className="font-medium text-gray-700 dark:text-gray-200">
        Region:
      </span>{' '}
      {order.address?.region}
    </p>

    <p>
      <span className="font-medium text-gray-700 dark:text-gray-200">
        City:
      </span>{' '}
      {order.address?.city}
    </p>

    <p>
      <span className="font-medium text-gray-700 dark:text-gray-200">
        National Address:
      </span>{' '}
      <span className="font-semibold text-blue-600 dark:text-blue-400">
        {order.address?.nationalAddress}
      </span>
    </p>
  </div>
                    </div>
                    <p className="mt-1"><span className="font-medium">Phone: </span>
                      <span className=" font-medium text-gray-400 dark:text-gray-400">
                      { order.phone}
                    </span>
                      
                    </p>
                    {order.payment && (
                      <p className="mt-1"><span className="font-medium">Payment: </span>
                      <span className=" font-medium text-gray-400 dark:text-gray-400">
                      { order.payment}
                    </span>
                    </p>
                    )}
                  </div>
  
                  {canCancel && (
                    <button
                      onClick={() => handleCancelOrder(order._id!)}
                      disabled={cancelOrderMutation.isPending}
                      className="
                      flex items-center gap-2 px-4 py-2 text-sm 
                      text-red-600 
                      bg-red-50 dark:bg-red-900/20 
                      border border-red-200 dark:border-red-800 
                      rounded-lg 
                      hover:bg-red-100 dark:hover:bg-red-900/30
                    "
                    >
                      <X className="h-4 w-4" />
                      Cancel Order
                    </button>
                  )}
  
                </div>
              </div>
            </div>
          );
        })}
      </div>
  
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
  
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Previous
          </button>
  
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              className={`px-4 py-2 border rounded-lg ${
                page === i + 1
                  ? "bg-primary-600 text-white border-primary-600"
                  : "border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
  
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Next
          </button>
  
        </div>
      )}
    </div>
  );
};
