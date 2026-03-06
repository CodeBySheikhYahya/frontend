"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  getCategoryById,
  type Category,
} from "@/lib/supabase/admin-categories";
import {
  getCategoryAttributes,
  assignAttributeToCategory,
  removeAttributeFromCategory,
  updateCategoryAttribute,
  type CategoryAttribute,
} from "@/lib/supabase/admin-category-attributes";
import {
  getAllAttributes,
  type ProductAttribute,
} from "@/lib/supabase/admin-attributes";
import { ArrowLeft, Plus, Trash2, Settings } from "lucide-react";
import Link from "next/link";

export default function CategoryAttributesPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category | null>(null);
  const [categoryAttributes, setCategoryAttributes] = useState<
    CategoryAttribute[]
  >([]);
  const [allAttributes, setAllAttributes] = useState<ProductAttribute[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAttributeId, setSelectedAttributeId] = useState("");
  const [isRequired, setIsRequired] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [categoryId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catData, attrsData, allAttrsData] = await Promise.all([
        getCategoryById(categoryId),
        getCategoryAttributes(categoryId),
        getAllAttributes(),
      ]);

      if (catData) {
        setCategory(catData);
      } else {
        alert("Category not found");
        router.push("/admin/categories");
        return;
      }

      setCategoryAttributes(attrsData);
      setAllAttributes(allAttrsData);
    } catch (error) {
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Get available attributes (not yet assigned)
  const getAvailableAttributes = () => {
    const assignedIds = categoryAttributes.map((ca) => ca.attribute_id);
    return allAttributes.filter((attr) => !assignedIds.includes(attr.id));
  };

  const handleAssignAttribute = async () => {
    if (!selectedAttributeId) {
      alert("Please select a property");
      return;
    }

    setSaving(true);
    try {
      const result = await assignAttributeToCategory(categoryId, selectedAttributeId, {
        is_required: isRequired,
        display_order: displayOrder,
      });

      if (result.success) {
        await fetchData();
        setShowAddModal(false);
        setSelectedAttributeId("");
        setIsRequired(true);
        setDisplayOrder(0);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert("Failed to assign property");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAttribute = async (id: string, attributeName: string) => {
    if (
      !confirm(
        `Are you sure you want to remove "${attributeName}" from this category?`
      )
    ) {
      return;
    }

    setRemovingId(id);
    try {
      const result = await removeAttributeFromCategory(id);
      if (result.success) {
        await fetchData();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert("Failed to remove attribute");
    } finally {
      setRemovingId(null);
    }
  };

  const handleToggleRequired = async (id: string, currentValue: boolean) => {
    try {
      const result = await updateCategoryAttribute(id, {
        is_required: !currentValue,
      });
      if (result.success) {
        await fetchData();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert("Failed to update property");
    }
  };

  const handleUpdateDisplayOrder = async (
    id: string,
    newOrder: number
  ) => {
    try {
      const result = await updateCategoryAttribute(id, {
        display_order: newOrder,
      });
      if (result.success) {
        await fetchData();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert("Failed to update display order");
    }
  };

  const getAttributeTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      select: "Select",
      text: "Text",
      number: "Number",
      color: "Color",
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!category) {
    return null;
  }

  const availableAttributes = getAvailableAttributes();

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
          Manage Properties: {category.name}
        </h1>
        <p className="text-gray-600 mt-2">
          Assign properties to this category. Products in this category will use
          these properties (like Size, Color, Material, etc.)
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2
            className={cn([integralCF.className, "text-xl font-bold"])}
          >
            Assigned Attributes ({categoryAttributes.length})
          </h2>
          {availableAttributes.length > 0 && (
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-black text-white hover:bg-black/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Attribute
            </Button>
          )}
        </div>

        {categoryAttributes.length === 0 ? (
          <div className="text-center py-12">
            <Settings className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No properties assigned
            </h3>
            <p className="text-gray-600 mb-6">
              Add properties to this category to define what product options will
              be available (like Size, Color, Material, etc.)
            </p>
            {availableAttributes.length > 0 && (
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-black text-white hover:bg-black/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Property
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attribute
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Required
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categoryAttributes.map((ca) => (
                  <tr key={ca.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {ca.attribute?.display_name || ca.attribute?.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {ca.attribute?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getAttributeTypeLabel(
                          ca.attribute?.attribute_type || ""
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() =>
                          handleToggleRequired(ca.id, ca.is_required)
                        }
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors",
                          ca.is_required
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        )}
                      >
                        {ca.is_required ? "Required" : "Optional"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={ca.display_order}
                        onChange={(e) =>
                          handleUpdateDisplayOrder(
                            ca.id,
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() =>
                          handleRemoveAttribute(
                            ca.id,
                            ca.attribute?.display_name || ca.attribute?.name || ""
                          )
                        }
                        disabled={removingId === ca.id}
                        title="Remove Property"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {availableAttributes.length === 0 && categoryAttributes.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              All available properties have been assigned to this category.
            </p>
          </div>
        )}
      </div>

      {/* Add Attribute Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3
              className={cn([integralCF.className, "text-xl font-bold mb-4"])}
            >
              Add Property to Category
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Property *
                </label>
                <select
                  value={selectedAttributeId}
                  onChange={(e) => setSelectedAttributeId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  required
                >
                  <option value="">Choose a property...</option>
                  {availableAttributes.map((attr) => (
                    <option key={attr.id} value={attr.id}>
                      {attr.display_name} ({getAttributeTypeLabel(attr.attribute_type)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) =>
                    setDisplayOrder(parseInt(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lower numbers appear first
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isRequired"
                  checked={isRequired}
                  onChange={(e) => setIsRequired(e.target.checked)}
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                />
                <label htmlFor="isRequired" className="ml-2 text-sm text-gray-700">
                  Required (must be filled when creating products)
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 mt-6 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedAttributeId("");
                  setIsRequired(true);
                  setDisplayOrder(0);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-black text-white hover:bg-black/90"
                onClick={handleAssignAttribute}
                disabled={saving || !selectedAttributeId}
              >
                {saving ? "Adding..." : "Add Property"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
