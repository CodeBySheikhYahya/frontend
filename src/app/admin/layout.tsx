"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Admin panel UI is turned off for the SRX retailer shop demo.
 * Traffic is redirected from the storefront via `src/middleware.ts`.
 *
 * --- Previous implementation (full shell + sidebar + auth) was here; restore from git
 *     if you need the admin panel again, and remove the `/admin` branch in `middleware.ts`.
 */

export default function AdminLayout(_: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-600 text-sm">Admin is disabled for this demo.</p>
    </div>
  );
}
