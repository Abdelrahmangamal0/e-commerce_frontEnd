import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "@/lib/api/notification.api";
import { Bell, X } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Notification } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationApi.getAll(1, 100),
    enabled: isAuthenticated,
    refetchInterval: 10000,
  });

  if (!isAuthenticated) return null;

  const notifications =
    data?.data?.notifications?.result
      ?.slice()
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      ) || [];

  const unreadCount = notifications.filter(
    (n: any) =>  n.isRead != 'true'
  
  ).length;

  const markAsReadMutation = useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: (_, id) => {
      queryClient.setQueryData(["notifications"], (oldData: any) => {
        if (!oldData) return oldData;

        const updated = oldData.data.notifications.result.map((n: any) =>
          n._id === id ? { ...n, isRead: true } : n
        );

        return {
          ...oldData,
          data: {
            ...oldData.data,
            notifications: {
              ...oldData.data.notifications,
              result: updated,
            },
          },
        };
      });
    },
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (notification: Notification) => {
    if (notification.isRead != 'true' && notification._id) {
      markAsReadMutation.mutate(notification._id);
    }

    navigate(`/notifications/${notification._id}`, {
      state: notification,
    });
  };
// console.log(notifications);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        <Bell className="h-6 w-6 text-gray-800 dark:text-gray-200" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="
          absolute right-0 mt-2 w-96 
          bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          rounded-2xl shadow-xl z-[9999] 
          flex flex-col max-h-[500px]
        "
        >

          {/* Header */}
          <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Notifications
            </h3>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {unreadCount} unread
                </span>
              )}

              <button onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-10 text-center text-gray-400 dark:text-gray-500">
                <Bell className="h-10 w-10 mx-auto mb-3" />
                No notifications yet
              </div>
            ) : (
              notifications.map((n: Notification) => (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-4 cursor-pointer transition border-b last:border-0 ${
                    n.isRead != 'true'
                      ? "bg-blue-50 dark:bg-blue-900/30"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {n.type}
                      </p>

                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                        {n.message}
                      </p>

                      {n.createdAt && (
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDate(new Date(n.createdAt))}
                        </p>
                      )}
                    </div>

                    {n.isRead != 'true' && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
              <button className="text-sm font-medium hover:underline text-gray-700 dark:text-gray-200">
                View all notifications
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
