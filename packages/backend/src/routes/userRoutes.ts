import express from "express";
import { getUsers } from "src/controllers/userController";

const router: express.Router = express.Router();

router.get("/users", getUsers);

export default router;