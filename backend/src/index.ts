import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./config/database";

import authRoutes from "./routes/auth";
import postRoutes from "./routes/post";
import userRoutes from "./routes/user";
import conversationRoutes from "./routes/conversation";
import messageRoutes from "./routes/message";

import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    // origin: "*",
    credentials: true,
  })
);

app.use((req: Request, res, next) => {
  req.io = io;
  next();
});

const PORT = process.env.PORT || 3001;

app.get("/api/v1/check", (req, res) => {
  console.log("Backend is alive");
  res.send("Backend is alive");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/conversation", conversationRoutes);
app.use("/api/v1/message", messageRoutes);

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join-room", ({ conversationId }: { conversationId: string }) => {
    console.log(conversationId);
    socket.join(conversationId);
  });

  socket.on("leave-room", ({ conversationId }: { conversationId: string }) => {
    console.log(conversationId);
    socket.leave(conversationId);
  });

  socket.on(
    "send-message",
    ({
      conversationId,
      message,
    }: {
      conversationId: string;
      message: string;
    }) => {
      console.log({ conversationId, message });
      io.to(conversationId).emit("receive-message", message);
    }
  );

  socket.on(
    "typing",
    ({
      conversationId,
      username,
    }: {
      conversationId: string;
      username: string;
    }) => {
      socket.to(conversationId).emit("user-typing", { username });
    }
  );

  socket.on(
    "stop-typing",
    ({
      conversationId,
      username,
    }: {
      conversationId: string;
      username: string;
    }) => {
      socket.to(conversationId).emit("user-stop-typing", { username });
    }
  );

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
  });
});
