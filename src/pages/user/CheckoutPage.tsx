import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { cartApi } from '@/lib/api/cart.api';
import { orderApi } from '@/lib/api/order.api';
import { couponApi } from '@/lib/api/coupon.api';
import { formatCurrency } from '@/lib/utils';
import { PaymentEnum } from '@/types';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

const checkoutSchema = z.object({
  region: z.string().min(1, 'Region is required'),
  city: z.string().min(1, 'City is required'),
  nationalAddress: z
    .string()
    .transform((v) => v.toUpperCase())
    .refine((v) => /^[A-Z]{4}\d{4}$/.test(v), {
      message: 'Must be 4 capital letters + 4 numbers',
    }),
  phone: z
    .string()
    .min(1, 'Phone is required')
    .refine((v) => /^(\+966|966|0)?5[0-9]{8}$/.test(v), {
      message: 'Invalid phone number',
    }),
  note: z.string().optional(),
  payment: z.nativeEnum(PaymentEnum),
  coupon: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.getCart(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      payment: PaymentEnum.PayPal,
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: orderApi.create,
    onSuccess: async (order) => {
      const orderId = order._id;

      if (!orderId) {
        toast.error('Failed to create order');
        return;
      }

      try {
        const session = await orderApi.checkout(orderId);

        if (session?.iframe_url) {
          window.location.href = session.iframe_url;
        } else if (session?.redirect_url) {
          window.location.href = session.redirect_url;
        } else {
          toast.success('Order created successfully');
          navigate('/orders');
        }
      } catch {
        toast.error('Payment failed');
      }
    },
    onError: () => {
      toast.error('Failed to create order');
    },
  });

  const handleApplyCoupon = async () => {
    if (!couponCode) return;

    try {
      const coupons = await couponApi.getAll(1, 100);
      const coupon = coupons.result?.find((c: any) => c._id === couponCode);

      if (coupon) {
        setAppliedCoupon(coupon);
        setValue('coupon', coupon._id);
        toast.success('Coupon applied');
      } else {
        toast.error('Invalid coupon code');
      }
    } catch {
      toast.error('Failed to apply coupon');
    }
  };

  const onSubmit = (data: CheckoutForm) => {
    const payload = {
      address: {
        region: data.region,
        city: data.city,
        nationalAddress: data.nationalAddress,
      },
      phone: data.phone,
      note: data.note,
      payment: data.payment,
      coupon: data.coupon || undefined,
    };

    createOrderMutation.mutate(payload);
  };

  const cart = cartData;
  const products = cart?.products || [];

  const calculateSubtotal = () => {
    return products.reduce((total: number, item: any) => {
      const product = item.productId as any;
      const price = product.salePrice || product.originalPrice || 0;
      return total + price * item.quantity;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const discount = appliedCoupon ? subtotal * (appliedCoupon.discount / 100) : 0;
  const total = subtotal - discount;

  if (products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate('/cart')}
            className="text-primary-600 hover:text-primary-700"
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 text-gray-900 dark:text-gray-100">

      <button
        onClick={() => navigate('/cart')}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Cart
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* FORM */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">

            <h2 className="text-2xl font-bold mb-6">
              Shipping Information
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  {...register('region')}
                  placeholder="Region"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700"
                />
                <input
                  {...register('city')}
                  placeholder="City"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>

              {errors.region && <p className="text-red-500 text-sm">{errors.region.message}</p>}
              {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}

              <input
                {...register('nationalAddress')}
                placeholder="nationalAddress ex: ABCD1234"
                maxLength={8}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700"
              />

              <input
                {...register('phone')}
                placeholder="Phone"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700"
              />

              <textarea
                {...register('note')}
                placeholder="Note"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700"
              />

              <select
                {...register('payment')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value="PayPal">PayPal</option>
                <option value="Card">Card</option>
                <option value="Vodafone">Vodafone</option>
                <option value="Fawry">Fawry</option>
              </select>

              {/* ✅ هنا التعديل */}
              <button
                type="submit"
                disabled={createOrderMutation.isPending}
                className="w-full bg-primary-600 text-white py-3 rounded-lg mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createOrderMutation.isPending ? 'Placing Order...' : 'Place Order'}
              </button>

            </form>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 h-fit shadow-sm">

          <h2 className="text-xl font-bold mb-4">Order Summary</h2>

          <div className="space-y-2 mb-4">
            {products.map((item: any) => {
              const p = item.productId;
              return (
                <div key={item._id} className="flex justify-between text-sm">

                  <span className="flex items-center gap-2">
                    {p.name} x {item.quantity}

                    {/* ✅ هنا التعديل */}
                    {createOrderMutation.isPending && (
                      <span className="text-gray-400 animate-pulse">...</span>
                    )}
                  </span>

                  <span>
                    {formatCurrency(p.salePrice)}
                  </span>

                </div>
              );
            })}
          </div>

          <div className="flex gap-2 mb-4">
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Coupon"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700"
            />
            <button
              onClick={handleApplyCoupon}
              className="px-4 bg-gray-200 dark:bg-gray-700 rounded-lg"
            >
              Apply
            </button>
          </div>

          {appliedCoupon && (
            <p className="text-green-500 text-sm mb-4">
              {appliedCoupon.discount}% discount applied
            </p>
          )}

          <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-green-500">
                <span>Discount</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}

            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};