
import express from "express";
import {
  searchFlights,
  priceFlight
} from "../controllers/flightController.js";

const router = express.Router();

// Search available flights
router.post("/search", searchFlights);

// Verify selected flight offer price
router.patch("/offers/:offerId/price", priceFlight);

export default router;
