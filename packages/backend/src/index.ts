import "dotenv/config";
import cors from "cors";
import next from "next";
import { Server } from "socket.io";
import initSocket from "./sockets";
import { createServer } from "http";
import cookieParser from "cookie-parser";
import passport from "./config/passport.config";
import { setSocketServer } from "./utils/socket";
import { connectDB } from "./config/database.config";
import express, { Request, Response } from "express";
import { authRoutes, userRoutes, chatRoutes } from "./routes";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT);
  const corsOption = { origin: process.env.CLIENT_URL, credentials: true };

  app.use(cookieParser());
  app.use(express.json());
  app.use(cors(corsOption));
  app.use(passport.initialize());

  const server = createServer(app);
  const io = new Server(server, { cors: corsOption });
  setSocketServer(io);
  initSocket(io);

  const nextApp = next({ dev: false, dir: "../frontend" });
  const handle = nextApp.getRequestHandler();
  await nextApp.prepare();

  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/conversations", chatRoutes);
  app.use((req: Request, res: Response) => handle(req, res));

  server.listen(PORT, async () => {
    await connectDB();
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
  });
}

startServer();