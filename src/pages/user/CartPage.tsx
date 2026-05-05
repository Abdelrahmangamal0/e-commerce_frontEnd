import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '@/lib/api/cart.api';
import { formatCurrency } from '@/lib/utils';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Product } from '@/types';
import { URL_Base } from '../admin/UsersPage';

export const CartPage = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getCart,
  });

  const removeFromCartMutation = useMutation({
    mutationFn: cartApi.removeFromCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Removed');
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: cartApi.addToCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: cartApi.clearCart,
    onSuccess: () => {
      queryClient.setQueryData(['cart'], (old: any) => ({
        ...old,
        products: [],
      }));
      toast.success('Cart cleared');
    },
  });

  const cart = data;
  const products = cart?.products || [];

  const total = products.reduce((acc: number, item: any) => {
    const p = item.productId as Product;
    const price = p.salePrice || p.originalPrice || 0;
    return acc + price * item.quantity;
  }, 0);

  if (isLoading) {
    return (
      <div className="p-8 text-gray-500 dark:text-gray-400">
        Loading...
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="text-center py-16 text-gray-900 dark:text-gray-100">
        <ShoppingBag className="mx-auto mb-4 h-20 w-20 text-gray-400" />
        <p>Your cart is empty</p>
        <Link to="/products" className="text-primary-600 mt-4 inline-block">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 text-gray-900 dark:text-gray-100">

      {/* Header */}
      <div className="flex justify-between mb-8">
        <h1 className="text-3xl font-bold">Cart</h1>
        <button
          onClick={() => clearCartMutation.mutate()}
          className="text-red-600 dark:text-red-400"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {products.map((item: any) => {
            const product = item.productId as Product;
            const price = product.salePrice || product.originalPrice || 0;

            return (
              <div
                key={item._id}
                className="flex gap-4 p-4 rounded-xl 
                bg-white dark:bg-gray-800 
                border border-gray-200 dark:border-gray-700"
              >
                <img
                  src={`${URL_Base}/${product.images?.[0]}`}
                  className="w-24 h-24 rounded object-cover"
                />

                <div className="flex-1">
                  <h3 className="font-semibold">{product.name}</h3>

                  <p className="text-primary-600">
                    {formatCurrency(price)}
                  </p>

                  {/* Quantity */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() =>
                        updateQuantityMutation.mutate({
                          productId: product._id as string,
                          quantity: item.quantity - 1,
                        })
                      }
                      className="p-2 border dark:border-gray-600 rounded"
                    >
                      <Minus size={14} />
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() =>
                        updateQuantityMutation.mutate({
                          productId: product._id as string,
                          quantity: item.quantity + 1,
                        })
                      }
                      className="p-2 border dark:border-gray-600 rounded"
                    >
                      <Plus size={14} />
                    </button>

                    <button
                      onClick={() =>
                        removeFromCartMutation.mutate({
                          productIds: [product._id as string],
                        })
                      }
                      className="ml-auto text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 h-fit">
          <h2 className="text-xl font-bold mb-4">Summary</h2>

          <div className="flex justify-between mb-2">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>

          <Link
            to="/checkout"
            className="mt-4 block w-full bg-primary-600 text-white text-center py-3 rounded-lg"
          >
            Checkout <ArrowRight className="inline ml-2" size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};