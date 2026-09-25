"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useCart } from "@/context/CartContext";
import type { OrderType, PaymentMethod } from "@/types";

const DELIVERY_FEE = 2.5;
const FREE_DELIVERY_THRESHOLD = 25;
const MINIMUM_ORDER = 10;


export default function CheckoutPage() {
    const router = useRouter();
  const {
    items,
    subtotal,
  } = useCart();

  const [orderType, setOrderType] =
    useState<OrderType>("DELIVERY");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("CASH");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");

  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
const [submitError, setSubmitError] = useState("");

  const deliveryFee =
    orderType === "COLLECTION"
      ? 0
      : subtotal >= FREE_DELIVERY_THRESHOLD
        ? 0
        : DELIVERY_FEE;

  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
            <Link
              href="/"
              className="text-xl font-bold text-orange-600"
            >
              Spice Heaven
            </Link>

            <Link
              href="/menu"
              className="text-sm font-semibold text-gray-600 hover:text-orange-600"
            >
              Back to menu
            </Link>
          </div>
        </header>

        <section className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center px-4">
          <div className="text-center">
            <div className="text-6xl">🛒</div>

            <h1 className="mt-5 text-2xl font-bold text-gray-900">
              Your basket is empty
            </h1>

            <p className="mt-2 text-gray-600">
              Add some items before checking out.
            </p>

            <Link
              href="/menu"
              className="mt-6 inline-block rounded-xl bg-orange-600 px-6 py-3 font-bold text-white hover:bg-orange-700"
            >
              Browse menu
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (subtotal < MINIMUM_ORDER) {
    return (
      <main className="min-h-screen bg-gray-50">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
            <Link
              href="/"
              className="text-xl font-bold text-orange-600"
            >
              Spice Heaven
            </Link>
          </div>
        </header>

        <section className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center px-4">
          <div className="max-w-md text-center">
            <div className="text-5xl">⚠️</div>

            <h1 className="mt-5 text-2xl font-bold text-gray-900">
              Minimum order not reached
            </h1>

            <p className="mt-3 text-gray-600">
              Your order needs to be at least £
              {MINIMUM_ORDER.toFixed(2)}.
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Add £
              {(MINIMUM_ORDER - subtotal).toFixed(2)} more
              to continue.
            </p>

            <Link
              href="/basket"
              className="mt-6 inline-block rounded-xl bg-orange-600 px-6 py-3 font-bold text-white hover:bg-orange-700"
            >
              Back to basket
            </Link>
          </div>
        </section>
      </main>
    );
  }

  async function handlePlaceOrder() {
    try {
      setIsSubmitting(true);
      setSubmitError("");
  
      if (!name.trim()) {
        throw new Error("Please enter your name");
      }
  
      if (!phone.trim()) {
        throw new Error("Please enter your phone number");
      }
  
      if (
        orderType === "DELIVERY" &&
        (!addressLine1.trim() ||
          !city.trim() ||
          !postcode.trim())
      ) {
        throw new Error(
          "Please complete your delivery address",
        );
      }
  
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL ??
        "http://localhost:5000/api";
  
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: {
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim() || undefined,
          },
  
          orderType,
  
          paymentMethod,
  
          items: items.map((item) => ({
            menuItemId: item.id,
            quantity: item.quantity,
            notes: item.notes,
          })),
  
          ...(orderType === "DELIVERY"
            ? {
                deliveryAddress: {
                  addressLine1: addressLine1.trim(),
                  addressLine2:
                    addressLine2.trim() || undefined,
                  city: city.trim(),
                  postcode: postcode.trim(),
                },
              }
            : {}),
  
          notes: notes.trim() || undefined,
        }),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(
          result.message ?? "Unable to place order",
        );
      }
  
      console.log("Order created:", result.data);
  
      router.push(`/order-confirmation/${result.data.id}`);
    } catch (error) {
      console.error(error);
  
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to place order",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="text-xl font-bold text-orange-600"
          >
            Spice Heaven
          </Link>

          <Link
            href="/basket"
            className="text-sm font-semibold text-gray-600 hover:text-orange-600"
          >
            ← Basket
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-8 pb-12 sm:px-6 sm:py-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">
            Spice Heaven
          </p>

          <h1 className="mt-1 text-3xl font-extrabold text-gray-900">
            Checkout
          </h1>

          <p className="mt-2 text-gray-600">
            Complete your details to place your order.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {/* Order type */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold text-gray-900">
                How would you like your order?
              </h2>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setOrderType("DELIVERY")}
                  className={`rounded-2xl border p-4 text-left transition ${
                    orderType === "DELIVERY"
                      ? "border-orange-500 bg-orange-50 ring-2 ring-orange-100"
                      : "border-gray-200 hover:border-orange-200"
                  }`}
                >
                  <div className="text-2xl">🚗</div>

                  <p className="mt-2 font-bold text-gray-900">
                    Delivery
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    We'll deliver your order to you.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderType("COLLECTION")}
                  className={`rounded-2xl border p-4 text-left transition ${
                    orderType === "COLLECTION"
                      ? "border-orange-500 bg-orange-50 ring-2 ring-orange-100"
                      : "border-gray-200 hover:border-orange-200"
                  }`}
                >
                  <div className="text-2xl">🛍️</div>

                  <p className="mt-2 font-bold text-gray-900">
                    Collection
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Pick up your order from the restaurant.
                  </p>
                </button>
              </div>
            </section>

            {/* Customer details */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold text-gray-900">
                Your details
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="name"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Full name
                  </label>

                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    placeholder="Enter your name"
                    className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Phone number
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(event) =>
                      setPhone(event.target.value)
                    }
                    placeholder="07..."
                    className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>
            </section>

            {/* Delivery address */}
            {orderType === "DELIVERY" && (
              <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-bold text-gray-900">
                  Delivery address
                </h2>

                <div className="mt-5 space-y-4">
                  <div>
                    <label
                      htmlFor="addressLine1"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Address line 1
                    </label>

                    <input
                      id="addressLine1"
                      type="text"
                      value={addressLine1}
                      onChange={(event) =>
                        setAddressLine1(event.target.value)
                      }
                      placeholder="House number and street"
                      className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="addressLine2"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Address line 2
                      <span className="ml-1 font-normal text-gray-400">
                        (optional)
                      </span>
                    </label>

                    <input
                      id="addressLine2"
                      type="text"
                      value={addressLine2}
                      onChange={(event) =>
                        setAddressLine2(event.target.value)
                      }
                      placeholder="Apartment, flat, etc."
                      className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="city"
                        className="text-sm font-semibold text-gray-700"
                      >
                        City
                      </label>

                      <input
                        id="city"
                        type="text"
                        value={city}
                        onChange={(event) =>
                          setCity(event.target.value)
                        }
                        placeholder="London"
                        className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="postcode"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Postcode
                      </label>

                      <input
                        id="postcode"
                        type="text"
                        value={postcode}
                        onChange={(event) =>
                          setPostcode(event.target.value)
                        }
                        placeholder="SW1A 1AA"
                        className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 uppercase outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Payment */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold text-gray-900">
                Payment method
              </h2>

              <div className="mt-4 space-y-3">
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                    paymentMethod === "CASH"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "CASH"}
                    onChange={() =>
                      setPaymentMethod("CASH")
                    }
                    className="h-4 w-4 accent-orange-600"
                  />

                  <div>
                    <p className="font-semibold text-gray-900">
                      💷 Cash
                    </p>

                    <p className="text-sm text-gray-500">
                      Pay when you receive or collect your order.
                    </p>
                  </div>
                </label>

                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                    paymentMethod === "CARD"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "CARD"}
                    onChange={() =>
                      setPaymentMethod("CARD")
                    }
                    className="h-4 w-4 accent-orange-600"
                  />

                  <div>
                    <p className="font-semibold text-gray-900">
                      💳 Card
                    </p>

                    <p className="text-sm text-gray-500">
                      Pay by card when you receive or collect your order.
                    </p>
                  </div>
                </label>
              </div>
            </section>

            {/* Notes */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold text-gray-900">
                Order notes
              </h2>

              <textarea
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
                rows={4}
                placeholder="Any special instructions? (optional)"
                className="mt-4 w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </section>
          </div>

          {/* Summary */}
          <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-6">
            <h2 className="text-lg font-bold text-gray-900">
              Your order
            </h2>

            <div className="mt-5 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between gap-4 text-sm"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {item.quantity} × {item.name}
                    </p>

                    <p className="mt-1 text-gray-500">
                      £{item.price.toFixed(2)} each
                    </p>
                  </div>

                  <p className="font-semibold text-gray-900">
                    £
                    {(item.price * item.quantity).toFixed(
                      2,
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className="my-5 border-t border-gray-200" />

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>£{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>
                  {orderType === "COLLECTION"
                    ? "Collection"
                    : "Delivery"}
                </span>

                <span>
                  {deliveryFee === 0 ? "FREE" : `£${deliveryFee.toFixed(2)}`}
                </span>
              </div>
            </div>

            <div className="my-5 border-t border-gray-200" />

            <div className="flex justify-between text-xl font-extrabold text-gray-900">
              <span>Total</span>
              <span>£{total.toFixed(2)}</span>
            </div>

            {submitError && (
  <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
    {submitError}
  </div>
)}

    <button
    type="button"
    onClick={handlePlaceOrder}
    disabled={isSubmitting}
    className="mt-6 w-full rounded-xl bg-orange-600 px-5 py-4 font-bold text-white transition hover:bg-orange-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-orange-300"
    >
    {isSubmitting ? "Placing order..." : "Place order"}
    </button>

            <p className="mt-3 text-center text-xs leading-5 text-gray-500">
              By placing your order, you confirm that your
              details and order information are correct.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}