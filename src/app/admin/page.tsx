"use client";

import React, { useEffect, useState } from "react";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import {
  ShoppingBag,
  Package,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  totalProducts: number;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch order stats
        const { data: orders, error: ordersError } = await supabase
          .from("orders")
          .select("status, total_amount");

        if (ordersError) {
          console.error("Error fetching orders:", ordersError);
        } else {
          const totalOrders = orders?.length || 0;
          const pendingOrders =
            orders?.filter((o) => o.status === "pending").length || 0;
          const completedOrders =
            orders?.filter((o) => o.status === "delivered").length || 0;
          const totalRevenue =
            orders?.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0) || 0;

          // Fetch product count
          const { count: productCount, error: productsError } = await supabase
            .from("products")
            .select("*", { count: "exact", head: true });

          const totalProducts = productsError ? 0 : (productCount || 0);

          setStats({
            totalOrders,
            pendingOrders,
            completedOrders,
            totalRevenue,
            totalProducts,
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: "bg-blue-500",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: Clock,
      color: "bg-yellow-500",
    },
    {
      title: "Completed Orders",
      value: stats.completedOrders,
      icon: CheckCircle,
      color: "bg-green-500",
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "bg-purple-500",
    },
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "bg-indigo-500",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className={cn([integralCF.className, "text-3xl font-bold mb-2"])}>
          Dashboard
        </h1>
        <p className="text-gray-600">Welcome to the admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={cn("p-3 rounded-lg", stat.color)}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className={cn([integralCF.className, "text-xl font-bold mb-4"])}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/products"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Package className="w-6 h-6 mb-2 text-gray-700" />
            <p className="font-semibold">Manage Products</p>
            <p className="text-sm text-gray-600">Add, edit, or delete products</p>
          </a>
          <a
            href="/admin/orders"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ShoppingBag className="w-6 h-6 mb-2 text-gray-700" />
            <p className="font-semibold">View Orders</p>
            <p className="text-sm text-gray-600">Manage and track orders</p>
          </a>
          <a
            href="/admin/settings"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <TrendingUp className="w-6 h-6 mb-2 text-gray-700" />
            <p className="font-semibold">Settings</p>
            <p className="text-sm text-gray-600">Configure admin settings</p>
          </a>
        </div>
      </div>
    </div>
  );
}

