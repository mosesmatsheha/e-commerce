const base = import.meta.env.VITE_API_BASE || "";

export async function getProducts() {
  const res = await fetch(`${base}/api/products`);
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

export async function createProduct(body) {
  const res = await fetch(`${base}/api/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    const debug = error.debug ? " Debug: " + JSON.stringify(error.debug) : "";
    throw new Error((error.error || "Failed") + debug);
  }
  return res.json();
}

export async function updateProduct(id, body) {
  const res = await fetch(`${base}/api/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Failed");
  }
  return res.json();
}

export async function deleteProduct(id) {
  const res = await fetch(`${base}/api/products/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Failed");
  }
  return res.json();
}
