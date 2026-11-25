
import pool from "../config/mysql.js";

// Format MySQL booking row for frontend
const formatBooking = (row) => {
  return {
    _id: row.id,
    bookingId: row.booking_id,
    user: row.user_id,
    type: row.booking_type,
    item: JSON.parse(row.item_json),
    formData: row.form_data_json
      ? JSON.parse(row.form_data_json)
      : {},
    route: row.route,
    status: row.status,
    bookingDate: row.booking_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

// =========================
// CREATE BOOKING
// =========================

export const createBooking = async (req, res) => {
  try {
    const { type, item, formData, route } = req.body;

    const validTypes = [
      "flights",
      "hotels",
      "trains",
      "buses",
      "cabs"
    ];

    if (!type || !validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking type."
      });
    }

    if (
      !item ||
      typeof item !== "object" ||
      Array.isArray(item) ||
      !item.name ||
      !Number.isFinite(Number(item.price)) ||
      Number(item.price) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid booking details."
      });
    }

    if (!route || typeof route !== "string" || !route.trim()) {
      return res.status(400).json({
        success: false,
        message: "Booking route is required."
      });
    }

    const bookingId = `TT${Date.now()}`;

    const [result] = await pool.execute(
      `INSERT INTO bookings
       (booking_id, user_id, booking_type, item, form_data, route, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        bookingId,
        req.user.id,
        type,
        JSON.stringify(item),
        JSON.stringify(formData || {}),
        route.trim(),
        "Confirmed"
      ]
    );

    const [rows] = await pool.execute(
      `SELECT
        id,
        booking_id,
        user_id,
        booking_type,
        CAST(item AS CHAR) AS item_json,
        CAST(form_data AS CHAR) AS form_data_json,
        route,
        status,
        booking_date,
        created_at,
        updated_at
       FROM bookings
       WHERE id = ? AND user_id = ?`,
      [result.insertId, req.user.id]
    );

    const booking = formatBooking(rows[0]);

    return res.status(201).json({
      success: true,
      message: "Booking saved successfully!",
      booking
    });

  } catch (error) {
    console.error("Create Booking Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create booking."
    });
  }
};


// =========================
// GET MY BOOKINGS
// =========================

export const getMyBookings = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT
        id,
        booking_id,
        user_id,
        booking_type,
        CAST(item AS CHAR) AS item_json,
        CAST(form_data AS CHAR) AS form_data_json,
        route,
        status,
        booking_date,
        created_at,
        updated_at
       FROM bookings
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    const bookings = rows.map(formatBooking);

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });

  } catch (error) {
    console.error("Fetch Bookings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch bookings."
    });
  }
};


// =========================
// GET SINGLE BOOKING DETAILS
// =========================

export const getBookingDetails = async (req, res) => {
  try {
    const bookingId = Number(req.params.id);

    if (!Number.isSafeInteger(bookingId) || bookingId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID."
      });
    }

    const [rows] = await pool.execute(
      `SELECT
        id,
        booking_id,
        user_id,
        booking_type,
        CAST(item AS CHAR) AS item_json,
        CAST(form_data AS CHAR) AS form_data_json,
        route,
        status,
        booking_date,
        created_at,
        updated_at
       FROM bookings
       WHERE id = ? AND user_id = ?`,
      [bookingId, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found."
      });
    }

    return res.status(200).json({
      success: true,
      booking: formatBooking(rows[0])
    });

  } catch (error) {
    console.error("Booking Details Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch booking details."
    });
  }
};


// =========================
// CANCEL BOOKING
// =========================

export const cancelBooking = async (req, res) => {
  try {
    const bookingId = Number(req.params.id);

    if (!Number.isSafeInteger(bookingId) || bookingId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID."
      });
    }

    const [result] = await pool.execute(
      `UPDATE bookings
       SET status = 'Cancelled'
       WHERE id = ?
       AND user_id = ?
       AND status = 'Confirmed'`,
      [bookingId, req.user.id]
    );

    if (result.affectedRows === 0) {
      const [rows] = await pool.execute(
        `SELECT status FROM bookings
         WHERE id = ? AND user_id = ?`,
        [bookingId, req.user.id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Booking not found."
        });
      }

      return res.status(400).json({
        success: false,
        message: "This booking is already cancelled."
      });
    }

    const [rows] = await pool.execute(
      `SELECT
        id,
        booking_id,
        user_id,
        booking_type,
        CAST(item AS CHAR) AS item_json,
        CAST(form_data AS CHAR) AS form_data_json,
        route,
        status,
        booking_date,
        created_at,
        updated_at
       FROM bookings
       WHERE id = ? AND user_id = ?`,
      [bookingId, req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully!",
      booking: formatBooking(rows[0])
    });

  } catch (error) {
    console.error("Cancel Booking Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to cancel booking."
    });
  }
};
