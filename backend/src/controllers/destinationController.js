
import pool from "../config/mysql.js";

// GET ALL DESTINATIONS
export const getDestinations = async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    let query = `
      SELECT
        id,
        name,
        state,
        category,
        description,
        image_url AS image,
        duration,
        price,
        rating,
        highlights
      FROM destinations
      WHERE 1 = 1
    `;

    const values = [];

    // Search by destination name or state
    if (search) {
      query += " AND (name LIKE ? OR state LIKE ?)";
      values.push(`%${search}%`, `%${search}%`);
    }

    // Filter by category
    if (category && category !== "All") {
      query += " AND category = ?";
      values.push(category);
    }

    // Sorting
    if (sort === "price-low") {
      query += " ORDER BY price ASC";
    } else if (sort === "price-high") {
      query += " ORDER BY price DESC";
    } else if (sort === "rating") {
      query += " ORDER BY rating DESC";
    } else {
      query += " ORDER BY id ASC";
    }

    const [destinations] = await pool.query(query, values);

    res.status(200).json({
      success: true,
      count: destinations.length,
      destinations
    });

  } catch (error) {
    console.error("Get Destinations Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch destinations"
    });
  }
};

// GET SINGLE DESTINATION
export const getDestinationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid destination ID"
      });
    }

    const [destinations] = await pool.query(
      `SELECT
        id,
        name,
        state,
        category,
        description,
        image_url AS image,
        duration,
        price,
        rating,
        highlights
       FROM destinations
       WHERE id = ?`,
      [id]
    );

    if (destinations.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Destination not found"
      });
    }

    res.status(200).json({
      success: true,
      destination: destinations[0]
    });

  } catch (error) {
    console.error("Get Destination Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch destination"
    });
  }
};
