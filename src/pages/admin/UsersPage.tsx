import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/lib/api/user.api';
import { User, RoleEnum } from '@/types';
import { formatDate } from '@/lib/utils';
import { AlertCircle, RefreshCw, Search, User as UserIcon } from 'lucide-react';
export const URL_Base = 'https://api.souqokaz.it.com/upload'
export const AdminUsersPage = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-users', page],
    queryFn: () => userApi.getAllUsers(page, 10),
    retry: false,
  });
// console.log('data',data);

const users = data?.data?.users.result || [];
const totalPages = data?.data?.users?.pages || 1;
  
 

  // Check if endpoint doesn't exist (404 or 501)
  const endpointMissing = error && (
    (error as any)?.response?.status === 404 ||
    (error as any)?.response?.status === 501 ||
    (error as any)?.response?.status === 500
  );

  if (endpointMissing) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-2">Manage user accounts</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                Backend Endpoint Required
              </h3>
              <p className="text-yellow-800 mb-4">
                The backend endpoint <code className="bg-yellow-100 px-2 py-1 rounded">GET /user/admin/users</code> needs to be implemented.
              </p>
              <p className="text-sm text-yellow-700">
                This endpoint should return a paginated list of all users (admin only).
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-2">Manage user accounts</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter((user: User) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      user.userName?.toLowerCase().includes(searchLower) ||
      user.firstName.toLowerCase().includes(searchLower) ||
      user.lastName.toLowerCase().includes(searchLower) ||
      user.phone?.includes(searchTerm)
    );
  });


  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100">
  
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage user accounts
          </p>
        </div>
  
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 border 
          border-gray-300 dark:border-gray-700 
          rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>
  
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search users..."
          className="w-full pl-10 pr-4 py-2 
          border border-gray-300 dark:border-gray-700 
          bg-white dark:bg-gray-800 
          rounded-lg"
        />
      </div>
  
      {/* Empty */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-12 text-center rounded-xl border dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">
            No users found
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden">
  
          <table className="w-full">
  
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {["User","Email","Phone","Role","Verified","Joined"].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs text-gray-500 dark:text-gray-300">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
  
            <tbody className="divide-y dark:divide-gray-700">
  
              {filteredUsers.map((user: User) => (
                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
  
                  {/* User */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
  
                      {user.profilePicture ? (
                        <img
                          src={`${URL_Base}/${user.profilePicture}`}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <UserIcon size={16} />
                        </div>
                      )}
  
                      <div>
                        <p className="font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                        {user.userName && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            @{user.userName}
                          </p>
                        )}
                      </div>
  
                    </div>
                  </td>
  
                  {/* Email */}
                  <td className="px-6 py-4">{user.email}</td>
  
                  {/* Phone */}
                  <td className="px-6 py-4">{user.phone || "N/A"}</td>
  
                  {/* Role */}
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.role === RoleEnum.Admin
                        ? "bg-blue-100 text-blue-700"
                        : user.role === RoleEnum.SuperAdmin
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                    }`}>
                      {user.role}
                    </span>
                  </td>
  
                  {/* Verified */}
                  <td className="px-6 py-4">
                    {user.confirmEmail ? (
                      <span className="text-green-500">✔</span>
                    ) : (
                      <span className="text-yellow-500">Pending</span>
                    )}
                  </td>
  
                  {/* Date */}
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {user.createdAt
                      ? formatDate(new Date(user.createdAt))
                      : "N/A"}
                  </td>
  
                </tr>
              ))}
            </tbody>
  
          </table>
        </div>
      )}
  
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-4 py-2 rounded-lg ${
                page === i + 1
                  ? "bg-primary-600 text-white"
                  : "border dark:border-gray-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
