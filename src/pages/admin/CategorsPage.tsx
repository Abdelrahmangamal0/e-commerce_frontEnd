import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import { categoryApi } from "@/lib/api/category.api";
import { CreateCategoryModal } from "@/components/admin/CreateCategoryModal";
import { EditCategoryModal } from "@/components/admin/EditCategoryModal";
import { URL_Base } from "./UsersPage";

export const AdminCategoriesPage = () => {

  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["categories", page],
    queryFn: () => categoryApi.getAll(page, 10),
  });

  const deleteMutation = useMutation({
    mutationFn: categoryApi.softDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted");
    },
  });

  const categories = data?.result || [];
  const totalPages = data?.pages || 1;

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100">
  
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
  
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage product categories
          </p>
        </div>
  
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl"
        >
          <Plus className="h-5 w-5" />
          Add Category
        </button>
      </div>
  
      {/* Table */}
      <div className="
        bg-white dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700 
        rounded-2xl overflow-hidden
      ">
  
        {isLoading ? (
          <div className="p-6 space-y-4 animate-pulse">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-xl" />
            ))}
          </div>
        ) : categories.length === 0 ? (
  
          <div className="p-12 text-center">
            <ImageIcon className="h-14 w-14 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
  
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">
              No categories found
            </h3>
  
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-5 bg-primary-600 text-white px-6 py-2.5 rounded-xl"
            >
              Create First Category
            </button>
          </div>
  
        ) : (
  
          <table className="w-full">
  
            {/* Header */}
            <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs text-gray-500 dark:text-gray-300 uppercase">
                  Category
                </th>
  
                <th className="px-6 py-4 text-right text-xs text-gray-500 dark:text-gray-300 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
  
            {/* Body */}
            <tbody className="divide-y dark:divide-gray-700">
  
              {categories.map((category: any) => (
                <tr
                  key={category._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
  
                  {/* Category */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
  
                      {category.image ? (
                        <img
                          src={`${URL_Base}/${category.image}`}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                          <ImageIcon size={18} />
                        </div>
                      )}
  
                      <div>
                        <p className="font-medium">
                          {category.name}
                        </p>
  
                        {category.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                            {category.description}
                          </p>
                        )}
                      </div>
  
                    </div>
                  </td>
  
                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-3">
  
                      <button
                        onClick={() => setEditingCategory(category)}
                        className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600"
                      >
                        <Edit size={18} />
                      </button>
  
                      <button
                        onClick={() => {
                          if (confirm("Delete this category?")) {
                            deleteMutation.mutate(category._id);
                          }
                        }}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
  
                    </div>
                  </td>
  
                </tr>
              ))}
  
            </tbody>
          </table>
  
        )}
      </div>
  
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-4 py-2 rounded-xl border dark:border-gray-700 ${
                page === i + 1
                  ? "bg-primary-600 text-white"
                  : "hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
  
      {/* Modals */}
      {showCreateModal && (
        <CreateCategoryModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            setShowCreateModal(false);
          }}
        />
      )}
  
      {editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            setEditingCategory(null);
          }}
        />
      )}
  
    </div>
  );
};