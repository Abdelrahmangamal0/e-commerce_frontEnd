import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { productApi } from '@/lib/api/product.api';
import { formatCurrency } from '@/lib/utils';
import { ShoppingCart, Heart, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cartApi } from '@/lib/api/cart.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { URL_Base } from '../admin/UsersPage';
import { Product } from '@/types';

export const ProductsPage = () => {
  const { user, refreshUser, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, search],
    queryFn: () => productApi.getAll(page, 12, search || undefined),
  });


  const addToCartMutation = useMutation({
    mutationFn: cartApi.addToCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Added to cart');
    
    },
    onError: () => {
      toast.error('Failed to add to cart');
    },
  });

  const addToWishlistMutation = useMutation({
    mutationFn: productApi.addToWishlist,
    onSuccess: async () => {
      await refreshUser();
      toast.success('Added to wishlist');
    },
  });
  
  const removeFromWishlistMutation = useMutation({
    mutationFn: productApi.removeFromWishlist,
    onSuccess: async () => {
      await refreshUser();
      toast.success('Removed from wishlist');
    },
  });

  const wishlistProducts = (user?.wishList as Product[]) || [];

const isInWishlist = (productId: string) =>
  wishlistProducts.some((p) => p._id === productId);

  const handleToggleWishlist = (productId: string) => {
  if (!isAuthenticated) {
    toast.error('Please login first');
    return;
  }

  if (isInWishlist(productId)) {
    removeFromWishlistMutation.mutate(productId);
  } else {
    addToWishlistMutation.mutate(productId);
  }
};
 
  
  const handleAddToCart = (productId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    addToCartMutation.mutate({ productId, quantity: 1 });
  };

  const handleAddToWishlist = (productId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }
    addToWishlistMutation.mutate(productId);
  };
  
  
  const products = data?.result || [];
  const totalPages = data?.pages || 1;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 text-gray-900 dark:text-gray-100">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">All Products</h1>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // مهم: يرجع لأول صفحة عند البحث
            }}
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-3 rounded-xl 
            border border-gray-300 dark:border-gray-700
            bg-white dark:bg-gray-800"
          />
        </div>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 p-4 rounded-xl animate-pulse"
            >
              <div className="h-40 bg-gray-200 dark:bg-gray-700 mb-3" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No products found
        </p>
      ) : (
        <>
          {/* Products */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {products.map((product) => (
              <div
                key={product._id}
                className="
                bg-white dark:bg-gray-800
                rounded-xl overflow-hidden
                shadow-sm hover:shadow-lg
                transition-all duration-300
                group
              "
              >
                <Link to={`/products/${product._id}`}>
                  <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <img
                      src={`${URL_Base}/${product.images?.[0]}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />

                    {product.discountPercent > 0 && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded">
                        -{product.discountPercent}%
                      </span>
                    )}
                  </div>
                </Link>

                <div className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-primary-600 dark:text-primary-400 font-bold">
                      {formatCurrency(product.salePrice || product.originalPrice)}
                    </span>

                    {product.discountPercent > 0 && (
                      <span className="text-gray-500 line-through text-sm">
                        {formatCurrency(product.originalPrice)}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(product._id!)}
                      className="flex-1 bg-primary-600 text-white py-2 rounded-lg text-sm"
                    >
                      Add
                    </button>

                    <button
  onClick={() => handleToggleWishlist(product._id!)}
  className="
    p-2 border border-gray-300 dark:border-gray-600
    rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
  "
>
  <Heart
    size={16}
    className={
      isInWishlist(product._id!)
        ? 'text-red-500 fill-red-500'
        : 'text-gray-400'
    }
  />

                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2">

            {/* Prev */}
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-4 py-2 border dark:border-gray-600 rounded-lg ${
                page === 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Prev
            </button>

            {/* Pages */}
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-4 py-2 rounded-lg ${
                  page === i + 1
                    ? "bg-primary-600 text-white"
                    : "border dark:border-gray-600"
                }`}
              >
                {i + 1}
              </button>
            ))}

            {/* Next */}
            <button
              onClick={() =>
                setPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={page === totalPages}
              className={`px-4 py-2 border dark:border-gray-600 rounded-lg ${
                page === totalPages ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Next
            </button>

          </div>
        </>
      )}
    </div>
  );
};