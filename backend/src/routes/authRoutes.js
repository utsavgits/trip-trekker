
import express from "express";

import {
  registerUser,
  loginUser,
  updateProfile,
  changePassword
} from "../controllers/authController.js";

import pool from "../config/mysql.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// =========================
// REGISTER
// =========================

router.post("/register", registerUser);

// =========================
// LOGIN
// =========================

router.post("/login", loginUser);

// =========================
// GET LOGGED-IN USER PROFILE
// =========================

router.get("/me", protect, async (req, res) => {
  try {
    const [users] = await pool.execute(
      `SELECT id, name, email, phone
       FROM users
       WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "User profile fetched successfully.",
      user: users[0]
    });

  } catch (error) {
    console.error("Get Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch user profile."
    });
  }
});

// =========================
// UPDATE PROFILE
// =========================

router.put("/profile", protect, updateProfile);

// =========================
// CHANGE PASSWORD
// =========================

router.put("/change-password", protect, changePassword);

export default router;
