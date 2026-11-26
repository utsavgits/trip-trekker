
import pool from "../config/mysql.js";

// Format MySQL trip row for frontend
const formatTrip = (row) => {
  return {
    _id: row.id,
    user: row.user_id,
    destination: {
      id: row.destination_id,
      name: row.destination_name,
      state: row.destination_state
    },
    startDate: row.start_date,
    endDate: row.end_date,
    travellers: row.travellers,
    budget: Number(row.budget),
    travelStyle: row.travel_style,
    interests: row.interests_json
      ? JSON.parse(row.interests_json)
      : [],
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

// Reusable query for trip details
const tripSelectQuery = `
  SELECT
    t.id,
    t.user_id,
    t.destination_id,
    d.name AS destination_name,
    d.state AS destination_state,
    t.start_date,
    t.end_date,
    t.travellers,
    t.budget,
    t.travel_style,
    CAST(t.interests AS CHAR) AS interests_json,
    t.status,
    t.created_at,
    t.updated_at
  FROM trips t
  INNER JOIN destinations d ON t.destination_id = d.id
`;

// =========================
// CREATE NEW TRIP
// =========================

export const createTrip = async (req, res) => {
  try {
    const {
      destinationId,
      startDate,
      endDate,
      travellers,
      budget,
      travelStyle,
      interests
    } = req.body;

    const destination = Number(destinationId);
    const travellerCount = Number(travellers);
    const tripBudget = Number(budget);

    if (
      !Number.isSafeInteger(destination) ||
      destination <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid destination."
      });
    }

    if (
      !startDate ||
      !endDate ||
      !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(endDate) ||
      endDate < startDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid travel dates."
      });
    }

    if (
      !Number.isInteger(travellerCount) ||
      travellerCount < 1 ||
      travellerCount > 10
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid number of travellers."
      });
    }

    if (!Number.isFinite(tripBudget) || tripBudget <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid trip budget."
      });
    }

    const validStyles = [
      "Adventure",
      "Relaxation",
      "Family",
      "Romantic",
      "Solo",
      "Luxury"
    ];

    if (!validStyles.includes(travelStyle)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid travel style."
      });
    }

    if (
      !Array.isArray(interests) ||
      interests.some((interest) => typeof interest !== "string")
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid trip interests."
      });
    }

    const validInterests = [
      "Adventure",
      "Nature",
      "Photography",
      "Food",
      "Sightseeing"
    ];

    if (interests.some((interest) => !validInterests.includes(interest))) {
      return res.status(400).json({
        success: false,
        message: "One or more selected interests are invalid."
      });
    }

    const [destinationRows] = await pool.execute(
      "SELECT id FROM destinations WHERE id = ?",
      [destination]
    );

    if (destinationRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Selected destination was not found."
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO trips
       (user_id, destination_id, start_date, end_date,
        travellers, budget, travel_style, interests)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        destination,
        startDate,
        endDate,
        travellerCount,
        tripBudget,
        travelStyle,
        JSON.stringify(interests)
      ]
    );

    const [rows] = await pool.execute(
      `${tripSelectQuery} WHERE t.id = ? AND t.user_id = ?`,
      [result.insertId, req.user.id]
    );

    return res.status(201).json({
      success: true,
      message: "Trip created successfully!",
      trip: formatTrip(rows[0])
    });

  } catch (error) {
    console.error("Create Trip Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create trip."
    });
  }
};


// =========================
// GET MY TRIPS
// =========================

export const getMyTrips = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `${tripSelectQuery}
       WHERE t.user_id = ?
       ORDER BY t.created_at DESC`,
      [req.user.id]
    );

    const trips = rows.map(formatTrip);

    return res.status(200).json({
      success: true,
      count: trips.length,
      trips
    });

  } catch (error) {
    console.error("Fetch Trips Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch trips."
    });
  }
};


// =========================
// GET SINGLE TRIP
// =========================

export const getTripDetails = async (req, res) => {
  try {
    const tripId = Number(req.params.id);

    if (!Number.isSafeInteger(tripId) || tripId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID."
      });
    }

    const [rows] = await pool.execute(
      `${tripSelectQuery}
       WHERE t.id = ? AND t.user_id = ?`,
      [tripId, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Trip not found."
      });
    }

    return res.status(200).json({
      success: true,
      trip: formatTrip(rows[0])
    });

  } catch (error) {
    console.error("Trip Details Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch trip details."
    });
  }
};


// =========================
// DELETE TRIP
// =========================

export const deleteTrip = async (req, res) => {
  try {
    const tripId = Number(req.params.id);

    if (!Number.isSafeInteger(tripId) || tripId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID."
      });
    }

    const [result] = await pool.execute(
      "DELETE FROM trips WHERE id = ? AND user_id = ?",
      [tripId, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Trip not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Trip deleted successfully!"
    });

  } catch (error) {
    console.error("Delete Trip Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete trip."
    });
  }
};
