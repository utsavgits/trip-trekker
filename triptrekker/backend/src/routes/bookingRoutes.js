
import express from "express";

import {
  createBooking,
  getMyBookings,
  getBookingDetails,
  cancelBooking
} from "../controllers/bookingController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create new booking
router.post("/", protect, createBooking);

// Get logged-in user's bookings
router.get("/my-bookings", protect, getMyBookings);

// Get single booking details
router.get("/:id", protect, getBookingDetails);

// Cancel booking
router.patch("/:id/cancel", protect, cancelBooking);

export default router;
