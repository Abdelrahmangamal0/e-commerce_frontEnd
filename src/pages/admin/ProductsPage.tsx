import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { productApi } from '@/lib/api/product.api';
import { formatCurrency } from '@/lib/utils';
import { Plus, Edit, Trash2, Archive, RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { EditProductModal } from '@/components/admin/EditProductModal';
import { URL_Base } from './UsersPage';
import { CreateProductModal } from '@/components/admin/CreateProductModal copy';

export const AdminProductsPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['products', 'admin', page],
    queryFn: () => productApi.getAll(page, 10),
  });

  const deleteMutation = useMutation({
    mutationFn: productApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted');
    },
    onError: () => {
      toast.error('Failed to delete product');
    },
  });

  const softDeleteMutation = useMutation({
    mutationFn: productApi.softDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product archived');
    },
    onError: () => {
      toast.error('Failed to archive product');
    },
  });

  const restoreMutation = useMutation({
    mutationFn: productApi.restore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product restored');
    },
    onError: () => {
      toast.error('Failed to restore product');
    },
  });

  const products = data?.result || [];
  const totalPages = data?.pages || 1;

  
return (
  <div className="space-y-6 text-gray-900 dark:text-gray-100">

    {/* Header */}
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Products</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your product catalog
        </p>
      </div>

      <button
        onClick={() => setShowCreateModal(true)}
        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
      >
        <Plus className="h-5 w-5" />
        Add Product
      </button>
    </div>

    {/* Loading */}
    {isLoading ? (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        ))}
      </div>
    ) : products.length === 0 ? (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          No products found
        </p>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg"
        >
          Create First Product
        </button>
      </div>
    ) : (
      <>
        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden">

          <table className="w-full">

            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {["Product","Price","Stock","Actions"].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs text-gray-500 dark:text-gray-300">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y dark:divide-gray-700">

              {products.map((product: any) => (
                <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">

                  {/* Product */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">

                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                        {product.images?.length ? (
                          <img
                            src={`${URL_Base}/${product.images[0]}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                            No Image
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="font-medium">{product.name}</p>
                        {product.discountPercent > 0 && (
                          <span className="text-red-500 text-xs">
                            -{product.discountPercent}%
                          </span>
                        )}
                      </div>

                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4">
                    <div className="font-semibold">
                      {formatCurrency(product.salePrice || product.originalPrice)}
                    </div>

                    {product.discountPercent > 0 && (
                      <div className="text-sm text-gray-500 line-through">
                        {formatCurrency(product.originalPrice)}
                      </div>
                    )}
                  </td>

                  {/* Stock */}
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        product.stock > 10
                          ? 'bg-green-100 text-green-700'
                          : product.stock > 0
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {product.stock} units
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex gap-2">

                      <button
                        onClick={() => setEditingProduct(product)}
                        className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 rounded"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm("Delete product?")) {
                            softDeleteMutation.mutate(product._id);
                          }
                        }}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 rounded"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>
                  </td>

                </tr>
              ))}
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
      </>
    )}

    {/* Modals */}
    {showCreateModal && (
      <CreateProductModal
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          queryClient.invalidateQueries({ queryKey: ['products'] });
        }}
      />
    )}

    {editingProduct && (
      <EditProductModal
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        onSuccess={() => {
          setEditingProduct(null);
          queryClient.invalidateQueries({ queryKey: ['products'] });
        }}
      />
    )}
  </div>
);
};
