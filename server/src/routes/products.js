import { Router } from "express";
import { Product } from "../models/Product.js";
import { dbState } from "../config/db.js";
import crypto from "crypto";

const router = Router();
const memory = [];

router.get("/", async (req, res) => {
  try {
    if (dbState() !== 1) {
      return res.json(memory.slice(0, 20));
    } else {
      const products = await Product.find().limit(20).lean();
      return res.json(products);
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.post("/", async (req, res) => {
  console.log("POST /api/products body:", req.body);
  try {
    if (dbState() !== 1) {
      const body = req.body || {};
      const item = {
        _id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        name: body.name || "",
        price: Number(body.price) || 0,
        description: body.description || "",
        image: body.image || "",
        stock: Number(body.stock) || 0,
        active: body.active !== undefined ? !!body.active : true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (!item.name || item.price === undefined || item.price < 0) {
        return res.status(400).json({ 
          error: "Invalid product data",
          debug: {
            body: req.body,
            item: item,
            checks: {
              name: !item.name,
              priceUndef: item.price === undefined,
              priceNeg: item.price < 0
            }
          }
        });
      }
      memory.unshift(item);
      console.log("Created in memory:", item);
      return res.status(201).json(item);
    } else {
      const created = await Product.create(req.body);
      return res.status(201).json(created);
    }
  } catch (err) {
    console.error("Create error:", err);
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (dbState() !== 1) {
      const idx = memory.findIndex((m) => m._id === id);
      if (idx === -1) return res.status(404).json({ error: "Product not found" });
      const updated = { ...memory[idx], ...req.body, updatedAt: new Date().toISOString() };
      memory[idx] = updated;
      return res.json(updated);
    } else {
      const updated = await Product.findByIdAndUpdate(id, req.body, { new: true });
      if (!updated) return res.status(404).json({ error: "Product not found" });
      return res.json(updated);
    }
  } catch (err) {
    res.status(400).json({ error: "Failed to update" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (dbState() !== 1) {
      const idx = memory.findIndex((m) => m._id === id);
      if (idx === -1) return res.status(404).json({ error: "Product not found" });
      const [deleted] = memory.splice(idx, 1);
      return res.json(deleted);
    } else {
      const deleted = await Product.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: "Product not found" });
      return res.json(deleted);
    }
  } catch (err) {
    res.status(400).json({ error: "Failed to delete" });
  }
});

export default router;
