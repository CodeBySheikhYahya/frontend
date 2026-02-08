"use client";

import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SizeChartPopupProps {
  chartImageUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

const SizeChartPopup = ({ chartImageUrl, isOpen, onClose }: SizeChartPopupProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-xl font-bold">Size Chart</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="p-6">
          <img
            src={chartImageUrl}
            alt="Size chart"
            className="w-full h-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default SizeChartPopup;
