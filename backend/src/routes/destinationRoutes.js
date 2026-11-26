
import express from "express";

import {
  getDestinations,
  getDestinationById
} from "../controllers/destinationController.js";

const router = express.Router();

// GET all destinations
router.get("/", getDestinations);

// GET destination by ID
router.get("/:id", getDestinationById);

export default router;
