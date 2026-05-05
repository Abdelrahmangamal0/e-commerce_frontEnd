import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/dashboard.api';
import { formatCurrency } from '@/lib/utils';
import { Package, ShoppingCart, Users, DollarSign, TrendingUp } from 'lucide-react';

export const AdminDashboardPage = () => {

  const { data: ordersOverview } = useQuery({
    queryKey: ['dashboard-orders'],
    queryFn: () => dashboardApi.getOrdersOverview(),
  });

  const { data: usersOverview } = useQuery({
    queryKey: ['dashboard-users'],
    queryFn: () => dashboardApi.getUsersOverview(),
  });

  const { data: productsOverview } = useQuery({
    queryKey: ['dashboard-products'],
    queryFn: () => dashboardApi.getProductsOverview(),
  });

  const stats = [
    {
      name: 'Total Users',
      value: usersOverview?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Products',
      value: productsOverview?.totalProducts || 0,
      icon: Package,
      color: 'bg-green-500',
    },
    {
      name: 'Total Orders',
      value: ordersOverview?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'bg-purple-500',
    },
    {
      name: 'Total Revenue',
      value: formatCurrency(ordersOverview?.totalRevenue || 0),
      icon: DollarSign,
      color: 'bg-yellow-500',
    },
  ];

  const orderStatuses = ordersOverview?.ordersByStatus || {
    pending:0,
    placed:0,
    onWay:0,
    delivered:0,
    cancel:0
  };

  return (
    <div className="space-y-8 text-gray-900 dark:text-gray-100">

      <h1 className="text-3xl font-bold">
        Dashboard
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {stats.map((stat) => {

          const Icon = stat.icon;

          return (
            <div
              key={stat.name}
              className="
              bg-white dark:bg-gray-800 
              border border-gray-200 dark:border-gray-700 
              p-6 rounded-2xl shadow-sm 
              hover:shadow-md transition
            "
            >
              <div className="flex justify-between">

                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {stat.name}
                  </p>

                  <p className="text-2xl font-bold mt-2">
                    {stat.value}
                  </p>
                </div>

                <div className={`${stat.color} p-3 rounded-xl`}>
                  <Icon className="text-white" />
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Orders Status */}
      <div className="
        bg-white dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700 
        p-6 rounded-2xl shadow-sm
      ">

        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <TrendingUp size={20}/>
          Orders by Status
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

          {/* Pending */}
          <div className="text-center p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20">
            <p className="text-xl font-bold">{orderStatuses.pending}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
          </div>

          {/* Placed */}
          <div className="text-center p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20">
            <p className="text-xl font-bold">{orderStatuses.placed}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Placed</p>
          </div>

          {/* On Way */}
          <div className="text-center p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20">
            <p className="text-xl font-bold">{orderStatuses.onWay}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">On Way</p>
          </div>

          {/* Delivered */}
          <div className="text-center p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
            <p className="text-xl font-bold">{orderStatuses.delivered}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Delivered</p>
          </div>

          {/* Cancel */}
          <div className="text-center p-4 rounded-xl bg-red-50 dark:bg-red-900/20">
            <p className="text-xl font-bold">{orderStatuses.cancel}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Cancelled</p>
          </div>

        </div>
      </div>

    </div>
  );
};