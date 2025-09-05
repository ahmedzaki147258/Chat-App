import 'dotenv/config';
import cookieParser from "cookie-parser";
import express, { Request, Response } from 'express';
import { formatDate } from '@/shared/utils/format';
import { authRoutes, userRoutes } from './routes';
import { connectDB } from './config/database';

const app: express.Application = express();
const PORT: number = Number(process.env.PORT);
app.use(cookieParser());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send(`<h1>🚀 Chat API is running at ${formatDate(new Date())}</h1>`);
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});