"use client";

import React, { useEffect, useState } from "react";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  getColors,
  getSizes,
  createColor,
  createSize,
  updateColor,
  updateSize,
  deleteColor,
  deleteSize,
} from "@/lib/supabase/admin-products";
import { Plus, Edit, Trash2, Palette, Ruler } from "lucide-react";

type ColorRow = { id: string; name: string; hex_code: string };
type SizeRow = { id: string; name: string };

export default function SizesColorsPage() {
  const [colors, setColors] = useState<ColorRow[]>([]);
  const [sizes, setSizes] = useState<SizeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Color modal: "add" | "edit" | null, editId for edit
  const [colorModal, setColorModal] = useState<"add" | "edit" | null>(null);
  const [colorEditId, setColorEditId] = useState<string | null>(null);
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#000000");
  const [colorSaving, setColorSaving] = useState(false);

  // Size modal
  const [sizeModal, setSizeModal] = useState<"add" | "edit" | null>(null);
  const [sizeEditId, setSizeEditId] = useState<string | null>(null);
  const [sizeName, setSizeName] = useState("");
  const [sizeSaving, setSizeSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [colorsData, sizesData] = await Promise.all([
        getColors(),
        getSizes(),
      ]);
      setColors(colorsData as ColorRow[]);
      setSizes(sizesData as SizeRow[]);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddColor = () => {
    setColorModal("add");
    setColorEditId(null);
    setColorName("");
    setColorHex("#000000");
  };

  const openEditColor = (c: ColorRow) => {
    setColorModal("edit");
    setColorEditId(c.id);
    setColorName(c.name);
    setColorHex(c.hex_code || "#000000");
  };

  const closeColorModal = () => {
    setColorModal(null);
    setColorEditId(null);
    setColorName("");
    setColorHex("#000000");
  };

  const saveColor = async () => {
    const name = colorName.trim();
    const hex = colorHex.trim();
    if (!name || !hex) {
      alert("Name and hex code are required.");
      return;
    }
    setColorSaving(true);
    try {
      if (colorModal === "edit" && colorEditId) {
        const res = await updateColor(colorEditId, { name, hex_code: hex });
        if (res.success) {
          await fetchData();
          closeColorModal();
        } else {
          alert(res.error);
        }
      } else {
        const res = await createColor(name, hex);
        if (res.success) {
          await fetchData();
          closeColorModal();
        } else {
          alert(res.error);
        }
      }
    } finally {
      setColorSaving(false);
    }
  };

  const openAddSize = () => {
    setSizeModal("add");
    setSizeEditId(null);
    setSizeName("");
  };

  const openEditSize = (s: SizeRow) => {
    setSizeModal("edit");
    setSizeEditId(s.id);
    setSizeName(s.name);
  };

  const closeSizeModal = () => {
    setSizeModal(null);
    setSizeEditId(null);
    setSizeName("");
  };

  const saveSize = async () => {
    const name = sizeName.trim();
    if (!name) {
      alert("Name is required.");
      return;
    }
    setSizeSaving(true);
    try {
      if (sizeModal === "edit" && sizeEditId) {
        const res = await updateSize(sizeEditId, { name });
        if (res.success) {
          await fetchData();
          closeSizeModal();
        } else {
          alert(res.error);
        }
      } else {
        const res = await createSize(name);
        if (res.success) {
          await fetchData();
          closeSizeModal();
        } else {
          alert(res.error);
        }
      }
    } finally {
      setSizeSaving(false);
    }
  };

  const handleDeleteColor = async (id: string, name: string) => {
    if (!confirm(`Delete color "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await deleteColor(id);
      if (res.success) await fetchData();
      else alert(res.error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteSize = async (id: string, name: string) => {
    if (!confirm(`Delete size "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await deleteSize(id);
      if (res.success) await fetchData();
      else alert(res.error);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className={cn([integralCF.className, "text-3xl font-bold mb-2"])}>
        Sizes & Colors
      </h1>
      <p className="text-gray-600 mb-8">
        Manage variant options used in product variants. These appear in the Size and Color dropdowns when editing products.
      </p>

      {/* Colors */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Colors ({colors.length})
          </h2>
          <Button size="sm" className="bg-black text-white hover:bg-black/90" onClick={openAddColor}>
            <Plus className="w-4 h-4 mr-2" />
            Add Color
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hex</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {colors.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-medium">{c.name}</span>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <span
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: c.hex_code }}
                    />
                    <span className="text-sm text-gray-600">{c.hex_code}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" className="mr-2" onClick={() => openEditColor(c)} title="Edit">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteColor(c.id, c.name)}
                      disabled={deletingId === c.id}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {colors.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            No colors yet. Add one to use in product variants.
          </div>
        )}
      </div>

      {/* Sizes */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Ruler className="w-5 h-5" />
            Sizes ({sizes.length})
          </h2>
          <Button size="sm" className="bg-black text-white hover:bg-black/90" onClick={openAddSize}>
            <Plus className="w-4 h-4 mr-2" />
            Add Size
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sizes.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{s.name}</td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" className="mr-2" onClick={() => openEditSize(s)} title="Edit">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteSize(s.id, s.name)}
                      disabled={deletingId === s.id}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sizes.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            No sizes yet. Add one to use in product variants.
          </div>
        )}
      </div>

      {/* Color modal */}
      {colorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeColorModal}>
          <div
            className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-lg mb-4">
              {colorModal === "add" ? "Add Color" : "Edit Color"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={colorName}
                  onChange={(e) => setColorName(e.target.value)}
                  placeholder="e.g. Navy Blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hex code</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-2 justify-end">
              <Button variant="outline" onClick={closeColorModal}>Cancel</Button>
              <Button onClick={saveColor} disabled={colorSaving} className="bg-black text-white hover:bg-black/90">
                {colorSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Size modal */}
      {sizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeSizeModal}>
          <div
            className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-lg mb-4">
              {sizeModal === "add" ? "Add Size" : "Edit Size"}
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={sizeName}
                onChange={(e) => setSizeName(e.target.value)}
                placeholder="e.g. Medium"
              />
            </div>
            <div className="mt-6 flex gap-2 justify-end">
              <Button variant="outline" onClick={closeSizeModal}>Cancel</Button>
              <Button onClick={saveSize} disabled={sizeSaving} className="bg-black text-white hover:bg-black/90">
                {sizeSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
