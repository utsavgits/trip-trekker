
import express from "express";

import {
  createTrip,
  getMyTrips,
  getTripDetails,
  deleteTrip
} from "../controllers/tripController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a new trip
router.post("/", protect, createTrip);

// Get logged-in user's trips
router.get("/", protect, getMyTrips);

// Get single trip details
router.get("/:id", protect, getTripDetails);

// Delete a trip
router.delete("/:id", protect, deleteTrip);

export default router;
