import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { notificationApi } from "@/lib/api/notification.api";
import { entityApi } from "@/lib/api/entity.api";
import { formatDate } from "@/lib/utils";
import { RenderEntity } from "./RenderEntity";
import { ArrowLeft } from "lucide-react";

export const NotificationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // 🔥 1. notification
  const { data: notification, isLoading } = useQuery({
    queryKey: ["notification", id],
    queryFn: () => notificationApi.getById(id!),
    enabled: !!id,
  });

  // 🔥 2. entity
  const { data: entity, isLoading: entityLoading } = useQuery({
    queryKey: ["entity", notification?.Entity?.id],
    queryFn: () =>
      entityApi.getEntity(
        notification!.Entity.kind,
        notification!.Entity.id
      ),
    enabled: !!notification?.Entity?.id,
  });

  if (isLoading) {
    return (
      <div className="p-8 text-gray-500 dark:text-gray-400">
        Loading notification...
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="p-8 text-red-500">
        Notification not found
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 text-gray-900 dark:text-gray-100">

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      {/* Notification */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm mb-6">

        <h2 className="text-xl font-bold mb-4">Notification</h2>

        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
            <p className="font-semibold">{notification.type}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Message</p>
            <p>{notification.message}</p>
          </div>

          {notification.createdAt && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
              <p>{formatDate(new Date(notification.createdAt))}</p>
            </div>
          )}
        </div>
      </div>

      {/* Entity */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">

        <h2 className="text-xl font-bold mb-4">Details</h2>

        {entityLoading ? (
          <p className="text-gray-500 dark:text-gray-400">
            Loading details...
          </p>
        ) : (
          <RenderEntity
            kind={notification.Entity.kind}
            data={entity}
          />
        )}
      </div>
    </div>
  );
};