"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  LogOut,
  Menu,
  X,
  Folder,
  Tag,
  // Layout, // Commented out - Product Tabs feature disabled
} from "lucide-react";
import { isAdmin } from "@/lib/supabase/admin";
import { supabase } from "@/lib/supabase";

const adminNavItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: Folder,
  },
  {
    label: "Attributes",
    href: "/admin/attributes",
    icon: Tag,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Package,
  },
  // {
  //   label: "Product Tabs",
  //   href: "/admin/tabs",
  //   icon: Layout,
  // },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!mounted) return;

      // Don't check on login page
      if (pathname === "/admin/login") {
        setLoading(false);
        return;
      }

      setLoading(true);
      const adminStatus = await isAdmin();
      setIsAuthorized(adminStatus);
      setLoading(false);

      // Redirect to login if not admin
      if (!adminStatus) {
        router.push(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
      }
    };

    if (mounted) {
      checkAdmin();
    }
  }, [mounted, router, pathname]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Checking admin access...</p>
      </div>
    );
  }

  // Don't show layout on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Redirect to login if not authorized (handled in useEffect, but show loading while redirecting)
  if (!isAuthorized && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-900 font-semibold mb-2">Access Denied</p>
          <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
          <Link href="/admin/login" className="text-blue-600 hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
              <Link href="/admin" className={cn([integralCF.className, "text-2xl font-bold"])}>
                Admin Panel
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-gray-900 hidden sm:inline"
              >
                Back to Store
              </Link>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push("/admin/login");
                  router.refresh();
                }}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Mobile Navigation Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar Navigation */}
        <aside
          className={cn(
            "bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] transition-transform duration-300 ease-in-out z-40",
            "fixed lg:static lg:translate-x-0",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
            "w-64"
          )}
        >
          <nav className="p-4 space-y-2">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-black text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 w-full lg:w-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

