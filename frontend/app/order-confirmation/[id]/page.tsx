"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCart } from "@/context/CartContext";

import { apiFetch } from "@/lib/api";

interface OrderItem {
  id: string;
  menuItemId: string;
  itemName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

interface DeliveryAddress {
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  postcode: string;
}

interface Order {
  id: string;
  status: string;
  orderType: "DELIVERY" | "COLLECTION";
  paymentMethod: "CASH" | "CARD";
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
  items: OrderItem[];
  deliveryAddress?: DeliveryAddress | null;
}

interface OrderResponse {
  success: boolean;
  data: Order;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { clearCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrder() {
      try {
        setIsLoading(true);
        setError("");

        const result = await apiFetch<OrderResponse>(
          `/orders/${orderId}`,
        );

        setOrder(result.data);
        clearCart();
      } catch (error) {
        console.error("Failed to load order:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load your order",
        );
      } finally {
        setIsLoading(false);
      }
    }

    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-orange-50 px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-2xl">
            🍛
          </div>
          <p className="font-semibold text-gray-700">
            Loading your order...
          </p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-orange-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">
            !
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Order not found
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            {error || "We couldn't find this order."}
          </p>

          <Link
            href="/menu"
            className="mt-6 inline-block rounded-xl bg-orange-600 px-6 py-3 font-bold text-white transition hover:bg-orange-700"
          >
            Back to menu
          </Link>
        </div>
      </main>
    );
  }

  const formattedOrderDate = new Date(
    order.createdAt,
  ).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const statusLabel =
    order.status.charAt(0) +
    order.status.slice(1).toLowerCase();

  return (
    <main className="min-h-screen bg-orange-50">
      <header className="border-b border-orange-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <Link
            href="/"
            className="text-xl font-extrabold tracking-tight text-orange-600"
          >
            Spice Heaven
          </Link>

          <Link
            href="/menu"
            className="text-sm font-semibold text-gray-700 transition hover:text-orange-600"
          >
            Order again
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Success message */}
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
            ✓
          </div>

          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Order placed successfully!
          </h1>

          <p className="mt-3 text-gray-600">
            Thank you for ordering from Spice Heaven.
          </p>
        </div>

        {/* Order number */}
        <div className="mt-8 rounded-2xl border border-orange-100 bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Order number
          </p>

          <p className="mt-2 break-all text-lg font-extrabold text-gray-900">
            {order.id}
          </p>

          <p className="mt-2 text-sm text-gray-500">
            {formattedOrderDate}
          </p>
        </div>

        {/* Order status */}
        <div className="mt-5 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">
                Order status
              </p>

              <p className="mt-1 text-lg font-bold text-gray-900">
                {statusLabel}
              </p>
            </div>

            <div className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-bold text-yellow-700">
              {statusLabel}
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-orange-50 p-4 text-sm leading-6 text-gray-700">
            {order.orderType === "DELIVERY"
              ? "Your order will be prepared and delivered to your address."
              : "Your order will be prepared and will be ready for collection."}
          </div>
        </div>

        {/* Order details */}
        <div className="mt-5 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">
            Order details
          </h2>

          <div className="mt-5 space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {item.quantity} × {item.itemName}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    £{item.unitPrice.toFixed(2)} each
                  </p>
                </div>

                <p className="shrink-0 font-bold text-gray-900">
                  £{item.subtotal.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery / collection */}
        <div className="mt-5 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">
            {order.orderType === "DELIVERY"
              ? "Delivery details"
              : "Collection details"}
          </h2>

          <div className="mt-4">
            <p className="font-semibold text-gray-900">
              {order.orderType === "DELIVERY"
                ? "Delivery"
                : "Collection"}
            </p>

            {order.orderType === "DELIVERY" &&
              order.deliveryAddress && (
                <div className="mt-2 text-sm leading-6 text-gray-600">
                  <p>
                    {order.deliveryAddress.addressLine1}
                  </p>

                  {order.deliveryAddress.addressLine2 && (
                    <p>
                      {order.deliveryAddress.addressLine2}
                    </p>
                  )}

                  <p>
                    {order.deliveryAddress.city}
                  </p>

                  <p>
                    {order.deliveryAddress.postcode}
                  </p>
                </div>
              )}
          </div>

          <div className="mt-5 border-t border-gray-100 pt-5">
            <p className="text-sm text-gray-500">
              Payment
            </p>

            <p className="mt-1 font-semibold text-gray-900">
              {order.paymentMethod === "CASH"
                ? "Cash on delivery / collection"
                : "Card on delivery / collection"}
            </p>
          </div>
        </div>

        {/* Price summary */}
        <div className="mt-5 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">
            Payment summary
          </h2>

          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">
                Subtotal
              </span>

              <span className="font-semibold text-gray-900">
                £{order.subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                Delivery
              </span>

              <span className="font-semibold text-gray-900">
                {order.deliveryFee === 0
                  ? "FREE"
                  : `£${order.deliveryFee.toFixed(2)}`}
              </span>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between">
                <span className="text-lg font-bold text-gray-900">
                  Total
                </span>

                <span className="text-lg font-extrabold text-orange-600">
                  £{order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6">
          <Link
            href="/menu"
            className="block w-full rounded-xl bg-orange-600 px-5 py-4 text-center font-bold text-white transition hover:bg-orange-700 active:scale-[0.99]"
          >
            Order again
          </Link>

          <Link
            href="/"
            className="mt-3 block w-full rounded-xl border border-gray-200 bg-white px-5 py-4 text-center font-bold text-gray-700 transition hover:bg-gray-50"
          >
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}