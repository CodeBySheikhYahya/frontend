"use client";

import React, { useEffect, useState, useRef } from "react";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  uploadBannerMedia,
  type HeroBanner,
} from "@/lib/supabase/admin-banners";
import {
  Plus,
  Trash2,
  ImageIcon,
  Video,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Upload,
  X,
  Loader2,
} from "lucide-react";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    altText: "",
    displayOrder: 0,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const data = await getAllBanners();
      setBanners(data);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    if (file.type.startsWith("video/")) {
      setPreview(null);
    } else {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const getFileType = (file: File): "image" | "video" => {
    return file.type.startsWith("video/") ? "video" : "image";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }

    setUploading(true);
    try {
      const uploadResult = await uploadBannerMedia(selectedFile);
      if (!uploadResult.success || !uploadResult.mediaUrl) {
        alert(`Upload failed: ${uploadResult.error}`);
        return;
      }

      const result = await createBanner({
        type: getFileType(selectedFile),
        media_url: uploadResult.mediaUrl,
        alt_text: formData.altText || undefined,
        display_order: formData.displayOrder,
        is_active: true,
      });

      if (result.success) {
        resetForm();
        await fetchBanners();
      } else {
        alert(`Error: ${result.error}`);
      }
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setSelectedFile(null);
    setPreview(null);
    setFormData({ altText: "", displayOrder: 0 });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;

    setDeletingId(id);
    try {
      const result = await deleteBanner(id);
      if (result.success) {
        setBanners(banners.filter((b) => b.id !== id));
      } else {
        alert(`Error: ${result.error}`);
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (banner: HeroBanner) => {
    setTogglingId(banner.id);
    try {
      const result = await updateBanner(banner.id, {
        is_active: !banner.is_active,
      });
      if (result.success) {
        setBanners(
          banners.map((b) =>
            b.id === banner.id ? { ...b, is_active: !b.is_active } : b
          )
        );
      } else {
        alert(`Error: ${result.error}`);
      }
    } finally {
      setTogglingId(null);
    }
  };

  const handleReorder = async (id: string, direction: "up" | "down") => {
    const idx = banners.findIndex((b) => b.id === id);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= banners.length) return;

    const currentOrder = banners[idx].display_order;
    const swapOrder = banners[swapIdx].display_order;

    await Promise.all([
      updateBanner(banners[idx].id, { display_order: swapOrder }),
      updateBanner(banners[swapIdx].id, { display_order: currentOrder }),
    ]);

    await fetchBanners();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Loading banners...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1
            className={cn([integralCF.className, "text-3xl font-bold mb-2"])}
          >
            Hero Banners
          </h1>
          <p className="text-gray-600">
            Manage homepage slideshow ({banners.length} banners)
          </p>
        </div>
        {!showForm && (
          <Button
            className="bg-black text-white hover:bg-black/90"
            onClick={() => setShowForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Banner
          </Button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Add New Banner</h2>
            <button
              onClick={resetForm}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image or Video File
              </label>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                  selectedFile
                    ? "border-green-300 bg-green-50"
                    : "border-gray-300 hover:border-gray-400"
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedFile ? (
                  <div className="space-y-2">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview"
                        className="max-h-40 mx-auto rounded"
                      />
                    ) : (
                      <Video className="w-12 h-12 mx-auto text-green-500" />
                    )}
                    <p className="text-sm text-gray-600">
                      {selectedFile.name} (
                      {(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                    </p>
                    <p className="text-xs text-gray-400">Click to change</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-10 h-10 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Click to upload image or video
                    </p>
                    <p className="text-xs text-gray-400">
                      JPG, PNG, WEBP, MP4, WEBM
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alt Text (optional)
              </label>
              <input
                type="text"
                value={formData.altText}
                onChange={(e) =>
                  setFormData({ ...formData, altText: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                placeholder="Describe the banner content"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    displayOrder: parseInt(e.target.value) || 0,
                  })
                }
                className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                min={0}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                className="bg-black text-white hover:bg-black/90"
                disabled={!selectedFile || uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Banner
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {banners.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No banners yet</h3>
          <p className="text-gray-600 mb-6">
            Add your first hero banner to show on the homepage slideshow
          </p>
          <Button
            className="bg-black text-white hover:bg-black/90"
            onClick={() => setShowForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Banner
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {banners.map((banner, idx) => (
            <div
              key={banner.id}
              className={cn(
                "bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex items-center gap-4",
                !banner.is_active && "opacity-60"
              )}
            >
              <div className="w-40 h-24 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                {banner.type === "video" ? (
                  <video
                    src={banner.media_url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={banner.media_url}
                    alt={banner.alt_text || "Banner"}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                      banner.type === "video"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    )}
                  >
                    {banner.type === "video" ? (
                      <Video className="w-3 h-3" />
                    ) : (
                      <ImageIcon className="w-3 h-3" />
                    )}
                    {banner.type}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                      banner.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    )}
                  >
                    {banner.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {banner.alt_text || "No description"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Order: {banner.display_order} &middot; Added{" "}
                  {new Date(banner.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleReorder(banner.id, "up")}
                  disabled={idx === 0}
                  title="Move up"
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleReorder(banner.id, "down")}
                  disabled={idx === banners.length - 1}
                  title="Move down"
                >
                  <ArrowDown className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleToggleActive(banner)}
                  disabled={togglingId === banner.id}
                  title={banner.is_active ? "Deactivate" : "Activate"}
                >
                  {banner.is_active ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(banner.id)}
                  disabled={deletingId === banner.id}
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
