import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { cartApi } from '@/lib/api/cart.api';
import { formatCurrency } from '@/lib/utils';
import { Heart, Trash2, ArrowLeft, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { URL_Base } from '../admin/UsersPage';
import { userApi } from '@/lib/api/user.api';
import { authApi } from '@/lib/api/auth.api';
import { productApi } from '@/lib/api/product.api';

export const FavoritesPage = () => {
    const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {user ,refreshUser, isAuthenticated } = useAuth();

  // 🔥 get wishlist
  
  const { data, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productApi.getAll(1, 100),
  });
  
  const wishlistIds = user?.wishList || [];
  console.log(wishlistIds);
  
  const products =
    data?.result?.filter((p: any) =>
      wishlistIds.includes(p._id)
        ) || [];
    
    console.log(data);
    
    
  // 🔥 remove from wishlist
  const removeMutation = useMutation({
    mutationFn: productApi.removeFromWishlist,
    onSuccess: async () => {
      toast.success('Removed from favorites');
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
       
    }
      ,
      
    onError: () => {
      toast.error('Failed to remove');
    },
  });

  // 🔥 add to cart
  const addToCartMutation = useMutation({
    mutationFn: cartApi.addToCart,
    onSuccess: () => {
      toast.success('Added to cart');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: () => {
      toast.error('Failed to add to cart');
    },
  });

  const handleAddToCart = (productId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login first');
      return;
    }
    addToCartMutation.mutate({ productId, quantity: 1 });
  };

  // 🔄 Loading
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8 text-gray-100">
        Loading...
      </div>
    );
  }

  // ❌ Empty
  if (wishlistIds.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center text-gray-400">
        <Heart className="mx-auto mb-4" size={40} />
        <p className="text-lg">No favorite products yet</p>

        <button
          onClick={() => navigate('/')}
          className="mt-4 text-primary-500 hover:underline"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 text-gray-900 dark:text-gray-100">

      {/* Back */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        Back
      </button>

      {/* Title */}
      <h1 className="text-3xl font-bold mb-6">
        ❤️ My Favorites
      </h1>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {wishlistIds.map((product: any) => (
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

            {/* Image */}
            <Link to={`/products/${product._id}`}>
              <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <img
                  src={`${URL_Base}/${product.images?.[0]}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />

                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    removeMutation.mutate(product._id);
                  }}
                  className="absolute top-2 right-2 bg-black/50 p-2 rounded-full hover:bg-black/70"
                >
                  <Trash2 size={16} className="text-white" />
                </button>

                {/* Discount */}
                {product.discountPercent > 0 && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs rounded">
                    -{product.discountPercent}%
                  </span>
                )}
              </div>
            </Link>

            {/* Info */}
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

              {/* Actions */}
              <button
                onClick={() => handleAddToCart(product._id)}
                className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-2 rounded-lg text-sm"
              >
                <ShoppingCart size={16} />
                Add to Cart
              </button>
            </div>

          </div>
        ))}

      </div>
    </div>
  );
};