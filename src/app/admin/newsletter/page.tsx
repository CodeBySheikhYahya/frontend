"use client";

import React, { useEffect, useState } from "react";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  getAllNewsletterSubscribers,
  unsubscribeSubscriber,
  deleteSubscriber,
  type NewsletterSubscriber,
} from "@/lib/supabase/newsletter";
import { Mail, Trash2, X, CheckCircle } from "lucide-react";

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [unsubscribingId, setUnsubscribingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const data = await getAllNewsletterSubscribers();
      setSubscribers(data);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (id: string, email: string) => {
    if (!confirm(`Unsubscribe "${email}"?`)) {
      return;
    }

    setUnsubscribingId(id);
    try {
      const result = await unsubscribeSubscriber(id);
      if (result.success) {
        await fetchSubscribers();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert("Failed to unsubscribe");
    } finally {
      setUnsubscribingId(null);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${email}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingId(id);
    try {
      const result = await deleteSubscriber(id);
      if (result.success) {
        setSubscribers(subscribers.filter((s) => s.id !== id));
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert("Failed to delete subscriber");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredSubscribers = subscribers.filter((sub) => {
    if (filter === "active") return sub.is_active;
    if (filter === "inactive") return !sub.is_active;
    return true;
  });

  const activeCount = subscribers.filter((s) => s.is_active).length;
  const inactiveCount = subscribers.filter((s) => !s.is_active).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Loading subscribers...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className={cn([integralCF.className, "text-3xl font-bold mb-2"])}>
            Newsletter Subscribers
          </h1>
          <p className="text-gray-600">
            Manage newsletter email subscriptions ({subscribers.length} total, {activeCount} active, {inactiveCount} inactive)
          </p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="mb-6 flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
          className="text-sm"
        >
          All ({subscribers.length})
        </Button>
        <Button
          variant={filter === "active" ? "default" : "outline"}
          onClick={() => setFilter("active")}
          className="text-sm"
        >
          Active ({activeCount})
        </Button>
        <Button
          variant={filter === "inactive" ? "default" : "outline"}
          onClick={() => setFilter("inactive")}
          className="text-sm"
        >
          Inactive ({inactiveCount})
        </Button>
      </div>

      {/* Subscribers Table */}
      {filteredSubscribers.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No subscribers found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscribed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unsubscribed
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {subscriber.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {subscriber.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <X className="w-3 h-3 mr-1" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subscriber.subscribed_at
                        ? new Date(subscriber.subscribed_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subscriber.unsubscribed_at
                        ? new Date(subscriber.unsubscribed_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {subscriber.is_active && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleUnsubscribe(subscriber.id, subscriber.email)
                            }
                            disabled={unsubscribingId === subscriber.id}
                            className="text-xs"
                          >
                            {unsubscribingId === subscriber.id
                              ? "Unsubscribing..."
                              : "Unsubscribe"}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDelete(subscriber.id, subscriber.email)
                          }
                          disabled={deletingId === subscriber.id}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          {deletingId === subscriber.id ? (
                            "Deleting..."
                          ) : (
                            <>
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </>
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
