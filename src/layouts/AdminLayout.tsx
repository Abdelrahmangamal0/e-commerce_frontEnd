import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  LogOut,
  Menu,
} from 'lucide-react';
import { useState } from 'react';

export const AdminLayout = () => {
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/Categories', icon: Package, label: 'Categories' },
    { to: '/admin/Brands', icon: Package, label: 'Brands' },
    { to: '/admin/products', icon: Package, label: 'Products' },
    { to: '/admin/coupons', icon: Package, label: 'Coupons' },
    { to: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { to: '/admin/users', icon: Users, label: 'Users' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Admin Panel
        </h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <div className="flex">
        
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } fixed lg:static inset-y-0 left-0 z-50 w-64 
          bg-white dark:bg-gray-800 
          border-r border-gray-200 dark:border-gray-700 
          transition-transform duration-300 ease-in-out`}
        >
          <div className="h-full flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Admin Panel
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {user?.email}
              </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/admin'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary-50 dark:bg-gray-700 text-primary-700 dark:text-primary-300 font-medium'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`
                    }
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg 
                text-red-700 dark:text-red-400 
                hover:bg-red-50 dark:hover:bg-red-900/30 
                transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 transition-colors">
          <Outlet />
        </main>
      </div>
    </div>
  );
};