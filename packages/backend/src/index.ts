import 'dotenv/config';
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "./config/passport";
import { connectDB } from './config/database';
import express, { Request, Response } from 'express';
import { formatDate } from '@/shared/utils/format';
import { authRoutes, userRoutes } from './routes';

const app: express.Application = express();
const PORT: number = Number(process.env.PORT);
const corsOption = { origin: process.env.CLIENT_URL, credentials: true }
app.use(cookieParser());
app.use(express.json());
app.use(cors(corsOption));
app.use(passport.initialize());

app.get('/', (req: Request, res: Response) => {
  res.send(`<h1>🚀 Chat API is running at ${formatDate(new Date())}</h1>`);
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});