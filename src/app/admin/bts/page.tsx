"use client";

import React, { useEffect, useState, useRef } from "react";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  getAllBtsVideos,
  createBtsVideo,
  updateBtsVideo,
  deleteBtsVideo,
  uploadBtsMedia,
  type BtsVideo,
} from "@/lib/supabase/admin-bts";
import {
  Plus,
  Trash2,
  Video,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Upload,
  X,
  Loader2,
  ImageIcon,
} from "lucide-react";

export default function AdminBtsPage() {
  const [videos, setVideos] = useState<BtsVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);

  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [selectedPoster, setSelectedPoster] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "Our Journey",
    subtitle: "From thread to fabric, every piece tells a story of craftsmanship and heritage.",
    displayOrder: 0,
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const data = await getAllBtsVideos();
      setVideos(data);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedVideo(file);
  };

  const handlePosterSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedPoster(file);
    setPosterPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVideo) {
      alert("Please select a video file.");
      return;
    }

    setUploading(true);
    try {
      const videoUpload = await uploadBtsMedia(selectedVideo, "videos");
      if (!videoUpload.success || !videoUpload.mediaUrl) {
        alert(`Video upload failed: ${videoUpload.error}`);
        return;
      }

      let posterUrl: string | undefined;
      if (selectedPoster) {
        const posterUpload = await uploadBtsMedia(selectedPoster, "posters");
        if (posterUpload.success && posterUpload.mediaUrl) {
          posterUrl = posterUpload.mediaUrl;
        }
      }

      const result = await createBtsVideo({
        video_url: videoUpload.mediaUrl,
        poster_url: posterUrl,
        title: formData.title || undefined,
        subtitle: formData.subtitle || undefined,
        display_order: formData.displayOrder,
        is_active: true,
      });

      if (result.success) {
        resetForm();
        await fetchVideos();
      } else {
        alert(`Error: ${result.error}`);
      }
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setSelectedVideo(null);
    setSelectedPoster(null);
    setPosterPreview(null);
    setFormData({
      title: "Our Journey",
      subtitle: "From thread to fabric, every piece tells a story of craftsmanship and heritage.",
      displayOrder: 0,
    });
    if (videoInputRef.current) videoInputRef.current.value = "";
    if (posterInputRef.current) posterInputRef.current.value = "";
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this BTS video?")) return;

    setDeletingId(id);
    try {
      const result = await deleteBtsVideo(id);
      if (result.success) {
        setVideos(videos.filter((v) => v.id !== id));
      } else {
        alert(`Error: ${result.error}`);
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (video: BtsVideo) => {
    setTogglingId(video.id);
    try {
      const result = await updateBtsVideo(video.id, {
        is_active: !video.is_active,
      });
      if (result.success) {
        setVideos(
          videos.map((v) =>
            v.id === video.id ? { ...v, is_active: !v.is_active } : v
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
    const idx = videos.findIndex((v) => v.id === id);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= videos.length) return;

    const currentOrder = videos[idx].display_order;
    const swapOrder = videos[swapIdx].display_order;

    await Promise.all([
      updateBtsVideo(videos[idx].id, { display_order: swapOrder }),
      updateBtsVideo(videos[swapIdx].id, { display_order: currentOrder }),
    ]);

    await fetchVideos();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Loading BTS videos...</p>
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
            Behind The Scenes
          </h1>
          <p className="text-gray-600">
            Manage BTS videos on the homepage ({videos.length} videos)
          </p>
        </div>
        {!showForm && (
          <Button
            className="bg-black text-white hover:bg-black/90"
            onClick={() => setShowForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Video
          </Button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Add New BTS Video</h2>
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
                Video File *
              </label>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                  selectedVideo
                    ? "border-green-300 bg-green-50"
                    : "border-gray-300 hover:border-gray-400"
                )}
                onClick={() => videoInputRef.current?.click()}
              >
                {selectedVideo ? (
                  <div className="space-y-2">
                    <Video className="w-12 h-12 mx-auto text-green-500" />
                    <p className="text-sm text-gray-600">
                      {selectedVideo.name} (
                      {(selectedVideo.size / 1024 / 1024).toFixed(1)} MB)
                    </p>
                    <p className="text-xs text-gray-400">Click to change</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-10 h-10 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Click to upload video
                    </p>
                    <p className="text-xs text-gray-400">MP4, WEBM</p>
                  </div>
                )}
              </div>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="hidden"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Poster/Thumbnail Image (optional)
              </label>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
                  selectedPoster
                    ? "border-blue-300 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                )}
                onClick={() => posterInputRef.current?.click()}
              >
                {selectedPoster && posterPreview ? (
                  <div className="space-y-2">
                    <img
                      src={posterPreview}
                      alt="Poster preview"
                      className="max-h-32 mx-auto rounded"
                    />
                    <p className="text-xs text-gray-400">Click to change</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <ImageIcon className="w-8 h-8 mx-auto text-gray-400" />
                    <p className="text-xs text-gray-500">
                      Upload a poster image shown before video plays
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={posterInputRef}
                type="file"
                accept="image/*"
                onChange={handlePosterSelect}
                className="hidden"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                placeholder="Our Journey"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subtitle
              </label>
              <textarea
                value={formData.subtitle}
                onChange={(e) =>
                  setFormData({ ...formData, subtitle: e.target.value })
                }
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                placeholder="A short description..."
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
                disabled={!selectedVideo || uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Video
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

      {videos.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Video className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No BTS videos yet</h3>
          <p className="text-gray-600 mb-6">
            Add your first Behind The Scenes video for the homepage
          </p>
          <Button
            className="bg-black text-white hover:bg-black/90"
            onClick={() => setShowForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Video
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {videos.map((video, idx) => (
            <div
              key={video.id}
              className={cn(
                "bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex items-center gap-4",
                !video.is_active && "opacity-60"
              )}
            >
              <div className="w-44 h-24 rounded-md overflow-hidden bg-gray-900 flex-shrink-0 relative">
                {video.poster_url ? (
                  <img
                    src={video.poster_url}
                    alt={video.title || "BTS"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={video.video_url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center">
                    <svg viewBox="0 0 22 26" fill="none" className="w-3 h-3 ml-0.5">
                      <path d="M0 0L22 13L0 26Z" fill="#1A1A1A" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <Video className="w-3 h-3" />
                    video
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                      video.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    )}
                  >
                    {video.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {video.title || "Untitled"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {video.subtitle || "No subtitle"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Order: {video.display_order} &middot; Added{" "}
                  {new Date(video.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleReorder(video.id, "up")}
                  disabled={idx === 0}
                  title="Move up"
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleReorder(video.id, "down")}
                  disabled={idx === videos.length - 1}
                  title="Move down"
                >
                  <ArrowDown className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleToggleActive(video)}
                  disabled={togglingId === video.id}
                  title={video.is_active ? "Deactivate" : "Activate"}
                >
                  {video.is_active ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(video.id)}
                  disabled={deletingId === video.id}
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
