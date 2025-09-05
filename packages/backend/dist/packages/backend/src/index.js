"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const format_1 = require("@/shared/utils/format");
const routes_1 = require("./routes");
const database_1 = require("./config/database");
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT);
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.send(`<h1>🚀 Chat API is running at ${(0, format_1.formatDate)(new Date())}</h1>`);
});
app.use("/api/auth", routes_1.authRoutes);
app.use("/api/users", routes_1.userRoutes);
app.listen(PORT, async () => {
    await (0, database_1.connectDB)();
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
