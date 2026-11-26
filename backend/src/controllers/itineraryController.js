
import pool from "../config/mysql.js";

// Check whether a day belongs to the logged-in user's trip
const verifyDayOwnership = async (tripId, dayId, userId) => {
  const [rows] = await pool.execute(
    `SELECT d.id
     FROM itinerary_days d
     INNER JOIN trips t ON d.trip_id = t.id
     WHERE d.id = ? AND t.id = ? AND t.user_id = ?`,
    [dayId, tripId, userId]
  );

  return rows.length > 0;
};


// Check whether a day is marked as a rest day
const checkRestDay = async (dayId) => {
  const [rows] = await pool.execute(
    `SELECT is_rest_day
     FROM itinerary_days
     WHERE id = ?`,
    [dayId]
  );

  return rows.length > 0 && Boolean(rows[0].is_rest_day);
};


// Parse interests safely
const parseInterests = (value) => {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }

  return [];
};


// Calculate activity priority
const getActivityScore = (activity, interests, travelStyle) => {
  let score = 0;

  const category = activity.category;
  const selectedInterests = interests || [];

  if (selectedInterests.includes(category)) {
    score += 10;
  }

  if (
    category === "Culture" &&
    selectedInterests.includes("Sightseeing")
  ) {
    score += 7;
  }

  if (
    category === "Nature" &&
    selectedInterests.includes("Photography")
  ) {
    score += 5;
  }

  const stylePreferences = {
    Adventure: ["Adventure"],
    Relaxation: ["Nature", "Food"],
    Family: ["Nature", "Sightseeing", "Culture"],
    Romantic: ["Nature", "Food"],
    Solo: ["Sightseeing", "Adventure"],
    Luxury: ["Nature", "Food"]
  };

  const preferredCategories = stylePreferences[travelStyle] || [];

  if (preferredCategories.includes(category)) {
    score += 4;
  }

  return score;
};


// Calculate activity end time
const calculateEndTime = (startHour, durationMinutes) => {
  const totalMinutes = startHour * 60 + durationMinutes;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
};


// Generate smart itinerary
export const generateItinerary = async (req, res) => {
  let connection;

  try {
    const tripId = Number(req.params.tripId);

    if (!Number.isSafeInteger(tripId) || tripId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID."
      });
    }

    const [trips] = await pool.execute(
      `SELECT
        id,
        destination_id,
        DATE_FORMAT(start_date, '%Y-%m-%d') AS start_date,
        DATE_FORMAT(end_date, '%Y-%m-%d') AS end_date,
        budget,
        travellers,
        travel_style,
        CAST(interests AS CHAR) AS interests_json
       FROM trips
       WHERE id = ? AND user_id = ?`,
      [tripId, req.user.id]
    );

    if (trips.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Trip not found."
      });
    }

    const trip = trips[0];

    const startDate = new Date(`${trip.start_date}T00:00:00Z`);
    const endDate = new Date(`${trip.end_date}T00:00:00Z`);

    const totalDays =
      Math.round((endDate - startDate) / 86400000) + 1;

    if (!Number.isFinite(totalDays) || totalDays < 1 || totalDays > 60) {
      return res.status(400).json({
        success: false,
        message: "Trip duration must be between 1 and 60 days."
      });
    }

    const interests = parseInterests(trip.interests_json);

    const [availableActivities] = await pool.execute(
      `SELECT
        id,
        destination_id,
        title,
        description,
        location,
        estimated_cost,
        duration_minutes,
        category
       FROM destination_activities
       WHERE destination_id = ?
       ORDER BY id ASC`,
      [trip.destination_id]
    );

    if (availableActivities.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No activities are available for this destination yet."
      });
    }

    const rankedActivities = availableActivities
      .map((activity) => ({
        ...activity,
        estimated_cost: Number(activity.estimated_cost || 0),
        duration_minutes: Number(activity.duration_minutes || 60),
        score: getActivityScore(
          activity,
          interests,
          trip.travel_style
        )
      }))
      .sort((a, b) => b.score - a.score);

    connection = await pool.getConnection();

    await connection.beginTransaction();

    const [existingDays] = await connection.execute(
      `SELECT id, day_number
       FROM itinerary_days
       WHERE trip_id = ?
       ORDER BY day_number ASC`,
      [tripId]
    );

    const existingDayNumbers = new Set(
      existingDays.map((day) => Number(day.day_number))
    );

    // Create missing itinerary days
    for (let index = 0; index < totalDays; index++) {
      const dayNumber = index + 1;

      if (existingDayNumbers.has(dayNumber)) continue;

      const currentDate = new Date(startDate);
      currentDate.setUTCDate(currentDate.getUTCDate() + index);

      const formattedDate = currentDate.toISOString().slice(0, 10);

      await connection.execute(
        `INSERT INTO itinerary_days
         (trip_id, day_number, day_date, title, description)
         VALUES (?, ?, ?, ?, ?)`,
        [
          tripId,
          dayNumber,
          formattedDate,
          `Day ${dayNumber}`,
          "Explore your destination at your own pace."
        ]
      );
    }

    const [days] = await connection.execute(
      `SELECT id, day_number, is_rest_day
       FROM itinerary_days
       WHERE trip_id = ?
       ORDER BY day_number ASC`,
      [tripId]
    );

    // Collect existing activity titles to prevent duplicate suggestions
    const [existingActivities] = await connection.execute(
      `SELECT a.title
       FROM itinerary_activities a
       INNER JOIN itinerary_days d ON a.day_id = d.id
       WHERE d.trip_id = ?`,
      [tripId]
    );

    const usedTitles = new Set(
      existingActivities.map((activity) =>
        activity.title.trim().toLowerCase()
      )
    );

    const remainingActivities = rankedActivities.filter(
      (activity) =>
        !usedTitles.has(activity.title.trim().toLowerCase())
    );

    let activitiesAdded = 0;

    // Fill days with up to two activities
    for (const day of days) {
      if (Boolean(day.is_rest_day)) continue;

      const [activityRows] = await connection.execute(
        `SELECT COUNT(*) AS total
         FROM itinerary_activities
         WHERE day_id = ?`,
        [day.id]
      );

      const currentCount = Number(activityRows[0].total);
      const availableSlots = Math.max(0, 2 - currentCount);

      if (availableSlots === 0) continue;

      const selectedActivities = remainingActivities.splice(
        0,
        availableSlots
      );

      for (let index = 0; index < selectedActivities.length; index++) {
        const activity = selectedActivities[index];

        const activityNumber = currentCount + index;
        const startHour = activityNumber === 0 ? 9 : 14;

        const startTime =
          `${String(startHour).padStart(2, "0")}:00:00`;

        const endTime = calculateEndTime(
          startHour,
          activity.duration_minutes
        );

        await connection.execute(
          `INSERT INTO itinerary_activities
          (
            day_id,
            title,
            description,
            location,
            start_time,
            end_time,
            estimated_cost,
            sort_order
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            day.id,
            activity.title,
            activity.description,
            activity.location,
            startTime,
            endTime,
            activity.estimated_cost,
            currentCount + index + 1
          ]
        );

        usedTitles.add(activity.title.trim().toLowerCase());
        activitiesAdded++;
      }

      if (selectedActivities.length > 0) {
        await connection.execute(
          `UPDATE itinerary_days
           SET description = ?
           WHERE id = ?`,
          [
            "Explore your suggested activities and enjoy your day.",
            day.id
          ]
        );
      }
    }

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: activitiesAdded > 0
        ? "Smart itinerary generated successfully!"
        : "No additional activities are available for the remaining days.",
      totalDays: days.length,
      activitiesAdded,
      remainingSuggestions: remainingActivities.length
    });

  } catch (error) {
    if (connection) await connection.rollback();

    console.error("Generate Itinerary Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to generate itinerary."
    });

  } finally {
    if (connection) connection.release();
  }
};


// Get complete itinerary
export const getItinerary = async (req, res) => {
  try {
    const tripId = Number(req.params.tripId);

    if (!Number.isSafeInteger(tripId) || tripId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID."
      });
    }

    const [trips] = await pool.execute(
      "SELECT id FROM trips WHERE id = ? AND user_id = ?",
      [tripId, req.user.id]
    );

    if (trips.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Trip not found."
      });
    }

    const [days] = await pool.execute(
      `SELECT
        id,
        trip_id,
        day_number,
        DATE_FORMAT(day_date, '%Y-%m-%d') AS day_date,
        title,
        description,
        is_rest_day
       FROM itinerary_days
       WHERE trip_id = ?
       ORDER BY day_number ASC`,
      [tripId]
    );

    const [activities] = await pool.execute(
      `SELECT
        a.id,
        a.day_id,
        a.title,
        a.description,
        a.location,
        a.start_time,
        a.end_time,
        a.estimated_cost,
        a.sort_order
       FROM itinerary_activities a
       INNER JOIN itinerary_days d ON a.day_id = d.id
       WHERE d.trip_id = ?
       ORDER BY d.day_number ASC, a.sort_order ASC`,
      [tripId]
    );

    const itinerary = days.map((day) => ({
      ...day,
      is_rest_day: Boolean(day.is_rest_day),
      activities: activities
        .filter((activity) => Number(activity.day_id) === Number(day.id))
        .map((activity) => ({
          ...activity,
          estimated_cost: Number(activity.estimated_cost || 0)
        }))
    }));

    return res.status(200).json({
      success: true,
      count: itinerary.length,
      itinerary
    });

  } catch (error) {
    console.error("Get Itinerary Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch itinerary."
    });
  }
};


// Get all available activities for a trip's destination
export const getDestinationActivities = async (req, res) => {
  try {
    const tripId = Number(req.params.tripId);

    if (!Number.isSafeInteger(tripId) || tripId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID."
      });
    }

    const [trips] = await pool.execute(
      `SELECT destination_id
       FROM trips
       WHERE id = ? AND user_id = ?`,
      [tripId, req.user.id]
    );

    if (trips.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Trip not found."
      });
    }

    const [activities] = await pool.execute(
      `SELECT
        id,
        title,
        description,
        location,
        estimated_cost,
        duration_minutes,
        category
       FROM destination_activities
       WHERE destination_id = ?
       ORDER BY category ASC, title ASC`,
      [trips[0].destination_id]
    );

    return res.status(200).json({
      success: true,
      count: activities.length,
      activities: activities.map((activity) => ({
        ...activity,
        estimated_cost: Number(activity.estimated_cost || 0),
        duration_minutes: Number(activity.duration_minutes || 60)
      }))
    });

  } catch (error) {
    console.error("Get Destination Activities Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch destination activities."
    });
  }
};


// Mark or unmark a day as a rest day
export const updateRestDay = async (req, res) => {
  let connection;

  try {
    const tripId = Number(req.params.tripId);
    const dayId = Number(req.params.dayId);
    const { isRestDay } = req.body;

    if (
      !Number.isSafeInteger(tripId) || tripId <= 0 ||
      !Number.isSafeInteger(dayId) || dayId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip or day ID."
      });
    }

    if (typeof isRestDay !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isRestDay must be true or false."
      });
    }

    const isOwner = await verifyDayOwnership(
      tripId,
      dayId,
      req.user.id
    );

    if (!isOwner) {
      return res.status(404).json({
        success: false,
        message: "Itinerary day not found."
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Clear all activities when a day becomes a rest day
    if (isRestDay) {
      await connection.execute(
        `DELETE FROM itinerary_activities
         WHERE day_id = ?`,
        [dayId]
      );
    }

    await connection.execute(
      `UPDATE itinerary_days
       SET is_rest_day = ?
       WHERE id = ?`,
      [isRestDay, dayId]
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: isRestDay
        ? "Rest day enabled and activities cleared successfully!"
        : "Rest day removed successfully!",
      isRestDay
    });

  } catch (error) {
    if (connection) await connection.rollback();

    console.error("Update Rest Day Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update rest day."
    });

  } finally {
    if (connection) connection.release();
  }
};


// Calculate estimated activity cost for a trip
export const getItineraryCost = async (req, res) => {
  try {
    const tripId = Number(req.params.tripId);

    if (!Number.isSafeInteger(tripId) || tripId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID."
      });
    }

    const [trips] = await pool.execute(
      `SELECT id, budget, travellers
       FROM trips
       WHERE id = ? AND user_id = ?`,
      [tripId, req.user.id]
    );

    if (trips.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Trip not found."
      });
    }

    const [costRows] = await pool.execute(
      `SELECT
        COALESCE(SUM(a.estimated_cost), 0) AS activity_cost,
        COUNT(a.id) AS activity_count
       FROM itinerary_activities a
       INNER JOIN itinerary_days d ON a.day_id = d.id
       WHERE d.trip_id = ?`,
      [tripId]
    );

    const budget = Number(trips[0].budget);
    const estimatedActivityCost = Number(costRows[0].activity_cost);
    const remainingBudget = budget - estimatedActivityCost;

    return res.status(200).json({
      success: true,
      budget,
      estimatedActivityCost,
      remainingBudget,
      activityCount: Number(costRows[0].activity_count),
      withinBudget: remainingBudget >= 0
    });

  } catch (error) {
    console.error("Get Itinerary Cost Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to calculate itinerary cost."
    });
  }
};


// Add a new activity
export const addActivity = async (req, res) => {
  try {
    const tripId = Number(req.params.tripId);
    const dayId = Number(req.params.dayId);

    const {
      title,
      description,
      location,
      startTime,
      endTime,
      estimatedCost
    } = req.body;

    if (
      !Number.isSafeInteger(tripId) || tripId <= 0 ||
      !Number.isSafeInteger(dayId) || dayId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip or day ID."
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Activity title is required."
      });
    }

    const cost = Number(estimatedCost ?? 0);

    if (!Number.isFinite(cost) || cost < 0) {
      return res.status(400).json({
        success: false,
        message: "Estimated cost must be valid and non-negative."
      });
    }

    const isOwner = await verifyDayOwnership(
      tripId,
      dayId,
      req.user.id
    );

    if (!isOwner) {
      return res.status(404).json({
        success: false,
        message: "Itinerary day not found."
      });
    }

    if (await checkRestDay(dayId)) {
      return res.status(400).json({
        success: false,
        message: "Activities cannot be added to a rest day."
      });
    }

    const [orderRows] = await pool.execute(
      `SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order
       FROM itinerary_activities
       WHERE day_id = ?`,
      [dayId]
    );

    const [result] = await pool.execute(
      `INSERT INTO itinerary_activities
       (
         day_id, title, description, location,
         start_time, end_time, estimated_cost, sort_order
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dayId,
        title.trim(),
        description?.trim() || null,
        location?.trim() || null,
        startTime || null,
        endTime || null,
        cost,
        orderRows[0].next_order
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Activity added successfully!",
      activityId: result.insertId
    });

  } catch (error) {
    console.error("Add Activity Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add activity."
    });
  }
};


// Edit an activity
export const updateActivity = async (req, res) => {
  try {
    const tripId = Number(req.params.tripId);
    const dayId = Number(req.params.dayId);
    const activityId = Number(req.params.activityId);

    const {
      title,
      description,
      location,
      startTime,
      endTime,
      estimatedCost
    } = req.body;

    if (
      !Number.isSafeInteger(tripId) || tripId <= 0 ||
      !Number.isSafeInteger(dayId) || dayId <= 0 ||
      !Number.isSafeInteger(activityId) || activityId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID provided."
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Activity title is required."
      });
    }

    const cost = Number(estimatedCost ?? 0);

    if (!Number.isFinite(cost) || cost < 0) {
      return res.status(400).json({
        success: false,
        message: "Estimated cost must be valid and non-negative."
      });
    }

    const isOwner = await verifyDayOwnership(
      tripId,
      dayId,
      req.user.id
    );

    if (!isOwner) {
      return res.status(404).json({
        success: false,
        message: "Itinerary day not found."
      });
    }

    if (await checkRestDay(dayId)) {
      return res.status(400).json({
        success: false,
        message: "Activities cannot be edited on a rest day."
      });
    }

    const [result] = await pool.execute(
      `UPDATE itinerary_activities
       SET
         title = ?,
         description = ?,
         location = ?,
         start_time = ?,
         end_time = ?,
         estimated_cost = ?
       WHERE id = ? AND day_id = ?`,
      [
        title.trim(),
        description?.trim() || null,
        location?.trim() || null,
        startTime || null,
        endTime || null,
        cost,
        activityId,
        dayId
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Activity not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Activity updated successfully!"
    });

  } catch (error) {
    console.error("Update Activity Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update activity."
    });
  }
};


// Delete an activity
export const deleteActivity = async (req, res) => {
  try {
    const tripId = Number(req.params.tripId);
    const dayId = Number(req.params.dayId);
    const activityId = Number(req.params.activityId);

    if (
      !Number.isSafeInteger(tripId) || tripId <= 0 ||
      !Number.isSafeInteger(dayId) || dayId <= 0 ||
      !Number.isSafeInteger(activityId) || activityId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID provided."
      });
    }

    const isOwner = await verifyDayOwnership(
      tripId,
      dayId,
      req.user.id
    );

    if (!isOwner) {
      return res.status(404).json({
        success: false,
        message: "Itinerary day not found."
      });
    }

    const [result] = await pool.execute(
      `DELETE FROM itinerary_activities
       WHERE id = ? AND day_id = ?`,
      [activityId, dayId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Activity not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Activity deleted successfully!"
    });

  } catch (error) {
    console.error("Delete Activity Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete activity."
    });
  }
};
