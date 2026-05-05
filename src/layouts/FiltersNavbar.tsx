import { useQuery } from "@tanstack/react-query";
import { categoryApi } from "@/lib/api/category.api";
import { brandApi } from "@/lib/api/brand.api";
import { useState } from "react";

interface Props {
  onSelectCategory: (id: string | null) => void;
  onSelectBrand: (id: string | null) => void;
}

export const FiltersNavbar = ({ onSelectCategory, onSelectBrand }: Props) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeBrand, setActiveBrand] = useState<string | null>(null);

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryApi.getAll(1, 50),
  });

  const { data: brandsData } = useQuery({
    queryKey: ["brands"],
    queryFn: () => brandApi.getAll(1, 50),
  });

  const categories = categoriesData?.result || [];
  const brands = brandsData?.result || [];

  return (
    <div
      className="
      sticky top-20 z-40 mb-6
      backdrop-blur
      bg-white/80 dark:bg-gray-800/80
      border border-gray-200 dark:border-gray-700
      rounded-2xl px-4 py-3
      shadow-sm
      transition-colors
    "
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4">

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Categories:
          </span>

          {categories.map((cat: any) => (
            <button
              key={cat._id}
              onClick={() => {
                const value = activeCategory === cat._id ? null : cat._id;
                setActiveCategory(value);
                onSelectCategory(value);
              }}
              className={`
                px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition
                ${
                  activeCategory === cat._id
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                }
              `}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Brands */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Brands:
          </span>

          {brands.map((brand: any) => (
            <button
              key={brand._id}
              onClick={() => {
                const value = activeBrand === brand._id ? null : brand._id;
                setActiveBrand(value);
                onSelectBrand(value);
              }}
              className={`
                px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition
                ${
                  activeBrand === brand._id
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                }
              `}
            >
              {brand.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};