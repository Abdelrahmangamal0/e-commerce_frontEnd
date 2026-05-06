import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingCart, User, LogOut, Menu, Moon, Sun, ShoppingBag, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cartApi } from '@/lib/api/cart.api';
import { NotificationBell } from '@/components/notifications/NotificationBell';
// import logo from ;

export const Navbar = () => {
  const { isAuthenticated, logout, user, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  
  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.getCart(),
    enabled: isAuthenticated,
  });



  const [ordersCount, setOrdersCount] = useState(
    Number(localStorage.getItem("ordersCount")) || 0
  );
  
  useEffect(() => {
    const updateOrdersCount = () => {
      const count = Number(localStorage.getItem("ordersCount")) || 0;
      setOrdersCount(count);
    };
  
    window.addEventListener("orders-cleared", updateOrdersCount);
    window.addEventListener("orders-updated", updateOrdersCount);
  
    return () => {
      window.removeEventListener("orders-cleared", updateOrdersCount);
      window.removeEventListener("orders-updated", updateOrdersCount);
    };
  }, []); 
  
  // console.log(ordersCount);
  
  const cartItemCount = cartData?.products?.length || 0;

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
{/* Logo */}
<Link to="/" className="flex items-center gap-2">
  <img
    src={'src/assets/image.png'}
    alt="Souq Okaz"
    className="h-10 w-10 rounded-full object-cover ring-2 ring-primary-500/30"
  />
  <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
    SOUQ OKAZ
  </span>
</Link>

          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
          {isAuthenticated ? (
  <NavLink
  to="/orders"
  className={({ isActive }) =>
    `relative px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? "text-primary-600 bg-primary-50 dark:text-primary-300 dark:bg-gray-800"
        : "text-gray-700 dark:text-gray-200 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800"
    }`
  }
>
  <div className="flex items-center gap-2">
    <ShoppingBag className="h-5 w-5" />
    Orders

    {ordersCount > 0 && (
      <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-0.5">
        {ordersCount}
      </span>
    )}
  </div>
</NavLink>
):(
  <>
    <Link
      to="/login"
      className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 transition-colors"
    >
      Login
    </Link>
    <Link
      to="/signup"
      className="px-4 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
    >
      Sign Up
    </Link>
  </>
)}
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-primary-600 bg-primary-50 dark:text-primary-300 dark:bg-gray-800'
                    : 'text-gray-700 dark:text-gray-200 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`
              }
            >
              Products
            </NavLink>

            {isAuthenticated ? (
              <>
                <NotificationBell />

                <Link
                  to="/cart"
                  className="relative px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/profile"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <User className="h-5 w-5" />
                  <span>{user?.firstName}</span>
                </Link>
                <Link
  to="/favorites"
    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
>
  <Heart className="h-5 w-5" />
  <span>Favorites</span>
</Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="px-3 py-2 rounded-md text-sm font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Admin
                  </Link>
                )}

                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Toggle theme"
                >
                  {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>

                <button
                  onClick={logout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-red-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-2">
              <NavLink
                to="/products"
                className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </NavLink>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/cart"
                    className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Cart {cartItemCount > 0 && `(${cartItemCount})`}
                  </Link>
                  <Link
                    to="/profile"
                    className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="px-4 py-2 rounded-md text-sm font-medium text-primary-600 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-gray-50 text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
