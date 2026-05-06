import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatCurrency, formatDate, getOrderStatusLabel, getOrderStatusColor } from '@/lib/utils';
import { orderApi } from '@/lib/api/order.api';
import { Order, OrderStatusEnum } from '@/types';
import toast from 'react-hot-toast';
import { AlertCircle, RefreshCw, Search } from 'lucide-react';

export const AdminOrdersPage = () => {

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-orders', page],
    queryFn: () => orderApi.getAllOrders(page, 10),
    retry: false,
  });

  const cancelOrderMutation = useMutation({
    mutationFn: orderApi.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
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

  const endpointMissing = error && (
    (error as any)?.response?.status === 404 ||
    (error as any)?.response?.status === 501 ||
    (error as any)?.response?.status === 500
  );

  if (endpointMissing) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-yellow-600"/>
          <div>
            <h3 className="text-lg font-semibold text-yellow-900">
              Backend Endpoint Required
            </h3>
            <p className="text-yellow-800">
              Endpoint GET /order/admin/orders needs to be implemented
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-10 text-center">Loading Orders...</div>;
  }

  const filteredOrders = orders.filter((order: Order) => {
    if (!searchTerm) return true;
  
    const searchLower = searchTerm.toLowerCase();
  
    return (
      order.orderId?.toLowerCase().includes(searchLower) ||
      order.phone?.toLowerCase().includes(searchLower) ||
      order.address?.region?.toLowerCase().includes(searchLower) ||
      order.address?.city?.toLowerCase().includes(searchLower) ||
      order.address?.nationalAddress?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100">
  
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Orders</h1>
  
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 
          border border-gray-300 dark:border-gray-700 
          rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>
  
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search orders..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg"
        />
      </div>
  
      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden">
  
        <table className="w-full">
  
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {["Order ID","Customer","Address","Products","Status","Total","Date","Actions"].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs text-gray-500 dark:text-gray-300">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
  
          <tbody className="divide-y dark:divide-gray-700">
  
            {filteredOrders.map((order: Order) => {
  
              const canCancel =
                order.status == OrderStatusEnum.Pending ||
                order.status == OrderStatusEnum.Placed;
  
              return (
                <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
  
                  <td className="px-6 py-4">#{order.orderId}</td>
  
                  <td className="px-6 py-4">
                    <div>
                      {typeof order.createdBy === "object"
                        ? `${order.createdBy.firstName} ${order.createdBy.lastName}`
                        : "N/A"}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {order.phone}
                    </div>
                  </td>
  
                  <td className="px-6 py-4">
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

    </div> {/* 👈 دي كانت ناقصة */}

  </div>
</td>
  
                  <td className="px-6 py-4">
                    {order.products?.length} items
                  </td>
  
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getOrderStatusColor(order.status)}`}>
                      {getOrderStatusLabel(order.status)}
                    </span>
                  </td>
  
                  <td className="px-6 py-4 font-semibold">
                    {formatCurrency(order.total)}
                  </td>
  
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {formatDate(new Date(order.createdAt as Date))}
                  </td>
  
                  <td className="px-6 py-4">
                    {canCancel && (
                      <button
                        onClick={() => handleCancelOrder(order._id!)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
  
                </tr>
              );
            })}
  
          </tbody>
        </table>
      </div>
  
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-4 py-2 rounded-lg ${
                page === i + 1
                  ? "bg-primary-600 text-white"
                  : "border dark:border-gray-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
  
    </div>
  );
};