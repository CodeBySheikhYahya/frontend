"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import InputGroup from "@/components/ui/input-group";
import {
  createCategory,
  getAllCategories,
  generateCategorySlug,
  type Category,
} from "@/lib/supabase/admin-categories";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AddCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form data
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [parentId, setParentId] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // Options: full list so we can show "Subcategory (Parent)" in dropdown
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (name) {
      setSlug(generateCategorySlug(name));
    }
  }, [name]);

  const fetchCategories = async () => {
    try {
      const categories = await getAllCategories();
      setAllCategories(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const getParentName = (parentId: string | null) =>
    parentId ? allCategories.find((c) => c.id === parentId)?.name ?? "—" : null;
  const getCategoryOptionLabel = (cat: Category) =>
    cat.parent_id
      ? `${cat.name} (${getParentName(cat.parent_id)})`
      : cat.name;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createCategory({
        name,
        slug: slug || generateCategorySlug(name),
        description: description || undefined,
        image_url: imageUrl || undefined,
        parent_id: parentId || null,
        display_order: displayOrder,
        is_active: isActive,
      });

      if (result.success) {
        router.push("/admin/categories");
        router.refresh();
      } else {
        alert(`Error: ${result.error}`);
        setLoading(false);
      }
    } catch (error: any) {
      alert(`Failed to create category: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/categories">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Categories
          </Button>
        </Link>
        <h1 className={cn([integralCF.className, "text-3xl font-bold"])}>
          Add New Category
        </h1>
        <p className="text-gray-600 mt-2">Create a new product category</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className={cn([integralCF.className, "text-xl font-bold mb-4"])}>
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <InputGroup className="bg-[#F0F0F0]">
                  <InputGroup.Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g., Clothing, Bags, Perfumes"
                  />
                </InputGroup>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug
                </label>
                <InputGroup className="bg-[#F0F0F0]">
                  <InputGroup.Input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="Auto-generated from name"
                  />
                </InputGroup>
                <p className="text-xs text-gray-500 mt-1">
                  URL-friendly version of the name (auto-generated if left empty)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Category description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <InputGroup className="bg-[#F0F0F0]">
                  <InputGroup.Input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </InputGroup>
                <p className="text-xs text-gray-500 mt-1">URL to category image</p>
              </div>
            </div>
          </div>

          {/* Category Settings */}
          <div>
            <h2 className={cn([integralCF.className, "text-xl font-bold mb-4"])}>
              Category Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Category
                </label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">None (Top Level)</option>
                  {allCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {getCategoryOptionLabel(cat)}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Make this a subcategory of another category
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <InputGroup className="bg-[#F0F0F0]">
                  <InputGroup.Input
                    type="number"
                    value={displayOrder.toString()}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                  />
                </InputGroup>
                <p className="text-xs text-gray-500 mt-1">
                  Lower numbers appear first (0, 1, 2, ...)
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Active (visible on store)
                </label>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <Link href="/admin/categories">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              className="bg-black text-white hover:bg-black/90"
              disabled={loading || !name}
            >
              {loading ? "Creating..." : "Create Category"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
