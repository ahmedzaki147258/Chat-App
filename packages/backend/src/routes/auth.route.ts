import express from "express";
import { authenticateAccessToken, authenticateRefreshToken } from "src/middlewares";
import { getCurrentUser, googleCallback, googleFailure, loginUser, logoutUser, refreshToken, registerUser } from "src/controllers/auth.controller";
import passport from "../config/passport";

const router: express.Router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/refresh-token", authenticateRefreshToken, refreshToken);
router.get("/me", getCurrentUser);
router.get("/logout", authenticateAccessToken, logoutUser);

// Initiate Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/google/failure" }),
  googleCallback
);

// Google OAuth failure
router.get("/google/failure", googleFailure);

export default router;