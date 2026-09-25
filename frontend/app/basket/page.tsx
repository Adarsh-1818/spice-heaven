
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useCart } from "@/context/CartContext";
import { apiFetch } from "@/lib/api";

interface RestaurantSettings {
  minimumOrderAmount: number;
  deliveryFee: number;
  freeDeliveryAbove: number;
}

interface SettingsResponse {
  success: boolean;
  data: RestaurantSettings;
}

export default function BasketPage() {
  const {
    items,
    subtotal,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
  } = useCart();

  const [settings, setSettings] =
    useState<RestaurantSettings | null>(null);

  const [settingsError, setSettingsError] =
    useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        setSettingsError("");

        const result =
          await apiFetch<SettingsResponse>(
            "/settings",
          );

        setSettings(result.data);
      } catch (error) {
        console.error(
          "Failed to load restaurant settings:",
          error,
        );

        setSettingsError(
          error instanceof Error
            ? error.message
            : "Unable to load restaurant settings",
        );
      }
    }

    loadSettings();
  }, []);

  /*
   * Keep the basket usable while settings
   * are loading. These values are only fallback
   * values and should match the seeded settings.
   */
  const minimumOrder =
    settings?.minimumOrderAmount ?? 10;

  const deliveryFeeAmount =
    settings?.deliveryFee ?? 2.5;

  const freeDeliveryThreshold =
    settings?.freeDeliveryAbove ?? 25;

  const deliveryFee =
    subtotal === 0
      ? 0
      : subtotal >= freeDeliveryThreshold
        ? 0
        : deliveryFeeAmount;

  const total = subtotal + deliveryFee;

  const minimumOrderRemaining = Math.max(
    minimumOrder - subtotal,
    0,
  );

  const canCheckout =
    items.length > 0 &&
    subtotal >= minimumOrder;

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-orange-600"
            >
              Spice Heaven
            </Link>

            <Link
              href="/menu"
              className="rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
            >
              Back to menu
            </Link>
          </div>
        </header>

        <section className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center px-4 py-12 sm:px-6">
          <div className="text-center">
            <div className="text-6xl">🛒</div>

            <h1 className="mt-5 text-2xl font-bold text-gray-900">
              Your basket is empty
            </h1>

            <p className="mt-2 text-gray-600">
              Add some delicious food to get started.
            </p>

            <Link
              href="/menu"
              className="mt-6 inline-block rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white transition hover:bg-orange-700"
            >
              Browse menu
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-orange-600"
          >
            Spice Heaven
          </Link>

          <Link
            href="/menu"
            className="text-sm font-semibold text-gray-600 hover:text-orange-600"
          >
            ← Continue shopping
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">
            Spice Heaven
          </p>

          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900">
            Your basket
          </h1>
        </div>

        {settingsError && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Unable to load the latest restaurant
            settings. Please refresh the page and try
            again.
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Basket items */}

          <section className="space-y-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-3xl">
                    🍛
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-bold text-gray-900">
                          {item.name}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                          £{item.price.toFixed(2)} each
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeItem(item.id)
                        }
                        className="text-sm font-medium text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center rounded-xl border border-gray-200">
                        <button
                          type="button"
                          onClick={() =>
                            decreaseQuantity(item.id)
                          }
                          className="flex h-10 w-10 items-center justify-center text-lg font-bold text-gray-700 hover:bg-gray-50"
                        >
                          −
                        </button>

                        <span className="flex h-10 min-w-10 items-center justify-center border-x border-gray-200 px-3 text-sm font-semibold">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            increaseQuantity(item.id)
                          }
                          className="flex h-10 w-10 items-center justify-center text-lg font-bold text-gray-700 hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>

                      <p className="font-bold text-gray-900">
                        £
                        {(
                          item.price *
                          item.quantity
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}

            <Link
              href="/menu"
              className="block rounded-xl border border-orange-100 bg-orange-50 px-5 py-4 text-center text-sm font-bold text-orange-700 transition hover:border-orange-200 hover:bg-orange-100"
            >
              <span className="mr-2">＋</span>
              Add more items
            </Link>
          </section>

          {/* Order summary */}

          <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-6">
            <h2 className="text-lg font-bold text-gray-900">
              Order summary
            </h2>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>

                <span>
                  £{subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>

                <span>
                  {deliveryFee === 0
                    ? subtotal >=
                      freeDeliveryThreshold
                      ? "FREE"
                      : "—"
                    : `£${deliveryFee.toFixed(2)}`}
                </span>
              </div>
            </div>

            {subtotal > 0 &&
              subtotal < freeDeliveryThreshold && (
                <div className="mt-5 rounded-xl bg-orange-50 p-4 text-sm text-orange-800">
                  <p className="font-semibold">
                    £
                    {(
                      freeDeliveryThreshold -
                      subtotal
                    ).toFixed(2)}{" "}
                    away from free delivery
                  </p>

                  <p className="mt-1 text-orange-700">
                    Add more items to get free
                    delivery.
                  </p>
                </div>
              )}

            <div className="my-5 border-t border-gray-200" />

            <div className="flex justify-between text-lg font-extrabold text-gray-900">
              <span>Total</span>

              <span>
                £{total.toFixed(2)}
              </span>
            </div>

            {minimumOrderRemaining > 0 && (
              <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                <p className="font-semibold">
                  Minimum order is £
                  {minimumOrder.toFixed(2)}
                </p>

                <p className="mt-1">
                  Add £
                  {minimumOrderRemaining.toFixed(
                    2,
                  )}{" "}
                  more to continue.
                </p>
              </div>
            )}

            {canCheckout ? (
              <Link
                href="/checkout"
                className="mt-6 block w-full rounded-xl bg-orange-600 px-5 py-4 text-center font-bold text-white transition hover:bg-orange-700 active:scale-[0.99]"
              >
                Proceed to checkout
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="mt-6 w-full cursor-not-allowed rounded-xl bg-gray-200 px-5 py-4 font-bold text-gray-500"
              >
                Minimum order £
                {minimumOrder.toFixed(2)}
              </button>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}