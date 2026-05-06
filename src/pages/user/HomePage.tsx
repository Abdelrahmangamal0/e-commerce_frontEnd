import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi } from "@/lib/api/product.api";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/lib/utils";
import { ShoppingCart, Heart } from "lucide-react";
import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { cartApi } from "@/lib/api/cart.api";
import toast from "react-hot-toast";
import { URL_Base } from "../admin/UsersPage";
import { FiltersNavbar } from "@/layouts/FiltersNavbar";
import { Footer } from "@/components/layout/Footer";
import { Product } from "@/types";

export const HomePage = () => {

  const {user , refreshUser, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [page] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [priceRange] = useState<[number, number]>([0, 5000]);

  const { data, isLoading } = useQuery({
    queryKey: ["products", page, search],
    queryFn: () => productApi.getAll(page, 8, search),
  });

  const addToCartMutation = useMutation({
    mutationFn: cartApi.addToCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to cart");
    }
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
 

  const rawProducts = data?.result || [];

  const products = useMemo(() => {
    return rawProducts.filter((product: any) => {
      const categoryMatch =
        !selectedCategory || product.category === selectedCategory;

      const brandMatch =
        !selectedBrand || product.brand === selectedBrand;

      const priceMatch =
        product.salePrice >= priceRange[0] &&
        product.salePrice <= priceRange[1];

      return categoryMatch && brandMatch && priceMatch;
    });
  }, [rawProducts, selectedCategory, selectedBrand, priceRange]);

  const handleAddToCart = (productId: string) => {
    if (!isAuthenticated) {
      toast.error("Please login first");
      return;
    }
    addToCartMutation.mutate({ productId, quantity: 1 });
  };


  return (
    <div className="max-w-7xl mx-auto px-6 py-10 
    text-gray-900 dark:text-gray-100 transition-colors">

      <FiltersNavbar
        onSelectCategory={setSelectedCategory}
        onSelectBrand={setSelectedBrand}
      />
{/* Hero */}
<div
  className="
  relative overflow-hidden rounded-2xl p-12 mb-12
  bg-gradient-to-r 
  from-primary-600 via-primary-700 to-primary-800
  dark:from-gray-900 dark:via-gray-800 dark:to-gray-900
  shadow-lg dark:shadow-black/40
  flex items-center justify-center
text-center
"
>

{/* Overlay */}
<div className="absolute inset-0 bg-black/10 dark:bg-black/40" />

{/* Content */}
<div className="relative z-10 max-w-2xl">

  <h1 className="text-4xl font-bold mb-4 text-white">
    Welcome to SOUQ OKAZ
  </h1>

  <p className="text-lg mb-6 text-gray-100 dark:text-gray-300">
    Discover amazing products at great prices
  </p>

  <Link
    to="/products"
    className="
    inline-flex items-center gap-2
    bg-white dark:bg-primary-600
    text-primary-600 dark:text-white
    px-6 py-3 rounded-lg font-semibold
    hover:bg-gray-100 dark:hover:bg-primary-700
    transition-all duration-200
    shadow-md hover:shadow-lg
  "
  >
    Shop Now
  </Link>

</div>
</div>
      {/* Search */}
      <input
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-8 px-5 py-3 border 
        border-gray-300 dark:border-gray-700 
        bg-white dark:bg-gray-800 
        text-gray-900 dark:text-white 
        rounded-xl"
      />

      {/* Products */}
      {isLoading ? (
        <div className="text-center text-gray-500 dark:text-gray-400">
          Loading...
        </div>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No products found
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <div
              key={product._id}
              className="bg-white dark:bg-gray-800 
              rounded-xl shadow hover:shadow-lg 
              transition overflow-hidden"
            >
              <Link to={`/products/${product._id}`}>
                <div className="h-48 bg-gray-200 dark:bg-gray-700">
                  {product.images?.length ? (
                    <img
                      src={`${URL_Base}/${product.images[0]}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No Image
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-4">
                <h3 className="font-semibold line-clamp-2 mb-2">
                  {product.name}
                </h3>

                <div className="flex gap-2 mb-3">
                  <span className="text-primary-600 dark:text-primary-400 font-bold">
                    {formatCurrency(product.salePrice || product.originalPrice)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(product._id)}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={16} />
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
      isInWishlist(product._id)
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
      )}
    <Footer/>
    </div>
  );
};