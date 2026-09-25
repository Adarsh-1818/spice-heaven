"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import CategoryFilter from "@/components/menu/CategoryFilter";
import MenuItemCard from "@/components/menu/MenuItemCard";
import { useCart } from "@/context/CartContext";
import type { Category, MenuItem } from "@/types";

const API_URL =
process.env.NEXT_PUBLIC_API_URL ??
"http://localhost:5000/api";

interface CustomerUser {
id: string;
name: string;
email: string;
phone?: string | null;
role: "CUSTOMER" | "ADMIN";
}

export default function MenuPage() {
const { addItem, itemCount, subtotal } = useCart();

const [customer, setCustomer] =
useState<CustomerUser | null>(null);

const [categories, setCategories] =
useState<Category[]>([]);

const [menuItems, setMenuItems] =
useState<MenuItem[]>([]);

const [selectedCategory, setSelectedCategory] =
useState<string | null>(null);

const [addedItemName, setAddedItemName] =
useState<string | null>(null);

const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

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

useEffect(() => {
async function loadMenu() {
try {
setLoading(true);
setError("");

    const [
      categoriesResponse,
      menuResponse,
    ] = await Promise.all([
      fetch(`${API_URL}/categories`),
      fetch(`${API_URL}/menu`),
    ]);

    if (
      !categoriesResponse.ok ||
      !menuResponse.ok
    ) {
      throw new Error("Failed to load menu");
    }

    const categoriesData =
      await categoriesResponse.json();

    const menuData =
      await menuResponse.json();

    setCategories(categoriesData.data);
    setMenuItems(menuData.data);
  } catch (err) {
    console.error(err);

    setError(
      "Unable to load the menu. Please try again.",
    );
  } finally {
    setLoading(false);
  }
}

loadMenu();
}, []);

const filteredItems = selectedCategory
? menuItems.filter(
(item) =>
item.categoryId === selectedCategory,
)
: menuItems;

function handleAddToCart(item: MenuItem) {
addItem(item);
setAddedItemName(item.name);
setTimeout(() => {
  setAddedItemName(null);
}, 2000);

}

function handleLogout() {
localStorage.removeItem(
"spice_haven_customer_token",
);
localStorage.removeItem(
  "spice_haven_customer_user",
);

setCustomer(null);
}

return ( <main className="min-h-screen bg-gray-50">
{/* Header */} <header className="border-b border-gray-200 bg-white"> <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6"> <Link
         href="/"
         className="text-xl font-bold tracking-tight text-orange-600"
       >
Spice Heaven </Link>
      <nav className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/"
          className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 sm:block"
        >
          Home
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
              className="hidden rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:block"
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
          href="/basket"
          className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
        >
          🛒 Basket

          {itemCount > 0 && (
            <span className="ml-2 rounded-full bg-orange-600 px-2 py-0.5 text-xs text-white">
              {itemCount}
            </span>
          )}
        </Link>
      </nav>
    </div>
  </header>

  {/* Page heading */}
  <section className="bg-orange-50">
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">
        Spice Heaven
      </p>

      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
        Our menu
      </h1>

      <p className="mt-3 max-w-2xl text-gray-600">
        Choose your favourites and build your
        order. Delivery or collection available.
      </p>

      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <span className="rounded-full bg-white px-4 py-2 font-medium text-gray-700 shadow-sm">
          🚗 Delivery
        </span>

        <span className="rounded-full bg-white px-4 py-2 font-medium text-gray-700 shadow-sm">
          🛍️ Collection
        </span>

        <span className="rounded-full bg-white px-4 py-2 font-medium text-gray-700 shadow-sm">
          💷 Min. order £10
        </span>
      </div>
    </div>
  </section>

  {/* Menu */}
  <section className="mx-auto max-w-6xl px-4 pb-28 pt-8 sm:px-6 sm:pb-32 sm:pt-10">
    <CategoryFilter
      categories={categories}
      selectedCategory={selectedCategory}
      onSelect={setSelectedCategory}
    />

    {loading && (
      <div className="py-16 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-orange-600" />

        <p className="mt-4 text-sm text-gray-500">
          Loading menu...
        </p>
      </div>
    )}

    {!loading && error && (
      <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="font-semibold text-red-700">
          {error}
        </p>
      </div>
    )}

    {!loading &&
      !error &&
      filteredItems.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-lg font-semibold text-gray-900">
            No items available
          </p>

          <p className="mt-2 text-gray-500">
            Please choose another category.
          </p>
        </div>
      )}

    {!loading &&
      !error &&
      filteredItems.length > 0 && (
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onAdd={handleAddToCart}
            />
          ))}
        </div>
      )}
  </section>

  {/* Added to basket notification */}
  {addedItemName && (
    <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-xl">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
          ✓
        </span>

        <span>
          {addedItemName} added to basket
        </span>
      </div>
    </div>
  )}

  {/* Fixed basket CTA */}
  {itemCount > 0 && (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-orange-100 bg-white/95 p-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/basket"
          className="flex items-center justify-between rounded-2xl bg-orange-600 px-5 py-4 text-white shadow-lg transition hover:bg-orange-700 active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 min-w-9 items-center justify-center rounded-full bg-white/20 px-2 text-sm font-bold">
              {itemCount}
            </div>

            <div>
              <p className="text-sm font-semibold">
                View basket
              </p>

              <p className="text-xs text-orange-100">
                {itemCount === 1
                  ? "1 item"
                  : `${itemCount} items`}
              </p>
            </div>
          </div>

          <span className="text-base font-extrabold">
            £{subtotal.toFixed(2)} →
          </span>
        </Link>
      </div>
    </div>
  )}
</main>
);
}
