
"use client";

import type { Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/context/AppContext";
import { useEffect, useState } from "react";

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: Category | "All";
  onSelectCategory: (category: Category | "All") => void;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  const { isClient } = useAppContext();
  const [displayCategories, setDisplayCategories] = useState<(Category | "All")[]>([]);

  useEffect(() => {
    const safePropCategories = Array.isArray(categories) ? categories : [];
    if (isClient) {
      setDisplayCategories(["All", ...safePropCategories]);
    } else {
      setDisplayCategories(["All", ...safePropCategories]);
    }
  }, [isClient, categories]);

  if (!isClient) {
    const safeCategoriesForSsr = Array.isArray(categories) ? categories : [];
    return (
      <div className="flex flex-wrap gap-2 justify-center">
        {(["All", ...safeCategoriesForSsr]).map((category) => (
          <Button key={category} variant="plain" disabled className="text-gray-600">
            {category}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {displayCategories.map((category) => {
        const displayName = category === "All" ? "All" : category;
        
        return (
          <Button
            key={category}
            variant="plain"
            onClick={() => onSelectCategory(category)}
            className={cn(
              "transition-all duration-200 ease-in-out font-bold px-2 py-1 cursor-pointer",
              selectedCategory === category 
                ? "text-blue-600" 
                : "text-black hover:text-blue-600"
            )}
            aria-pressed={selectedCategory === category}
          >
            {displayName}
          </Button>
        );
      })}
    </div>
  );
}

