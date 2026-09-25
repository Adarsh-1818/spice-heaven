const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000/api";

export type ApiAuth =
  | "admin"
  | "customer"
  | "none";

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
  auth: ApiAuth = "none",
): Promise<T> {
  let token: string | null = null;

  if (typeof window !== "undefined") {
    if (auth === "admin") {
      token = localStorage.getItem(
        "spice_haven_admin_token",
      );
    }

    if (auth === "customer") {
      token = localStorage.getItem(
        "spice_haven_customer_token",
      );
    }
  }

  const headers = new Headers(options?.headers);

  headers.set(
    "Content-Type",
    "application/json",
  );

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`,
    );
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers,
    },
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({
        message: "Something went wrong",
      }));

    if (
      typeof window !== "undefined" &&
      response.status === 401 &&
      token
    ) {
      if (auth === "admin") {
        localStorage.removeItem(
          "spice_haven_admin_token",
        );

        localStorage.removeItem(
          "spice_haven_admin_user",
        );

        if (
          window.location.pathname.startsWith(
            "/admin",
          )
        ) {
          window.location.href =
            "/admin/login";
        }
      }

      if (auth === "customer") {
        localStorage.removeItem(
          "spice_haven_customer_token",
        );

        localStorage.removeItem(
          "spice_haven_customer_user",
        );

        if (
          window.location.pathname === "/login"
        ) {
          window.location.href = "/login";
        }
      }
    }

    throw new Error(
      error.message ??
        "API request failed",
    );
  }

  return response.json();
}