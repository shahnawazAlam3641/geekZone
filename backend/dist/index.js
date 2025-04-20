"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const database_1 = require("./config/database");
const auth_1 = __importDefault(require("./routes/auth"));
const post_1 = __importDefault(require("./routes/post"));
const user_1 = __importDefault(require("./routes/user"));
const conversation_1 = __importDefault(require("./routes/conversation"));
const message_1 = __importDefault(require("./routes/message"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    },
});
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    // origin: "*",
    credentials: true,
}));
app.use((req, res, next) => {
    req.io = io;
    next();
});
const PORT = process.env.PORT || 3001;
app.get("/api/v1/check", (req, res) => {
    console.log("Backend is alive");
    res.send("Backend is alive");
});
app.use("/api/v1/auth", auth_1.default);
app.use("/api/v1/posts", post_1.default);
app.use("/api/v1/users", user_1.default);
app.use("/api/v1/conversation", conversation_1.default);
app.use("/api/v1/message", message_1.default);
io.on("connection", (socket) => {
    console.log("A user connected");
    socket.on("join-room", ({ conversationId }) => {
        console.log(conversationId);
        socket.join(conversationId);
    });
    socket.on("leave-room", ({ conversationId }) => {
        console.log(conversationId);
        socket.leave(conversationId);
    });
    socket.on("send-message", ({ conversationId, message, }) => {
        console.log({ conversationId, message });
        io.to(conversationId).emit("receive-message", message);
    });
    socket.on("typing", ({ conversationId, username, }) => {
        socket.to(conversationId).emit("user-typing", { username });
    });
    socket.on("stop-typing", ({ conversationId, username, }) => {
        socket.to(conversationId).emit("user-stop-typing", { username });
    });
    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});
(0, database_1.connectDB)().then(() => {
    httpServer.listen(PORT, () => {
        console.log(`Server running on PORT ${PORT}`);
    });
});
