import React, { useEffect, useState } from "react";
import { getProducts, createProduct, updateProduct, deleteProduct } from "./api.js";

export default function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    getProducts()
      .then(setProducts)
      .catch(() => setError("Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const priceNum = parseFloat(form.price);
      if (isNaN(priceNum)) {
        throw new Error("Invalid price");
      }
      if (editingId) {
        const updated = await updateProduct(editingId, { name: form.name, price: priceNum });
        setProducts((p) => p.map((item) => (item._id === editingId ? updated : item)));
        setEditingId(null);
      } else {
        const created = await createProduct({ name: form.name, price: priceNum });
        setProducts((p) => [created, ...p]);
      }
      setForm({ name: "", price: "" });
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save product");
    }
  };

  const onEdit = (p) => {
    setForm({ name: p.name, price: String(p.price) });
    setEditingId(p._id);
  };

  const onCancel = () => {
    setForm({ name: "", price: "" });
    setEditingId(null);
  };

  const onDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await deleteProduct(id);
      setProducts((p) => p.filter((item) => item._id !== id));
    } catch (err) {
      setError("Failed to delete product");
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: "24px auto", padding: 16 }}>
      <h1>E-Commerce</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 8, marginBottom: 24 }}>
        <input
          placeholder="Name"
          name="name"
          value={form.name}
          onChange={onChange}
        />
        <input
          placeholder="Price"
          name="price"
          value={form.price}
          onChange={onChange}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit">{editingId ? "Update" : "Add"} Product</button>
          {editingId && <button type="button" onClick={onCancel}>Cancel</button>}
        </div>
      </form>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      <ul style={{ display: "grid", gap: 8, padding: 0, listStyle: "none" }}>
        {products.map((p) => (
          <li key={p._id || p.name} style={{ border: "1px solid #ddd", padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>{p.name}</strong> - ${p.price}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => onEdit(p)}>Edit</button>
              <button onClick={() => onDelete(p._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
