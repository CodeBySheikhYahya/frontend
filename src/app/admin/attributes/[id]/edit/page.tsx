"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import InputGroup from "@/components/ui/input-group";
import {
  getAttributeById,
  updateAttribute,
} from "@/lib/supabase/admin-attributes";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditAttributePage() {
  const router = useRouter();
  const params = useParams();
  const attributeId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form data
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [attributeType, setAttributeType] = useState<
    "select" | "text" | "color"
  >("select");
  const [isPredefined, setIsPredefined] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);

  useEffect(() => {
    fetchAttribute();
  }, [attributeId]);

  const fetchAttribute = async () => {
    setLoading(true);
    try {
      const attribute = await getAttributeById(attributeId);
      if (attribute) {
        setName(attribute.name);
        setDisplayName(attribute.display_name);
        setAttributeType(attribute.attribute_type);
        setIsPredefined(attribute.is_predefined);
        setDisplayOrder(attribute.display_order);
      } else {
        alert("Attribute not found");
        router.push("/admin/attributes");
      }
    } catch (error) {
      console.error("Error fetching attribute:", error);
      alert("Failed to load attribute");
      router.push("/admin/attributes");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const result = await updateAttribute(attributeId, {
        name,
        display_name: displayName || name,
        attribute_type: attributeType,
        is_predefined: isPredefined,
        display_order: displayOrder,
      });

      if (result.success) {
        router.push("/admin/attributes");
        router.refresh();
      } else {
        alert(`Error: ${result.error}`);
        setSaving(false);
      }
    } catch (error: any) {
      alert(`Failed to update attribute: ${error.message}`);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Loading attribute...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/attributes">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Attributes
          </Button>
        </Link>
        <h1 className={cn([integralCF.className, "text-3xl font-bold"])}>
          Edit Attribute
        </h1>
        <p className="text-gray-600 mt-2">Update attribute information</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg border border-gray-200 p-6"
      >
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h2
              className={cn([integralCF.className, "text-xl font-bold mb-4"])}
            >
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attribute Name * (e.g., "Size", "Color", "Volume")
                </label>
                <InputGroup className="bg-[#F0F0F0]">
                  <InputGroup.Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g., Size, Color, Volume, Material"
                  />
                </InputGroup>
                <p className="text-xs text-gray-500 mt-1">
                  Internal name (must be unique, lowercase recommended)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <InputGroup className="bg-[#F0F0F0]">
                  <InputGroup.Input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Auto-filled from name"
                  />
                </InputGroup>
                <p className="text-xs text-gray-500 mt-1">
                  Name shown to users (auto-filled from name if left empty)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attribute Type *
                </label>
                <select
                  value={attributeType}
                  onChange={(e) =>
                    setAttributeType(
                      e.target.value as "select" | "text" | "color"
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  required
                >
                  <option value="select">Select (Dropdown)</option>
                  <option value="text">Text</option>
                  <option value="color">Color</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Select: Dropdown with predefined values (e.g., Size: Small, Medium, Large)
                  <br />
                  Text: Free text input (users can type anything including numbers)
                  <br />
                  Color: Color picker with hex codes
                </p>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div>
            <h2
              className={cn([integralCF.className, "text-xl font-bold mb-4"])}
            >
              Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <InputGroup className="bg-[#F0F0F0]">
                  <InputGroup.Input
                    type="number"
                    value={displayOrder.toString()}
                    onChange={(e) =>
                      setDisplayOrder(parseInt(e.target.value) || 0)
                    }
                  />
                </InputGroup>
                <p className="text-xs text-gray-500 mt-1">
                  Lower numbers appear first (0, 1, 2, ...)
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPredefined"
                  checked={isPredefined}
                  onChange={(e) => setIsPredefined(e.target.checked)}
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                />
                <label
                  htmlFor="isPredefined"
                  className="ml-2 text-sm text-gray-700"
                >
                  Predefined (System-built attribute)
                </label>
                <p className="text-xs text-gray-500 ml-2">
                  (Usually leave unchecked for custom attributes)
                </p>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <Link href="/admin/attributes">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              className="bg-black text-white hover:bg-black/90"
              disabled={saving || !name}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
