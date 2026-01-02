import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import productsRouter from "./routes/products.js";
import { connectDB, dbState } from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  const state = dbState();
  const stateText = ["disconnected", "connected", "connecting", "disconnecting"][state] || "unknown";
  res.json({ status: "ok", db: stateText });
});

app.use("/api/products", productsRouter);

const start = async () => {
  await connectDB(MONGO_URI);
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
};

start();
