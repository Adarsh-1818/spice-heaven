"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const features = [
{
title: "Fast ordering",
description: "Order your favourites in just a few taps.",
},
{
title: "Delivery or collection",
description: "Choose what works best for you.",
},
{
title: "Pay your way",
description: "Pay by cash or card when you receive your order.",
},
];

interface CustomerUser {
id: string;
name: string;
email: string;
phone?: string | null;
role: "CUSTOMER" | "ADMIN";
}

export default function HomePage() {
const [customer, setCustomer] =
useState<CustomerUser | null>(null);

useEffect(() => {
const token = localStorage.getItem(
"spice_haven_customer_token",
);
const storedUser = localStorage.getItem(
  "spice_haven_customer_user",
);

if (token && storedUser) {
  try {
    const user = JSON.parse(
      storedUser,
    ) as CustomerUser;

    if (user.role === "CUSTOMER") {
      setCustomer(user);
    }
  } catch {
    localStorage.removeItem(
      "spice_haven_customer_user",
    );
  }
}

}, []);

function handleLogout() {
localStorage.removeItem(
"spice_haven_customer_token",
);

localStorage.removeItem(
  "spice_haven_customer_user",
);

setCustomer(null);

}

return ( <main className="min-h-screen bg-white">
{/* Header */} <header className="border-b border-gray-200 bg-white"> <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6"> <Link
         href="/"
         className="text-xl font-bold tracking-tight text-orange-600"
       >
Spice Heaven </Link>
      <nav className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/menu"
          className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 sm:block"
        >
          Menu
        </Link>

        {customer ? (
          <>
            <Link
              href="/orders"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              My Orders
            </Link>

            <span className="hidden text-sm text-gray-500 md:block">
              Hi, {customer.name}
            </span>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            Login
          </Link>
        )}

        <Link
          href="/menu"
          className="rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700"
        >
          Order now
        </Link>
      </nav>
    </div>
  </header>

  {/* Hero */}
  <section className="bg-orange-50">
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:flex lg:items-center lg:justify-between lg:gap-12">
      <div className="max-w-2xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-orange-600">
          Fresh • Fast • Delicious
        </p>

        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
          Great food,
          <span className="block text-orange-600">
            made for you.
          </span>
        </h1>

        <p className="mt-5 max-w-xl text-base leading-7 text-gray-600 sm:text-lg">
          Enjoy delicious food from Spice Heaven.
          Order online for convenient delivery or
          collection.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/menu"
            className="rounded-xl bg-orange-600 px-6 py-3 text-center font-semibold text-white shadow-sm transition hover:bg-orange-700"
          >
            View menu
          </Link>

          <a
            href="#why-us"
            className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-center font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Why Spice Heaven?
          </a>
        </div>
      </div>

      <div className="mt-10 flex h-64 w-full items-center justify-center rounded-3xl bg-orange-100 lg:mt-0 lg:h-96 lg:max-w-md">
        <div className="text-center">
          <div className="text-6xl">🍛</div>

          <p className="mt-4 font-semibold text-orange-800">
            Delicious food awaits
          </p>
        </div>
      </div>
    </div>
  </section>

  {/* Features */}
  <section
    id="why-us"
    className="px-4 py-16 sm:px-6"
  >
    <div className="mx-auto max-w-6xl">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">
          Simple ordering
        </p>

        <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
          Everything you need to order easily.
        </h2>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-lg font-bold text-gray-900">
              {feature.title}
            </h3>

            <p className="mt-2 leading-6 text-gray-600">
              {feature.description}
            </p>
          </article>
        ))}
      </div>
    </div>
  </section>

  {/* CTA */}
  <section className="px-4 pb-16 sm:px-6">
    <div className="mx-auto max-w-6xl rounded-3xl bg-gray-900 px-6 py-10 text-center sm:px-10">
      <h2 className="text-2xl font-bold text-white sm:text-3xl">
        Ready to order?
      </h2>

      <p className="mx-auto mt-3 max-w-xl text-gray-300">
        Browse our menu and choose delivery or collection.
      </p>

      <Link
        href="/menu"
        className="mt-6 inline-block rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white transition hover:bg-orange-700"
      >
        Start your order
      </Link>
    </div>
  </section>
</main>
);
}
