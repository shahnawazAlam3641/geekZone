import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./config/database";

import authRoutes from "./routes/auth";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    // origin: "*",
    credentials: true,
  })
);

const PORT = process.env.PORT || 3001;

app.get("/api/v1/check", (req, res) => {
  console.log("Backend is alive");
  res.send("Backend is alive");
});

app.use("/api/v1/auth", authRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
  });
});
