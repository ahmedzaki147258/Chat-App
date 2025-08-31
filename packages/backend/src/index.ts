import 'dotenv/config';
import express from 'express';
import { formatDate } from '@/shared/utils/format';
import { connectDB } from './db';
import { userRoutes } from './routes';

const app: express.Application = express();
const PORT: number = Number(process.env.PORT);
app.use(express.json());

app.get('/', (req: express.Request, res: express.Response) => {
  res.send(`<h1>🚀 Chat API is running at ${formatDate(new Date())}</h1>`);
});

app.use("/api", userRoutes);
app.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});