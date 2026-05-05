import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';
import { UserLayout } from './layouts/UserLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { EmailConfirmationPage } from './pages/auth/EmailConfirmationPage';

// User Pages
import { HomePage } from './pages/user/HomePage';
import { ProductsPage } from './pages/user/ProductsPage';
import { ProductDetailPage } from './pages/user/ProductDetailPage';
import { CartPage } from './pages/user/CartPage';
import { CheckoutPage } from './pages/user/CheckoutPage';
import { OrdersPage } from './pages/user/OrdersPage';
import { ProfilePage } from './pages/user/ProfilePage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/DashboardPage';
import { AdminProductsPage } from './pages/admin/ProductsPage';
import { AdminOrdersPage } from './pages/admin/OrdersPage';
import { AdminUsersPage } from './pages/admin/UsersPage';
import { AdminBrandsPage } from './pages/admin/BrandsPage';
import { AdminCategoriesPage } from './pages/admin/CategorsPage';
import { AdminCouponsPage } from './pages/admin/CouponPage';
import { NotificationDetailsPage } from './pages/user/NotificationDetailsPage';
import { useEffect } from 'react';
import { FavoritesPage } from './pages/user/FavoritesPage';

function App() {
  useEffect(() => {
    const theme = localStorage.getItem('theme');
  
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/confirm-email" element={<EmailConfirmationPage />} />
          {/* User Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <UserLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/:productId" element={<ProductDetailPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="Favorites" element={<FavoritesPage />} />
            <Route path="/notifications/:id" element={<NotificationDetailsPage />} />
          
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="Categories" element={<AdminCategoriesPage />} />
            <Route path="Coupons" element={<AdminCouponsPage />} />
            <Route path="Brands" element={<AdminBrandsPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="users" element={<AdminUsersPage />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
