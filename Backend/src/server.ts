import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pino } from "pino";

import { openAPIRouter } from "@/api-docs/openAPIRouter";
import { userRouter } from "@/api/admin/user/userRouter";
import { healthCheckRouter } from "@/api/healthCheck/healthCheckRouter";
import errorHandler from "@/common/middleware/errorHandler";
import rateLimiter from "@/common/middleware/rateLimiter";
import requestLogger from "@/common/middleware/requestLogger";
import { env } from "@/common/utils/envConfig";
import { authRouter } from "./api/auth/authRouter";
import { messageRouter } from "./api/admin/messages/messagesRouter";
import { roomsRouter } from "./api/admin/rooms/roomsRouter";
import { adminStoriesRouter } from "./api/admin/stories/storiesRouter";
import { handleSocketConnections } from "./socket/socket.handler";
import { Server as SocketIOServer } from "socket.io";
import http from "http";
import { uploadsRouter } from "./api/uploads/uploadsRouter";
import { filesRouter } from "./api/admin/files/filesRouter";
import { storiesRouter } from "./api/stories/storiesRouter";

const logger = pino({ name: "server start" });
const app: Express = express();
const server = http.createServer(app);

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(rateLimiter);

// Request logging
app.use(requestLogger);

// Routes
app.use("/health-check", healthCheckRouter);
app.use("/users", userRouter);
app.use("/auth", authRouter);
app.use("/upload", uploadsRouter);
app.use("/stories", storiesRouter);
app.use("/admin/messages", messageRouter);
app.use("/admin/rooms", roomsRouter);
app.use("/admin/stories", adminStoriesRouter);
app.use("/admin/files", filesRouter);

const io = new SocketIOServer(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// Handle socket connections
handleSocketConnections(io);

// Swagger UI
app.use(openAPIRouter);

// Error handlers
app.use(errorHandler());

export { app, logger };
