import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '@/lib/api/product.api';
import { formatCurrency } from '@/lib/utils';
import { ShoppingCart, Heart, ArrowLeft, Minus, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cartApi } from '@/lib/api/cart.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { URL_Base } from '../admin/UsersPage';

export const ProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productApi.getById(productId!),
    enabled: !!productId,
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
    onSuccess: () => {
      toast.success('Added to wishlist');
    },
    onError: () => {
      toast.error('Failed to add to wishlist');
    },
  });

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    if (!productId) return;
    addToCartMutation.mutate({ productId, quantity });
  };

  const handleAddToWishlist = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      navigate('/login');
      return;
    }
    if (!productId) return;
    addToWishlistMutation.mutate(productId);
  };

  const product = data;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-32 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Product not found</p>
          <button
            onClick={() => navigate('/products')}
            className="mt-4 text-primary-600 hover:text-primary-700"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const images = product.images || [];
  const salePrice = product.salePrice || product.originalPrice;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 text-gray-900 dark:text-gray-100">
  
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
      >
        <ArrowLeft size={18} />
        Back
      </button>
  
      <div className="grid lg:grid-cols-2 gap-10">
  
        {/* Images */}
        <div>
          <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden mb-4">
            <img
              src={`${URL_Base}/${images[selectedImageIndex]}`}
              className="w-full h-full object-cover"
            />
          </div>
  
          <div className="grid grid-cols-4 gap-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImageIndex(i)}
                className={`rounded-lg overflow-hidden border-2 ${
                  selectedImageIndex === i
                    ? "border-primary-600"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <img src={`${URL_Base}/${img}`} />
              </button>
            ))}
          </div>
        </div>
  
        {/* Info */}
        <div className="space-y-6">
  
          {/* Title */}
          <h1 className="text-3xl font-bold">
            {product.name}
          </h1>
  
          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {formatCurrency(salePrice)}
            </span>
  
            {product.discountPercent > 0 && (
              <span className="text-gray-500 line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>
  
          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300">
            {product.description}
          </p>
  
          {/* Stock */}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Stock: {product.stock}
          </p>
  
          {/* Quantity */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="p-2 border dark:border-gray-700 rounded-lg"
            >
              <Minus size={16} />
            </button>
  
            <span className="text-lg font-bold">{quantity}</span>
  
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="p-2 border dark:border-gray-700 rounded-lg"
            >
              <Plus size={16} />
            </button>
          </div>
  
          {/* Actions */}
          <div className="flex gap-4">
  
            <button
              onClick={handleAddToCart}
              className="
              flex-1 bg-primary-600 text-white py-3 rounded-xl
              hover:bg-primary-700 transition
              flex items-center justify-center gap-2
            "
            >
              <ShoppingCart size={18} />
              Add to Cart
            </button>
  
            <button
              onClick={handleAddToWishlist}
              className="
              p-3 border border-gray-300 dark:border-gray-700
              rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700
            "
            >
              <Heart size={18} />
            </button>
  
          </div>
        </div>
      </div>
    </div>
  );
};
