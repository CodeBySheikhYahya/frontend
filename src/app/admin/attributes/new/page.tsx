"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import InputGroup from "@/components/ui/input-group";
import { createAttribute, createAttributeValue } from "@/lib/supabase/admin-attributes";
import { ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp, Check } from "lucide-react";
import Link from "next/link";

interface AttributeValueInput {
  value: string;
  display_value: string;
  hex_code: string;
}

export default function AddAttributePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form data
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [attributeType, setAttributeType] = useState<
    "select" | "text" | "color"
  >("select");
  const [isPredefined, setIsPredefined] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);
  
  // Attribute values (for select and color types)
  const [values, setValues] = useState<AttributeValueInput[]>([]);
  const [newValue, setNewValue] = useState("");
  const [newDisplayValue, setNewDisplayValue] = useState("");
  const [newHexCode, setNewHexCode] = useState("");
  const [isAddValueSectionExpanded, setIsAddValueSectionExpanded] = useState(true);

  useEffect(() => {
    if (name && !displayName) {
      setDisplayName(name);
    }
  }, [name, displayName]);

  const handleAddValue = () => {
    // For color type, hex code is required
    if (attributeType === "color" && !newHexCode.trim()) {
      alert("Please enter a hex code for color");
      return;
    }

    // Check for duplicate hex codes (for color type)
    if (attributeType === "color" && newHexCode.trim()) {
      const normalizedHex = newHexCode.trim().toUpperCase();
      const isDuplicate = values.some(v => 
        v.hex_code.trim().toUpperCase() === normalizedHex
      );
      
      if (isDuplicate) {
        alert("This hex code already exists. Please use a different color code.");
        return;
      }
    }

    // Value is optional - if empty, use hex code or generate from hex
    let finalValue = newValue.trim();
    if (!finalValue && attributeType === "color" && newHexCode.trim()) {
      // Auto-generate name from hex code if value is empty
      finalValue = newHexCode.trim();
    }

    if (!finalValue && attributeType !== "color") {
      alert("Please enter a value");
      return;
    }

    // Check for duplicate values (by name)
    if (finalValue && values.some(v => v.value.toLowerCase() === finalValue.toLowerCase())) {
      alert("This color name already exists");
      return;
    }

    setValues([
      ...values,
      {
        value: finalValue || newHexCode.trim(),
        display_value: newDisplayValue.trim() || finalValue || newHexCode.trim(),
        hex_code: newHexCode.trim() || "",
      },
    ]);

    // Clear fields after adding
    setNewValue("");
    setNewDisplayValue("");
    setNewHexCode("");
    
    // Collapse the section after adding (user can expand again if needed)
    setIsAddValueSectionExpanded(false);
  };

  const handleRemoveValue = (index: number) => {
    setValues(values.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create attribute first
      const result = await createAttribute({
        name,
        display_name: displayName || name,
        attribute_type: attributeType,
        is_predefined: isPredefined,
        display_order: displayOrder,
      });

      if (!result.success || !result.data) {
        alert(`Error: ${result.error}`);
        setLoading(false);
        return;
      }

      const attributeId = result.data.id;

      // Create attribute values if type is select, color, or text and values are provided
      if ((attributeType === "select" || attributeType === "color" || attributeType === "text") && values.length > 0) {
        for (let i = 0; i < values.length; i++) {
          // For color type, ensure hex_code is provided
          if (attributeType === "color" && !values[i].hex_code) {
            alert(`Error: Hex code is required for color value at position ${i + 1}`);
            setLoading(false);
            return;
          }

          const valueResult = await createAttributeValue({
            attribute_id: attributeId,
            value: values[i].value || values[i].hex_code || "",
            display_value: values[i].display_value || values[i].value || values[i].hex_code || "",
            hex_code: values[i].hex_code || undefined,
            display_order: i,
            is_active: true,
          });

          if (!valueResult.success) {
            // Continue creating other values even if one fails
          }
        }
      }

      router.push("/admin/attributes");
      router.refresh();
    } catch (error: any) {
      alert(`Failed to create attribute: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/attributes">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Properties
          </Button>
        </Link>
        <h1 className={cn([integralCF.className, "text-3xl font-bold"])}>
          Add New Property
        </h1>
        <p className="text-gray-600 mt-2">
          Create a new product property (Size, Color, Volume, Material, etc.)
        </p>
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
                  Property Name * (e.g., "Size", "Color", "Volume")
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
                  Property Type *
                </label>
                <select
                  value={attributeType}
                  onChange={(e) => {
                    setAttributeType(
                      e.target.value as "select" | "text" | "color"
                    );
                    // Reset values and expand section when switching to select/color/text
                    if (e.target.value === "select" || e.target.value === "color" || e.target.value === "text") {
                      setValues([]);
                      setIsAddValueSectionExpanded(true);
                    }
                  }}
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

          {/* Attribute Values (for select, color, and text types) */}
          {(attributeType === "select" || attributeType === "color" || attributeType === "text") && (
            <div>
              <h2
                className={cn([integralCF.className, "text-xl font-bold mb-4"])}
              >
                Options / Choices
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Add the available options for this property (e.g., Red, Blue, Black for Color; Small, Medium, Large for Size; Leather, Cotton, Plastic for Material)
              </p>

              {/* Summary when collapsed */}
              {!isAddValueSectionExpanded && values.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {values.length} {values.length === 1 ? 'value' : 'values'} added
                        </p>
                        <p className="text-sm text-gray-600">
                          Ready to create property. Click below to add more options if needed.
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddValueSectionExpanded(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add More Values
                    </Button>
                  </div>
                </div>
              )}

              {/* Add new value section */}
              {isAddValueSectionExpanded && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-700">
                      Add New Value
                    </h3>
                    {values.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAddValueSectionExpanded(false)}
                        className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
                      >
                        <ChevronUp className="w-4 h-4" />
                        Collapse
                      </Button>
                    )}
                  </div>
                  <div className={`grid grid-cols-1 ${attributeType === "color" ? "md:grid-cols-3" : "md:grid-cols-2"} gap-4 mb-3`}>
                  {attributeType === "color" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hex Code *
                      </label>
                      <InputGroup className="bg-white">
                        <InputGroup.Input
                          type="text"
                          value={newHexCode}
                          onChange={(e) => setNewHexCode(e.target.value)}
                          placeholder="#FF0000"
                          maxLength={7}
                          required
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddValue();
                            }
                          }}
                        />
                      </InputGroup>
                      <p className="text-xs text-gray-500 mt-1">
                        Required for color display
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {attributeType === "color" ? "Color Name (Optional)" : "Value *"}
                    </label>
                    <InputGroup className="bg-white">
                      <InputGroup.Input
                        type="text"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        placeholder={
                          attributeType === "color" 
                            ? "e.g., Red (optional)" 
                            : attributeType === "text"
                            ? "e.g., Leather, Cotton, Plastic"
                            : "e.g., Small"
                        }
                        required={attributeType !== "color"}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddValue();
                          }
                        }}
                      />
                    </InputGroup>
                    {attributeType === "color" && (
                      <p className="text-xs text-gray-500 mt-1">
                        Leave empty to use hex code as name
                      </p>
                    )}
                    {attributeType === "text" && (
                      <p className="text-xs text-gray-500 mt-1">
                        Add common text values (users can also type custom values)
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Value (Optional)
                    </label>
                    <InputGroup className="bg-white">
                      <InputGroup.Input
                        type="text"
                        value={newDisplayValue}
                        onChange={(e) => setNewDisplayValue(e.target.value)}
                        placeholder="Leave empty to use value"
                      />
                    </InputGroup>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleAddValue}
                  className="bg-black text-white hover:bg-black/90 flex items-center gap-2"
                  disabled={
                    attributeType === "color" 
                      ? !newHexCode.trim() 
                      : !newValue.trim()
                  }
                  title="Click to add this value to the list"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Value</span>
                </Button>
                </div>
              )}

              {/* Show expand button if section is collapsed and no values added yet */}
              {!isAddValueSectionExpanded && values.length === 0 && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-dashed border-gray-300">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddValueSectionExpanded(true)}
                    className="flex items-center gap-2 w-full justify-center"
                  >
                    <ChevronDown className="w-4 h-4" />
                    Add Values
                  </Button>
                </div>
              )}

              {/* List of values */}
              {values.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Added Values ({values.length})
                  </h3>
                  <div className="space-y-2">
                    {values.map((val, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex-1">
                            {val.value ? (
                              <>
                                <span className="font-medium text-gray-900">
                                  {val.value}
                                </span>
                                {val.display_value !== val.value && val.display_value && (
                                  <span className="text-sm text-gray-500 ml-2">
                                    ({val.display_value})
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="font-medium text-gray-900">
                                {val.hex_code || "Unnamed"}
                              </span>
                            )}
                          </div>
                          {attributeType === "color" && val.hex_code && (
                            <div className="flex items-center gap-2">
                              <div
                                className="w-6 h-6 rounded border border-gray-300"
                                style={{ backgroundColor: val.hex_code }}
                              />
                              <span className="text-sm text-gray-500">
                                {val.hex_code}
                              </span>
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveValue(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {values.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <p className="text-sm text-gray-500">
                    No options added yet. Add options above to create choices for this property.
                  </p>
                </div>
              )}
            </div>
          )}

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
              disabled={loading || !name}
            >
              {loading ? "Creating..." : "Create Property"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
