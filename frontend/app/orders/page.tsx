"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { apiFetch } from "@/lib/api";

interface OrderItem {
  id: string;
  itemName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: string;
  orderType: "DELIVERY" | "COLLECTION";
  paymentMethod: "CASH" | "CARD";
  status:
    | "PENDING"
    | "ACCEPTED"
    | "PREPARING"
    | "READY"
    | "OUT_FOR_DELIVERY"
    | "COMPLETED"
    | "CANCELLED";
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
  items: OrderItem[];
  deliveryAddress?: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postcode: string;
  } | null;
}

interface OrdersResponse {
  success: boolean;
  data: Order[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        setIsLoading(true);
        setError("");

        const result = await apiFetch<OrdersResponse>(
          "/orders/my-orders",
          undefined,
          "customer",
        );

        setOrders(result.data);
      } catch (error) {
        console.error(
          "Failed to load customer orders:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load your orders",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadOrders();
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-gray-600">
            Loading your orders...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-orange-600">
              Spice Heaven
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              My Orders
            </h1>
          </div>

          <Link
            href="/menu"
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
          >
            Order again
          </Link>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {!error && orders.length === 0 && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <div className="text-5xl">🍛</div>

            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              No orders yet
            </h2>

            <p className="mt-2 text-gray-600">
              Your Spice Heaven orders will appear here.
            </p>

            <Link
              href="/menu"
              className="mt-6 inline-block rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700"
            >
              Browse menu
            </Link>
          </div>
        )}

        <div className="space-y-5">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-2xl bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Order #{order.id}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {new Date(
                      order.createdAt,
                    ).toLocaleString("en-GB")}
                  </p>
                </div>

                <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                  {order.status.replaceAll(
                    "_",
                    " ",
                  )}
                </span>
              </div>

              <div className="mt-5 border-t pt-4">
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between gap-4 text-sm"
                    >
                      <span className="text-gray-700">
                        {item.quantity} ×{" "}
                        {item.itemName}
                      </span>

                      <span className="font-medium text-gray-900">
                        £
                        {item.subtotal.toFixed(
                          2,
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 border-t pt-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>
                    £{order.subtotal.toFixed(2)}
                  </span>
                </div>

                {order.orderType ===
                  "DELIVERY" && (
                  <div className="mt-1 flex justify-between text-sm text-gray-600">
                    <span>Delivery</span>
                    <span>
                      {order.deliveryFee === 0
                        ? "FREE"
                        : `£${order.deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                )}

                <div className="mt-3 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>
                    £{order.total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
                <span className="rounded-full bg-gray-100 px-3 py-1">
                  {order.orderType ===
                  "DELIVERY"
                    ? "Delivery"
                    : "Collection"}
                </span>

                <span className="rounded-full bg-gray-100 px-3 py-1">
                  Pay by{" "}
                  {order.paymentMethod ===
                  "CARD"
                    ? "Card"
                    : "Cash"}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}