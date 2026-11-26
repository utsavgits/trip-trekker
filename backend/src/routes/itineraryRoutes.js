
import express from "express";

import {
  generateItinerary,
  getItinerary,
  getDestinationActivities,
  getItineraryCost,
  updateRestDay,
  addActivity,
  updateActivity,
  deleteActivity
} from "../controllers/itineraryController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Generate smart itinerary
router.post("/:tripId/generate", protect, generateItinerary);

// Get complete itinerary
router.get("/:tripId", protect, getItinerary);

// Get destination activity library
router.get("/:tripId/activities", protect, getDestinationActivities);

// Get estimated itinerary cost
router.get("/:tripId/cost", protect, getItineraryCost);

// Enable or disable rest day
router.patch(
  "/:tripId/days/:dayId/rest",
  protect,
  updateRestDay
);

// Add activity
router.post(
  "/:tripId/days/:dayId/activities",
  protect,
  addActivity
);

// Update activity
router.put(
  "/:tripId/days/:dayId/activities/:activityId",
  protect,
  updateActivity
);

// Delete activity
router.delete(
  "/:tripId/days/:dayId/activities/:activityId",
  protect,
  deleteActivity
);

export default router;
