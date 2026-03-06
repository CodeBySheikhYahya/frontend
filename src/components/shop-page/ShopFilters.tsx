"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getCategoryAttributes } from "@/lib/supabase/admin-category-attributes";
import { getAttributeValues, type AttributeValue } from "@/lib/supabase/admin-attributes";
import { getCategoriesForNavigation, type NavigationCategory } from "@/lib/supabase/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShopFiltersProps {
  onFilterChange?: (filters: {
    categoryId?: string;
    attributeFilters?: Record<string, string[]>;
  }) => void;
  initialCategoryId?: string;
}

const ShopFilters = ({ onFilterChange, initialCategoryId }: ShopFiltersProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [categories, setCategories] = useState<NavigationCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categoryAttributes, setCategoryAttributes] = useState<any[]>([]);
  const [attributeValues, setAttributeValues] = useState<Record<string, AttributeValue[]>>({});
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length === 0) return;
    
    if (initialCategoryId) {
      setSelectedCategory(initialCategoryId);
      // Auto-expand parent if child is selected
      const findParentForCategory = (cats: NavigationCategory[], catId: string): string | null => {
        for (const cat of cats) {
          if (cat.id === catId) return cat.id;
          if (cat.children) {
            const found = cat.children.find(c => c.id === catId);
            if (found) return cat.id;
            // Recursively check nested children
            for (const child of cat.children) {
              if (child.children) {
                const nestedFound = child.children.find(c => c.id === catId);
                if (nestedFound) return cat.id;
              }
            }
          }
        }
        return null;
      };
      const parentId = findParentForCategory(categories, initialCategoryId);
      if (parentId && !expandedItems.includes(parentId)) {
        setExpandedItems(prev => [...prev, parentId]);
      }
    } else {
      const categoryParam = searchParams.get("category");
      if (categoryParam) {
        setSelectedCategory(categoryParam);
        // Also expand parent if needed
        const findParentForCategory = (cats: NavigationCategory[], catId: string): string | null => {
          for (const cat of cats) {
            if (cat.id === catId) return cat.id;
            if (cat.children) {
              const found = cat.children.find(c => c.id === catId);
              if (found) return cat.id;
            }
          }
          return null;
        };
        const parentId = findParentForCategory(categories, categoryParam);
        if (parentId && !expandedItems.includes(parentId)) {
          setExpandedItems(prev => [...prev, parentId]);
        }
      }
    }
  }, [searchParams, initialCategoryId, categories]);

  useEffect(() => {
    if (selectedCategory) {
      fetchCategoryAttributes();
    } else {
      setCategoryAttributes([]);
      setAttributeValues({});
      setSelectedFilters({});
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    const cats = await getCategoriesForNavigation();
    setCategories(cats);
  };

  const fetchCategoryAttributes = async () => {
    if (!selectedCategory) return;

    try {
      const attrs = await getCategoryAttributes(selectedCategory);
      setCategoryAttributes(attrs);

      const entries = await Promise.all(
        attrs.map(async (attr) => {
          const values = await getAttributeValues(attr.attribute_id);
          return [attr.attribute_id, values] as const;
        })
      );
      setAttributeValues(Object.fromEntries(entries));
    } catch (error) {
      // silently handle - filters will show empty
    }
  };

  const handleCategoryClick = (category: NavigationCategory, isParent: boolean) => {
    setSelectedCategory(category.id);
    setSelectedFilters({});
    
    if (isParent) {
      // Parent category - show all products from children
      router.push(`/shop/${category.slug}`);
    } else {
      // Child category - need to find parent
      const parent = categories.find(cat => 
        cat.children?.some(child => child.id === category.id)
      );
      if (parent) {
        router.push(`/shop/${parent.slug}/${category.slug}`);
      } else {
        router.push(`/shop/${category.slug}`);
      }
    }
    
    if (onFilterChange) {
      onFilterChange({
        categoryId: category.id,
        attributeFilters: undefined,
      });
    }
  };

  const handleClearCategory = () => {
    setSelectedCategory("");
    setSelectedFilters({});
    router.push("/shop");
    if (onFilterChange) {
      onFilterChange({});
    }
  };

  const handleAttributeFilterChange = (attributeId: string, valueId: string, checked: boolean) => {
    const updated = { ...selectedFilters };
    
    if (!updated[attributeId]) {
      updated[attributeId] = [];
    }

    if (checked) {
      updated[attributeId] = [...updated[attributeId], valueId];
    } else {
      updated[attributeId] = updated[attributeId].filter((id) => id !== valueId);
    }

    // Remove empty arrays
    Object.keys(updated).forEach((key) => {
      if (updated[key].length === 0) {
        delete updated[key];
      }
    });

    setSelectedFilters(updated);

    // Update URL params
    const params = new URLSearchParams(searchParams.toString());
    Object.keys(updated).forEach((attrId) => {
      params.set(`attr_${attrId}`, updated[attrId].join(","));
    });
    // Remove params for attributes that are no longer selected
    Object.keys(selectedFilters).forEach((attrId) => {
      if (!updated[attrId] || updated[attrId].length === 0) {
        params.delete(`attr_${attrId}`);
      }
    });
    
    // Preserve category URL if on category page
    if (pathname && pathname.startsWith('/shop/') && pathname !== '/shop') {
      router.push(`${pathname}?${params.toString()}`);
    } else {
      router.push(`/shop?${params.toString()}`);
    }

    // Notify parent component
    if (onFilterChange) {
      onFilterChange({
        categoryId: selectedCategory || undefined,
        attributeFilters: Object.keys(updated).length > 0 ? updated : undefined,
      });
    }
  };

  const clearFilters = () => {
    handleClearCategory();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Filters</h2>
        {(selectedCategory || Object.keys(selectedFilters).length > 0) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Category Filter - Accordion */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Category
          </label>
          {categories.length === 0 ? (
            <p className="text-sm text-gray-500">No categories available</p>
          ) : (
            <Accordion 
              type="multiple" 
              value={expandedItems}
              onValueChange={setExpandedItems}
              className="w-full"
            >
              {categories.map((parentCategory) => {
                const hasChildren = parentCategory.children && parentCategory.children.length > 0;
                const isParentSelected = selectedCategory === parentCategory.id;
                const isChildSelected = parentCategory.children?.some(
                  child => child.id === selectedCategory
                );

                return (
                  <AccordionItem 
                    key={parentCategory.id} 
                    value={parentCategory.id}
                    className="border-b border-gray-200 last:border-b-0"
                  >
                    <AccordionTrigger className="py-3 hover:no-underline">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCategoryClick(parentCategory, true);
                        }}
                        className={cn(
                          "flex-1 text-left text-sm font-medium",
                          isParentSelected && "text-black font-semibold",
                          !isParentSelected && "text-gray-700"
                        )}
                      >
                        {parentCategory.name}
                      </button>
                    </AccordionTrigger>
                    {hasChildren && (
                      <AccordionContent className="pb-2 pt-0">
                        <div className="pl-4 space-y-1">
                          {parentCategory.children!.map((childCategory) => {
                            const isChildSelected = selectedCategory === childCategory.id;
                            return (
                              <button
                                key={childCategory.id}
                                onClick={() => handleCategoryClick(childCategory, false)}
                                className={cn(
                                  "w-full text-left text-sm py-2 px-3 rounded-md transition-colors",
                                  isChildSelected
                                    ? "bg-black text-white font-medium"
                                    : "text-gray-600 hover:bg-gray-100"
                                )}
                              >
                                {childCategory.name}
                              </button>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    )}
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
          {selectedCategory && (
            <button
              onClick={handleClearCategory}
              className="mt-3 text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Clear category filter
            </button>
          )}
        </div>

        {/* Dynamic Attribute Filters */}
        {categoryAttributes.length > 0 && (
          <>
            {categoryAttributes.map((catAttr) => {
              const attr = catAttr.attribute;
              if (!attr) return null;

              const values = attributeValues[catAttr.attribute_id] || [];
              const selected = selectedFilters[catAttr.attribute_id] || [];

              return (
                <div key={catAttr.attribute_id}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {attr.display_name}
                  </label>
                  {attr.attribute_type === "select" || attr.attribute_type === "color" ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {values
                        .filter((v) => v.is_active)
                        .map((value) => (
                          <label
                            key={value.id}
                            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={selected.includes(value.id)}
                              onChange={(e) =>
                                handleAttributeFilterChange(
                                  catAttr.attribute_id,
                                  value.id,
                                  e.target.checked
                                )
                              }
                              className="rounded border-gray-300 text-black focus:ring-black"
                            />
                            <span className="text-sm text-gray-700">
                              {value.display_value || value.value}
                            </span>
                            {attr.attribute_type === "color" && value.hex_code && (
                              <div
                                className="w-4 h-4 rounded border border-gray-300"
                                style={{ backgroundColor: value.hex_code }}
                              />
                            )}
                          </label>
                        ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default ShopFilters;
