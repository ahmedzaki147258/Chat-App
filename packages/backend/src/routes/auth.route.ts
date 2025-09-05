import express from "express";
import { authenticateAccessToken, authenticateRefreshToken } from "src/middlewares";
import { loginUser, logoutUser, refreshToken, registerUser } from "src/controllers/auth.controller";

const router: express.Router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/refresh-token", authenticateRefreshToken, refreshToken);
router.get("/logout", authenticateAccessToken, logoutUser);

export default router;