"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { apiFetch } from "@/lib/api";

type OrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "COMPLETED"
  | "CANCELLED";

type OrderType = "DELIVERY" | "COLLECTION";
type StatusFilter = "ALL" | OrderStatus;

interface OrderItem {
  id: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
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
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  orderType: OrderType;
  paymentMethod: "CASH" | "CARD";
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  total: number;
  customerNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  deliveryAddress?: DeliveryAddress | null;
}

interface OrdersResponse {
  success: boolean;
  data: Order[];
}

const statusLabels: Record<OrderStatus, string> = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  PREPARING: "Preparing",
  READY: "Ready",
  OUT_FOR_DELIVERY: "Out for delivery",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

function getNextStatus(
    order: Order,
  ): OrderStatus | undefined {
    switch (order.status) {
      case "PENDING":
        return "ACCEPTED";
  
      case "ACCEPTED":
        return "PREPARING";
  
      case "PREPARING":
        return "READY";
  
      case "READY":
        return order.orderType === "DELIVERY"
          ? "OUT_FOR_DELIVERY"
          : "COMPLETED";
  
      case "OUT_FOR_DELIVERY":
        return "COMPLETED";
  
      default:
        return undefined;
    }
  }

export default function AdminPage() {
    const router = useRouter();

    const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] =
    useState<string | null>(null);
    const [statusFilter, setStatusFilter] =
  useState<StatusFilter>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  async function loadOrders() {
    try {
      setError("");
  
      const result = await apiFetch<OrdersResponse>(
        "/orders",  undefined,
        "admin",
      );
  
      setOrders(result.data);
    } catch (error) {
      console.error("Failed to load orders:", error);
  
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load orders",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem(
      "spice_haven_admin_token",
    );

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    setIsAuthenticated(true);
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
  
    loadOrders();
  
    const interval = window.setInterval(() => {
      loadOrders();
    }, 15000);
  
    return () => {
      window.clearInterval(interval);
    };
  }, [isAuthenticated]);

  async function handleStatusUpdate(
    orderId: string,
    status: OrderStatus,
  ) {
    try {
      setUpdatingOrderId(orderId);
      setError("");

      const result = await apiFetch<{ data: Order }>(
        `/orders/${orderId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status,
          }),
        },
        "admin",
      );

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? result.data
            : order,
        ),
      );
    } catch (error) {
      console.error(
        "Failed to update order status:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to update order status",
      );
    } finally {
      setUpdatingOrderId(null);
    }
  }

  const pendingOrders = orders.filter(
    (order) => order.status === "PENDING",
  );

  const preparingOrders = orders.filter(
    (order) =>
      order.status === "PREPARING" ||
      order.status === "ACCEPTED",
  );

  const completedOrders = orders.filter(
    (order) => order.status === "COMPLETED",
  );

  const today = new Date().toDateString();

  const todaysOrders = orders.filter(
    (order) =>
      new Date(order.createdAt).toDateString() === today,
  );

  const todaysRevenue = todaysOrders
    .filter((order) => order.status !== "CANCELLED")
    .reduce((total, order) => total + order.total, 0);

    const filteredOrders = orders.filter((order) => {
        const matchesStatus =
          statusFilter === "ALL" ||
          order.status === statusFilter;
      
        const search = searchTerm.trim().toLowerCase();
      
        const matchesSearch =
          search === "" ||
          order.customerName.toLowerCase().includes(search) ||
          order.customerPhone.toLowerCase().includes(search) ||
          order.id.toLowerCase().includes(search);
      
        return matchesStatus && matchesSearch;
      });

      async function handleCancelOrder(orderId: string) {
        const confirmed = window.confirm(
          "Are you sure you want to cancel this order?",
        );
      
        if (!confirmed) {
          return;
        }
      
        try {
          await apiFetch(`/orders/${orderId}/status`, {
            method: "PATCH",
            body: JSON.stringify({
              status: "CANCELLED",
            }),
          });
      
          await loadOrders();
        } catch (error) {
          console.error("Failed to cancel order:", error);
      
          alert(
            error instanceof Error
              ? error.message
              : "Failed to cancel order",
          );
        }
      }

      if (!isAuthenticated) {
        return (
          <main className="flex min-h-screen items-center justify-center bg-gray-50">
            <p className="text-sm text-gray-500">
              Checking authentication...
            </p>
          </main>
        );
      }

      function handleLogout() {
        localStorage.removeItem("spice_haven_admin_token");
        localStorage.removeItem("spice_haven_admin_user");
      
        router.replace("/admin/login");
      }
      
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
          <div>
            <Link
              href="/"
              className="text-xl font-extrabold text-orange-600"
            >
              Spice Heaven
            </Link>

            <p className="mt-1 text-sm text-gray-500">
              Restaurant administration
            </p>
          </div>

          <Link
            href="/menu"
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            View customer site
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
            Logout
            </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Page heading */}
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Dashboard
          </h1>

          <p className="mt-1 text-gray-600">
            Manage today's restaurant orders.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}


<div className="mb-4">
  <input
    type="search"
    value={searchTerm}
    onChange={(event) => setSearchTerm(event.target.value)}
    placeholder="Search by name, phone or order ID..."
    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
  />
</div>

<div className="mb-6 overflow-x-auto">
  <div className="flex min-w-max gap-2">
    {[
      { value: "ALL", label: "All orders" },
      { value: "PENDING", label: "Pending" },
      { value: "ACCEPTED", label: "Accepted" },
      { value: "PREPARING", label: "Preparing" },
      { value: "READY", label: "Ready" },
      { value: "OUT_FOR_DELIVERY", label: "Out for delivery" },
      { value: "COMPLETED", label: "Completed" },
      { value: "CANCELLED", label: "Cancelled" },
    ].map((filter) => (
      <button
        key={filter.value}
        type="button"
        onClick={() =>
          setStatusFilter(filter.value as StatusFilter)
        }
        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
          statusFilter === filter.value
            ? "bg-orange-600 text-white"
            : "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-orange-50"
        }`}
      >
        {filter.label}
      </button>
    ))}
  </div>
</div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Today's orders
            </p>

            <p className="mt-2 text-3xl font-extrabold text-gray-900">
              {todaysOrders.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Pending
            </p>

            <p className="mt-2 text-3xl font-extrabold text-orange-600">
              {pendingOrders.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Preparing
            </p>

            <p className="mt-2 text-3xl font-extrabold text-blue-600">
              {preparingOrders.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Today's revenue
            </p>

            <p className="mt-2 text-3xl font-extrabold text-green-600">
              £{todaysRevenue.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Orders */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Orders
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Latest orders appear first.
              </p>
            </div>

            <button
              type="button"
              onClick={loadOrders}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="mt-5 rounded-2xl bg-white p-10 text-center shadow-sm">
              <p className="font-semibold text-gray-600">
                Loading orders...
              </p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
              <p className="text-lg font-semibold text-gray-900">
              No matching orders
              </p>
          
              <p className="mt-2 text-sm text-gray-500">
              Try changing the search or status filter.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {filteredOrders.map((order) => {
                const next =
                  getNextStatus(order);

                return (
                  <article
                    key={order.id}
                    className="rounded-2xl bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      {/* Order information */}
                      <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
  <div>
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={`rounded-full px-3 py-1 text-xs font-bold ${
          order.status === "CANCELLED"
            ? "bg-red-100 text-red-700"
            : order.status === "COMPLETED"
              ? "bg-green-100 text-green-700"
              : "bg-orange-100 text-orange-700"
        }`}
      >
        {statusLabels[order.status]}
      </span>

      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
        {order.orderType === "DELIVERY"
          ? "🚗 Delivery"
          : "🏪 Collection"}
      </span>
    </div>

    <h3 className="mt-3 text-xl font-extrabold text-gray-900">
      {order.customerName}
    </h3>

    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
      <span>📞 {order.customerPhone}</span>

      {order.customerEmail && (
        <span>{order.customerEmail}</span>
      )}
    </div>

    <p className="mt-2 text-xs text-gray-400">
      {new Date(order.createdAt).toLocaleString("en-GB")}
    </p>
  </div>

  <div className="text-left sm:text-right">
    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
      Order
    </p>

    <p className="mt-1 break-all text-sm font-bold text-gray-700">
      #{order.id}
    </p>
  </div>
</div>

                        {/* Items */}
                        <div className="mt-6 border-t border-gray-100 pt-5">
  <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">
    Order items
  </p>

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

                              <span className="font-semibold text-gray-900">
                                £
                                {item.subtotal.toFixed(
                                  2,
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                        </div>

                        {/* Address */}
                        {order.orderType ===
                          "DELIVERY" &&
                          order.deliveryAddress && (
                            <div className="mt-5 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                              <p className="font-semibold text-gray-900">
                                Delivery address
                              </p>

                              <p className="mt-1">
                                {
                                  order.deliveryAddress
                                    .addressLine1
                                }
                              </p>

                              {order
                                .deliveryAddress
                                .addressLine2 && (
                                <p>
                                  {
                                    order
                                      .deliveryAddress
                                      .addressLine2
                                  }
                                </p>
                              )}

                              <p>
                                {
                                  order.deliveryAddress
                                    .city
                                }
                              </p>

                              <p>
                                {
                                  order.deliveryAddress
                                    .postcode
                                }
                              </p>
                            </div>
                          )}

                        {/* Notes */}
                        {order.customerNotes && (
                          <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                            <span className="font-bold">
                              Note:
                            </span>{" "}
                            {order.customerNotes}
                          </div>
                        )}
                      </div>

                      {/* Right side */}
                      <div className="w-full shrink-0 lg:w-56">
                        <div className="rounded-xl bg-gray-50 p-4">
                          <div className="flex justify-between text-sm">

                          <div className="mb-4 border-b border-gray-200 pb-4">
  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
    Payment
  </p>

  <p className="mt-1 text-sm font-semibold text-gray-800">
    {order.paymentMethod === "CARD"
      ? "💳 Card"
      : "💵 Cash"}
  </p>
</div>
                            <span className="text-gray-500">
                              Subtotal
                            </span>

                            <span className="font-semibold">
                              £
                              {order.subtotal.toFixed(
                                2,
                              )}
                            </span>
                          </div>

                          <div className="mt-2 flex justify-between text-sm">
                            <span className="text-gray-500">
                              Delivery
                            </span>

                            <span className="font-semibold">
                              {order.deliveryFee === 0
                                ? "FREE"
                                : `£${order.deliveryFee.toFixed(
                                    2,
                                  )}`}
                            </span>
                          </div>

                          <div className="mt-3 border-t border-gray-200 pt-3">
                            <div className="flex justify-between">
                              <span className="font-bold">
                                Total
                              </span>

                              <span className="font-extrabold text-orange-600">
                                £
                                {order.total.toFixed(
                                  2,
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {next && (
                          <button
                            type="button"
                            disabled={
                              updatingOrderId ===
                              order.id
                            }
                            onClick={() =>
                              handleStatusUpdate(
                                order.id,
                                next,
                              )
                            }
                            className="mt-3 w-full rounded-xl bg-orange-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-orange-300"
                          >
                            {updatingOrderId ===
                            order.id
                              ? "Updating..."
                              : `Mark as ${statusLabels[next]}`}
                          </button>                          
                        )}
                        {!["COMPLETED", "CANCELLED"].includes(order.status) && (
  <button
  type="button"
  disabled={updatingOrderId === order.id}
  onClick={() => handleCancelOrder(order.id)}
  className="mt-3 w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
>
  Cancel order
</button>
)}

                        {order.status ===
                          "COMPLETED" && (
                          <div className="mt-3 rounded-xl bg-green-50 px-4 py-3 text-center text-sm font-bold text-green-700">
                            ✓ Order completed
                          </div>
                        )}      

                        {order.status ===
                          "CANCELLED" && (
                          <div className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-bold text-red-700">
                            Order cancelled
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}