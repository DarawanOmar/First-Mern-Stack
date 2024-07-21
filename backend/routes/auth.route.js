import express from "express";
import {
  getMe,
  Login,
  Logout,
  Register,
} from "../controller/auth.contoller.js";
import protectRoute from "../middleware/protectedRoute.js";

const router = express.Router();

router.get("/profile", protectRoute, getMe);

router.post("/login", Login);

router.post("/register", Register);

router.post("/logout", Logout);

export default router;
