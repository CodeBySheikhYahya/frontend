"use client";

import React, { useState } from "react";
import { Ruler } from "lucide-react";
import SizeChartPopup from "./SizeChartPopup";

const SizeChartButton = ({ chartImageUrl }: { chartImageUrl: string }) => {
  const [showChart, setShowChart] = useState(false);

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => setShowChart(true)}
        className="flex items-center gap-1.5 text-sm text-black/60 hover:text-black transition-colors w-fit"
      >
        <Ruler className="w-4 h-4" />
        <span>Size Chart</span>
      </button>
      <SizeChartPopup
        chartImageUrl={chartImageUrl}
        isOpen={showChart}
        onClose={() => setShowChart(false)}
      />
    </div>
  );
};

export default SizeChartButton;
