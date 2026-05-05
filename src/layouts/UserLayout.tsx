import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';


export const UserLayout = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <Navbar />
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
};