
import pool from "../config/mysql.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// =========================
// REGISTER USER
// =========================

export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, phone and password."
      });
    }

    if (name.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 3 characters long."
      });
    }

    if (!/^[6-9][0-9]{9}$/.test(phone.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid 10-digit Indian mobile number."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [existingUsers] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [normalizedEmail]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await pool.execute(
      `INSERT INTO users (name, email, phone, password)
       VALUES (?, ?, ?, ?)`,
      [name.trim(), normalizedEmail, phone.trim(), hashedPassword]
    );

    const userId = result.insertId;
    const token = generateToken(userId);

    return res.status(201).json({
      success: true,
      message: "Account created successfully!",
      token,
      user: {
        id: userId,
        name: name.trim(),
        email: normalizedEmail,
        phone: phone.trim()
      }
    });

  } catch (error) {
    console.error("Registration Error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists."
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create account."
    });
  }
};

// =========================
// LOGIN USER
// =========================

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [users] = await pool.execute(
      `SELECT id, name, email, phone, password
       FROM users
       WHERE email = ?`,
      [normalizedEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const user = users[0];

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const token = generateToken(user.id);

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to login."
    });
  }
};

// =========================
// UPDATE USER PROFILE
// =========================

export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email and phone."
      });
    }

    if (typeof name !== "string" || name.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 3 characters long."
      });
    }

    if (typeof email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address."
      });
    }

    if (typeof phone !== "string" ||
        !/^[6-9][0-9]{9}$/.test(phone.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid 10-digit Indian mobile number."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [existingUsers] = await pool.execute(
      "SELECT id FROM users WHERE email = ? AND id != ?",
      [normalizedEmail, req.user.id]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered."
      });
    }

    await pool.execute(
      `UPDATE users
       SET name = ?, email = ?, phone = ?
       WHERE id = ?`,
      [name.trim(), normalizedEmail, phone.trim(), req.user.id]
    );

    const [users] = await pool.execute(
      "SELECT id, name, email, phone FROM users WHERE id = ?",
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      user: users[0]
    });

  } catch (error) {
    console.error("Update Profile Error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "This email is already registered."
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update profile."
    });
  }
};

// =========================
// CHANGE PASSWORD
// =========================

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new password."
      });
    }

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long."
      });
    }

    const [users] = await pool.execute(
      "SELECT password FROM users WHERE id = ?",
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      users[0].password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect."
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await pool.execute(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: "Password changed successfully!"
    });

  } catch (error) {
    console.error("Change Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to change password."
    });
  }
};

