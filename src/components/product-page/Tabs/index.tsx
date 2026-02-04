"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";
import ProductDetailsContent from "./ProductDetailsContent";
import ReviewsContent from "./ReviewsContent";
import FaqContent from "./FaqContent";
import DescriptionContent from "./DescriptionContent";
import { getProductTabs, type ProductTab } from "@/lib/supabase/products";

interface TabsProps {
  productId: string;
  description?: string | null;
}

const Tabs = ({ productId, description }: TabsProps) => {
  const [tabs, setTabs] = useState<ProductTab[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTabs = async () => {
      try {
        const tabsData = await getProductTabs();
        setTabs(tabsData);
        if (tabsData.length > 0) {
          const visible = (description ?? "").trim()
            ? tabsData
            : tabsData.filter((t) => t.tab_key !== "description");
          setActiveTab(visible[0]?.tab_key ?? tabsData[0].tab_key);
        }
      } catch (error) {
        console.error("Error fetching tabs:", error);
        // Fallback to default tabs
        const defaultTabs: ProductTab[] = [
          { id: '0', tab_key: 'description', display_name: 'Description', component_type: 'description', display_order: 0, is_active: true, is_required: false },
          { id: '1', tab_key: 'details', display_name: 'Product Details', component_type: 'details', display_order: 1, is_active: true, is_required: true },
          { id: '2', tab_key: 'reviews', display_name: 'Rating & Reviews', component_type: 'reviews', display_order: 2, is_active: true, is_required: false },
          { id: '3', tab_key: 'faq', display_name: 'FAQs', component_type: 'faq', display_order: 3, is_active: true, is_required: false },
        ];
        setTabs(defaultTabs);
        const hasDesc = (description ?? "").trim();
        setActiveTab(hasDesc ? "description" : "details");
      } finally {
        setLoading(false);
      }
    };

    fetchTabs();
  }, [description]);

  const visibleTabs = (description ?? "").trim()
    ? tabs
    : tabs.filter((t) => t.tab_key !== "description");

  const renderTabContent = () => {
    if (!activeTab) return null;

    const activeTabData = tabs.find((t) => t.tab_key === activeTab);
    if (!activeTabData) return null;

    switch (activeTabData.component_type) {
      case "description":
        return description ? <DescriptionContent description={description} /> : null;
      case "details":
        return <ProductDetailsContent productId={productId} />;
      case "reviews":
        return <ReviewsContent />;
      case "faq":
        return <FaqContent />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="mb-12 sm:mb-16">
        <div className="flex items-center mb-6 sm:mb-8">
          <div className="h-12 bg-gray-200 rounded w-full animate-pulse" />
        </div>
        <div className="h-64 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  if (visibleTabs.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center mb-6 sm:mb-8 overflow-x-auto">
        {visibleTabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            type="button"
            className={cn([
              activeTab === tab.tab_key
                ? "border-black border-b-2 font-medium"
                : "border-b border-black/10 text-black/60 font-normal",
              "p-5 sm:p-6 rounded-none flex-1",
            ])}
            onClick={() => setActiveTab(tab.tab_key)}
          >
            {tab.display_name}
          </Button>
        ))}
      </div>
      <div className="mb-12 sm:mb-16 min-w-0 overflow-hidden">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Tabs;
