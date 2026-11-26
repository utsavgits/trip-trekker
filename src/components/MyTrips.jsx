
import { useEffect, useState } from "react";
import {
  MapPin,
  CalendarDays,
  Users,
  Wallet,
  Compass,
  LoaderCircle,
  ArrowUpRight,
  CalendarCheck,
  ChevronDown,
  ChevronUp,
  Route,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Clock,
  BookOpen,
  Coffee,
  CheckCircle2,
  RotateCcw
} from "lucide-react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

const emptyActivityForm = {
  title: "",
  description: "",
  location: "",
  startTime: "",
  endTime: "",
  estimatedCost: "0"
};

function MyTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [itineraries, setItineraries] = useState({});
  const [expandedTripId, setExpandedTripId] = useState(null);

  const [actionLoading, setActionLoading] = useState(null);
  const [actionMessages, setActionMessages] = useState({});

  const [activityForms, setActivityForms] = useState({});
  const [editingActivities, setEditingActivities] = useState({});
  const [showActivityForms, setShowActivityForms] = useState({});

  const [destinationActivities, setDestinationActivities] = useState({});
  const [showActivityLibrary, setShowActivityLibrary] = useState({});
  const [activityCosts, setActivityCosts] = useState({});

  const getToken = () => (
    localStorage.getItem("tripTrekkerToken") ||
    sessionStorage.getItem("tripTrekkerToken")
  );

  const getHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json"
  });

  useEffect(() => {
    const fetchTrips = async () => {
      const token = getToken();

      if (!token) {
        setError("Please login to view your trips.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/trips`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load your trips.");
        }

        setTrips(Array.isArray(data.trips) ? data.trips : []);

      } catch (err) {
        console.error("My Trips Error:", err);
        setError(err.message || "Unable to connect to server.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const formatDate = (date) => {
    if (!date) return "Not available";

    const datePart = String(date).slice(0, 10);
    const parsedDate = new Date(`${datePart}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const loadItinerary = async (tripId) => {
    const response = await fetch(
      `${API_URL}/itinerary/${tripId}`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to load itinerary.");
    }

    setItineraries((previous) => ({
      ...previous,
      [tripId]: data.itinerary || []
    }));

    setExpandedTripId(tripId);

    return data.itinerary || [];
  };

  // Load estimated activity cost
  const loadActivityCost = async (tripId) => {
    try {
      const response = await fetch(
        `${API_URL}/itinerary/${tripId}/cost`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load estimated cost.");
      }

      setActivityCosts((previous) => ({
        ...previous,
        [tripId]: data
      }));

    } catch (err) {
      console.error("Activity Cost Error:", err);
    }
  };

  // Load destination activity library
  const loadActivityLibrary = async (tripId) => {
    try {
      const response = await fetch(
        `${API_URL}/itinerary/${tripId}/activities`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load activities.");
      }

      setDestinationActivities((previous) => ({
        ...previous,
        [tripId]: data.activities || []
      }));

    } catch (err) {
      console.error("Activity Library Error:", err);

      setActionMessages((previous) => ({
        ...previous,
        [tripId]: err.message
      }));
    }
  };

  const refreshTripData = async (tripId) => {
    await Promise.all([
      loadItinerary(tripId),
      loadActivityCost(tripId)
    ]);
  };

  const handleGenerateItinerary = async (tripId) => {
    setActionLoading(tripId);

    setActionMessages((previous) => ({
      ...previous,
      [tripId]: ""
    }));

    try {
      const response = await fetch(
        `${API_URL}/itinerary/${tripId}/generate`,
        {
          method: "POST",
          headers: getHeaders()
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to generate itinerary.");
      }

      await refreshTripData(tripId);

      setActionMessages((previous) => ({
        ...previous,
        [tripId]: data.message ||
          `Itinerary generated! ${data.activitiesAdded || 0} activities added.`
      }));

    } catch (err) {
      console.error("Generate Itinerary Error:", err);

      setActionMessages((previous) => ({
        ...previous,
        [tripId]: err.message
      }));
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewItinerary = async (tripId) => {
    if (expandedTripId === tripId) {
      setExpandedTripId(null);
      return;
    }

    setActionLoading(tripId);

    try {
      await Promise.all([
        loadItinerary(tripId),
        loadActivityCost(tripId),
        loadActivityLibrary(tripId)
      ]);

      setActionMessages((previous) => ({
        ...previous,
        [tripId]: ""
      }));

    } catch (err) {
      setActionMessages((previous) => ({
        ...previous,
        [tripId]: err.message
      }));
    } finally {
      setActionLoading(null);
    }
  };

  // Open add form
  const openAddForm = (dayId) => {
    setEditingActivities((previous) => ({
      ...previous,
      [dayId]: null
    }));

    setActivityForms((previous) => ({
      ...previous,
      [dayId]: { ...emptyActivityForm }
    }));

    setShowActivityForms((previous) => ({
      ...previous,
      [dayId]: true
    }));
  };

  // Open edit form
  const openEditForm = (dayId, activity) => {
    setEditingActivities((previous) => ({
      ...previous,
      [dayId]: activity.id
    }));

    setActivityForms((previous) => ({
      ...previous,
      [dayId]: {
        title: activity.title || "",
        description: activity.description || "",
        location: activity.location || "",
        startTime: activity.start_time
          ? String(activity.start_time).slice(0, 5)
          : "",
        endTime: activity.end_time
          ? String(activity.end_time).slice(0, 5)
          : "",
        estimatedCost: String(activity.estimated_cost ?? 0)
      }
    }));

    setShowActivityForms((previous) => ({
      ...previous,
      [dayId]: true
    }));
  };

  const closeActivityForm = (dayId) => {
    setShowActivityForms((previous) => ({
      ...previous,
      [dayId]: false
    }));

    setEditingActivities((previous) => ({
      ...previous,
      [dayId]: null
    }));
  };

  const updateActivityForm = (dayId, field, value) => {
    setActivityForms((previous) => ({
      ...previous,
      [dayId]: {
        ...(previous[dayId] || emptyActivityForm),
        [field]: value
      }
    }));
  };

  // Add or update an activity
  const handleActivitySubmit = async (event, tripId, dayId) => {
    event.preventDefault();

    const form = activityForms[dayId] || emptyActivityForm;
    const editingId = editingActivities[dayId];

    if (!form.title.trim()) {
      setActionMessages((previous) => ({
        ...previous,
        [tripId]: "Please enter an activity name."
      }));
      return;
    }

    if (
      form.startTime &&
      form.endTime &&
      form.endTime <= form.startTime
    ) {
      setActionMessages((previous) => ({
        ...previous,
        [tripId]: "End time must be later than start time."
      }));
      return;
    }

    const cost = Number(form.estimatedCost);

    if (!Number.isFinite(cost) || cost < 0) {
      setActionMessages((previous) => ({
        ...previous,
        [tripId]: "Please enter a valid estimated cost."
      }));
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      startTime: form.startTime || null,
      endTime: form.endTime || null,
      estimatedCost: cost
    };

    const url = editingId
      ? `${API_URL}/itinerary/${tripId}/days/${dayId}/activities/${editingId}`
      : `${API_URL}/itinerary/${tripId}/days/${dayId}/activities`;

    setActionLoading(`${dayId}-activity`);

    try {
      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save activity.");
      }

      closeActivityForm(dayId);

      await refreshTripData(tripId);

      setActionMessages((previous) => ({
        ...previous,
        [tripId]: data.message
      }));

    } catch (err) {
      console.error("Save Activity Error:", err);

      setActionMessages((previous) => ({
        ...previous,
        [tripId]: err.message
      }));
    } finally {
      setActionLoading(null);
    }
  };

  // Delete activity
  const handleDeleteActivity = async (tripId, dayId, activityId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this activity?"
    );

    if (!confirmed) return;

    setActionLoading(`${dayId}-activity`);

    try {
      const response = await fetch(
        `${API_URL}/itinerary/${tripId}/days/${dayId}/activities/${activityId}`,
        {
          method: "DELETE",
          headers: getHeaders()
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to delete activity.");
      }

      await refreshTripData(tripId);

      setActionMessages((previous) => ({
        ...previous,
        [tripId]: data.message
      }));

    } catch (err) {
      console.error("Delete Activity Error:", err);

      setActionMessages((previous) => ({
        ...previous,
        [tripId]: err.message
      }));
    } finally {
      setActionLoading(null);
    }
  };

  // Add a library activity directly to a selected day
  const handleAddLibraryActivity = async (tripId, dayId, activity) => {
    setActionLoading(`${dayId}-library`);

    try {
      const response = await fetch(
        `${API_URL}/itinerary/${tripId}/days/${dayId}/activities`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            title: activity.title,
            description: activity.description,
            location: activity.location,
            estimatedCost: Number(activity.estimated_cost || 0)
          })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to add selected activity.");
      }

      await refreshTripData(tripId);

      setActionMessages((previous) => ({
        ...previous,
        [tripId]: `${activity.title} added to your itinerary.`
      }));

    } catch (err) {
      console.error("Add Library Activity Error:", err);

      setActionMessages((previous) => ({
        ...previous,
        [tripId]: err.message
      }));
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle the activity library
  const toggleActivityLibrary = (dayId) => {
    setShowActivityLibrary((previous) => ({
      ...previous,
      [dayId]: !previous[dayId]
    }));
  };

  // Enable or disable a rest day
  const handleRestDayToggle = async (tripId, day) => {
    const nextValue = !Boolean(day.is_rest_day);

    setActionLoading(`${day.id}-rest`);

    try {
      const response = await fetch(
        `${API_URL}/itinerary/${tripId}/days/${day.id}/rest`,
        {
          method: "PATCH",
          headers: getHeaders(),
          body: JSON.stringify({
            isRestDay: nextValue
          })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update rest day.");
      }

      await loadItinerary(tripId);

      setActionMessages((previous) => ({
        ...previous,
        [tripId]: data.message
      }));

    } catch (err) {
      console.error("Rest Day Error:", err);

      setActionMessages((previous) => ({
        ...previous,
        [tripId]: err.message
      }));
    } finally {
      setActionLoading(null);
    }
  };

  const fieldStyle = {
    width: "100%",
    padding: "11px 12px",
    border: "1px solid #dbe3e8",
    borderRadius: "8px",
    fontSize: "13px",
    boxSizing: "border-box",
    outlineColor: "#176b5b"
  };

  const labelStyle = {
    display: "block",
    marginBottom: "6px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#475569"
  };

  const primaryButtonStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    padding: "10px 15px",
    border: "none",
    borderRadius: "8px",
    background: "#176b5b",
    color: "#ffffff",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "13px"
  };

  const secondaryButtonStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    padding: "9px 13px",
    border: "1px solid #dbe3e8",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#475569",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "12px"
  };

  if (loading) {
    return (
      <section className="dashboard-section">
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "12px",
          padding: "40px",
          color: "#64748b"
        }}>
          <LoaderCircle size={22} className="animate-spin" />
          Loading your trips...
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-section">
      <div className="section-heading">
        <div>
          <span className="dashboard-eyebrow">
            YOUR PERSONAL JOURNEYS
          </span>
          <h2>My Planned Trips</h2>
        </div>

        <Link to="/trip-planner" className="dashboard-primary-btn">
          Plan New Trip <ArrowUpRight size={17} />
        </Link>
      </div>

      {error && (
        <div style={{
          padding: "14px 16px",
          background: "#fff1f0",
          color: "#c0392b",
          borderRadius: "10px"
        }}>
          {error}
        </div>
      )}

      {!error && trips.length === 0 && (
        <div className="empty-dashboard-card">
          <div className="empty-dashboard-icon">
            <Compass size={30} />
          </div>

          <h3>No trips planned yet</h3>

          <p>
            Your next adventure is waiting.
            Create your first trip and start planning!
          </p>

          <Link to="/trip-planner" className="dashboard-outline-btn">
            Create Your First Trip <ArrowUpRight size={17} />
          </Link>
        </div>
      )}

      {trips.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
          gap: "20px"
        }}>
          {trips.map((trip) => {
            const tripId = trip.id ?? trip._id;
            const isExpanded = expandedTripId === tripId;
            const itinerary = itineraries[tripId] || [];
            const costData = activityCosts[tripId];

            return (
              <article
                key={tripId}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "16px",
                  padding: "22px",
                  boxShadow: "0 5px 20px rgba(0,0,0,0.04)",
                  gridColumn: isExpanded ? "1 / -1" : "auto"
                }}
              >
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "16px"
                }}>
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "#176b5b",
                    background: "#eaf5f1",
                    padding: "7px 11px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "700"
                  }}>
                    <Compass size={14} />
                    {trip.travelStyle}
                  </span>

                  <span style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#087e50",
                    background: "#ecfdf5",
                    padding: "6px 10px",
                    borderRadius: "20px",
                    textTransform: "capitalize"
                  }}>
                    {trip.status}
                  </span>
                </div>

                <h3 style={{
                  fontSize: "21px",
                  margin: "0 0 5px",
                  color: "#172b3a"
                }}>
                  {trip.destination?.name || "Unknown Destination"}
                </h3>

                <p style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  color: "#64748b",
                  fontSize: "13px",
                  margin: "0 0 20px"
                }}>
                  <MapPin size={14} />
                  {trip.destination?.state || "India"}
                </p>

                <div style={{
                  display: "grid",
                  gap: "14px",
                  borderTop: "1px solid #edf0f2",
                  paddingTop: "17px"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                  }}>
                    <CalendarDays size={18} color="#176b5b" />
                    <div>
                      <p style={{
                        margin: 0,
                        color: "#94a3b8",
                        fontSize: "11px"
                      }}>
                        Travel Dates
                      </p>
                      <strong style={{ fontSize: "13px" }}>
                        {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                      </strong>
                    </div>
                  </div>

                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                  }}>
                    <Users size={18} color="#176b5b" />
                    <div>
                      <p style={{
                        margin: 0,
                        color: "#94a3b8",
                        fontSize: "11px"
                      }}>
                        Travellers
                      </p>
                      <strong style={{ fontSize: "13px" }}>
                        {trip.travellers} Person(s)
                      </strong>
                    </div>
                  </div>

                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                  }}>
                    <Wallet size={18} color="#176b5b" />
                    <div>
                      <p style={{
                        margin: 0,
                        color: "#94a3b8",
                        fontSize: "11px"
                      }}>
                        Planned Budget
                      </p>
                      <strong style={{
                        fontSize: "17px",
                        color: "#087e70"
                      }}>
                        ₹{Number(trip.budget || 0).toLocaleString("en-IN")}
                      </strong>
                    </div>
                  </div>
                </div>

                {Array.isArray(trip.interests) &&
                  trip.interests.length > 0 && (
                    <div style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "7px",
                      marginTop: "18px"
                    }}>
                      {trip.interests.map((interest) => (
                        <span
                          key={interest}
                          style={{
                            background: "#f1f5f9",
                            color: "#475569",
                            padding: "6px 9px",
                            borderRadius: "7px",
                            fontSize: "11px"
                          }}
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  )}

                <div style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginTop: "22px"
                }}>
                  <button
                    onClick={() => handleGenerateItinerary(tripId)}
                    disabled={actionLoading === tripId}
                    style={{
                      ...primaryButtonStyle,
                      opacity: actionLoading === tripId ? 0.7 : 1
                    }}
                  >
                    {actionLoading === tripId
                      ? <LoaderCircle size={17} className="animate-spin" />
                      : <CalendarCheck size={17} />}
                    Generate Itinerary
                  </button>

                  <button
                    onClick={() => handleViewItinerary(tripId)}
                    disabled={actionLoading === tripId}
                    style={secondaryButtonStyle}
                  >
                    <Route size={17} />
                    {isExpanded ? "Hide Itinerary" : "View Itinerary"}
                    {isExpanded
                      ? <ChevronUp size={16} />
                      : <ChevronDown size={16} />}
                  </button>
                </div>

                {actionMessages[tripId] && (
                  <p style={{
                    margin: "12px 0 0",
                    color: (
                      actionMessages[tripId].toLowerCase().includes("unable") ||
                      actionMessages[tripId].toLowerCase().includes("error") ||
                      actionMessages[tripId].toLowerCase().includes("must be")
                    ) ? "#c0392b" : "#087e50",
                    fontSize: "13px"
                  }}>
                    {actionMessages[tripId]}
                  </p>
                )}

                {isExpanded && (
                  <div style={{
                    marginTop: "24px",
                    paddingTop: "22px",
                    borderTop: "1px solid #e2e8f0"
                  }}>
                    <h3 style={{
                      color: "#172b3a",
                      margin: "0 0 20px",
                      fontSize: "19px"
                    }}>
                      <Route
                        size={20}
                        style={{
                          display: "inline",
                          verticalAlign: "middle",
                          marginRight: "8px",
                          color: "#176b5b"
                        }}
                      />
                      Your Day-wise Itinerary
                    </h3>

                    {/* Estimated activity cost */}
                    {costData && (
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                        gap: "12px",
                        marginBottom: "22px"
                      }}>
                        <div style={{
                          padding: "16px",
                          background: "#f0fdf9",
                          border: "1px solid #d1fae5",
                          borderRadius: "10px"
                        }}>
                          <p style={{
                            color: "#64748b",
                            fontSize: "12px",
                            margin: "0 0 6px"
                          }}>
                            Planned Budget
                          </p>
                          <strong style={{ color: "#176b5b", fontSize: "18px" }}>
                            ₹{Number(costData.budget).toLocaleString("en-IN")}
                          </strong>
                        </div>

                        <div style={{
                          padding: "16px",
                          background: "#eff6ff",
                          border: "1px solid #dbeafe",
                          borderRadius: "10px"
                        }}>
                          <p style={{
                            color: "#64748b",
                            fontSize: "12px",
                            margin: "0 0 6px"
                          }}>
                            Activity Cost Estimate
                          </p>
                          <strong style={{ color: "#1d4ed8", fontSize: "18px" }}>
                            ₹{Number(costData.estimatedActivityCost).toLocaleString("en-IN")}
                          </strong>
                        </div>

                        <div style={{
                          padding: "16px",
                          background: costData.withinBudget ? "#f0fdf4" : "#fff1f2",
                          border: `1px solid ${costData.withinBudget ? "#bbf7d0" : "#fecdd3"}`,
                          borderRadius: "10px"
                        }}>
                          <p style={{
                            color: "#64748b",
                            fontSize: "12px",
                            margin: "0 0 6px"
                          }}>
                            {costData.withinBudget ? "Remaining Budget" : "Over Budget"}
                          </p>
                          <strong style={{
                            color: costData.withinBudget ? "#15803d" : "#be123c",
                            fontSize: "18px"
                          }}>
                            ₹{Math.abs(Number(costData.remainingBudget)).toLocaleString("en-IN")}
                          </strong>
                        </div>
                      </div>
                    )}

                    <p style={{
                      color: "#94a3b8",
                      fontSize: "11px",
                      margin: "-10px 0 20px"
                    }}>
                      Activity costs are estimates only, not confirmed booking prices.
                    </p>

                    {itinerary.length === 0 ? (
                      <p style={{
                        color: "#64748b",
                        fontSize: "14px"
                      }}>
                        No itinerary days found. Generate your itinerary first.
                      </p>
                    ) : (
                      <div style={{
                        display: "grid",
                        gap: "16px"
                      }}>
                        {itinerary.map((day) => {
                          const dayId = day.id;
                          const form = activityForms[dayId] || emptyActivityForm;
                          const isEditing = Boolean(editingActivities[dayId]);
                          const isFormVisible = showActivityForms[dayId];
                          const isSaving = actionLoading === `${dayId}-activity`;
                          const isRestLoading = actionLoading === `${dayId}-rest`;
                          const isLibraryLoading = actionLoading === `${dayId}-library`;
                          const libraryVisible = showActivityLibrary[dayId];
                          const dayActivities = day.activities || [];

                          const usedActivityIds = new Set(
                            itinerary.flatMap((item) =>
                              (item.activities || []).map((activity) => activity.id)
                            )
                          );

                          return (
                            <div
                              key={dayId}
                              style={{
                                padding: "20px",
                                background: day.is_rest_day ? "#fffaf0" : "#f8fafc",
                                border: `1px solid ${day.is_rest_day ? "#f5d9a8" : "#e2e8f0"}`,
                                borderRadius: "12px"
                              }}
                            >
                              <div style={{
                                display: "flex",
                                flexWrap: "wrap",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: "12px"
                              }}>
                                <div>
                                  <strong style={{
                                    color: day.is_rest_day ? "#a16207" : "#176b5b",
                                    fontSize: "16px"
                                  }}>
                                    Day {day.day_number}: {day.title || "Travel Day"}
                                  </strong>

                                  <p style={{
                                    color: "#64748b",
                                    fontSize: "12px",
                                    margin: "6px 0 0"
                                  }}>
                                    <CalendarDays
                                      size={13}
                                      style={{
                                        display: "inline",
                                        verticalAlign: "middle",
                                        marginRight: "5px"
                                      }}
                                    />
                                    {formatDate(day.day_date)}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleRestDayToggle(tripId, day)}
                                  disabled={isRestLoading}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "7px",
                                    padding: "9px 12px",
                                    border: `1px solid ${day.is_rest_day ? "#d97706" : "#dbe3e8"}`,
                                    borderRadius: "8px",
                                    background: day.is_rest_day ? "#fef3c7" : "#ffffff",
                                    color: day.is_rest_day ? "#92400e" : "#475569",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    cursor: "pointer"
                                  }}
                                >
                                  {isRestLoading
                                    ? <LoaderCircle size={15} className="animate-spin" />
                                    : <Coffee size={15} />}
                                  {day.is_rest_day ? "Remove Rest Day" : "Mark as Rest Day"}
                                </button>
                              </div>

                              {day.is_rest_day ? (
                                <div style={{
                                  marginTop: "16px",
                                  padding: "18px",
                                  background: "#fffbeb",
                                  borderRadius: "10px",
                                  border: "1px dashed #f0c36d"
                                }}>
                                  <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px"
                                  }}>
                                    <Coffee size={23} color="#a16207" />
                                    <strong style={{ color: "#92400e" }}>
                                      Relax and Recharge!
                                    </strong>
                                  </div>

                                  <p style={{
                                    color: "#92400e",
                                    fontSize: "13px",
                                    margin: "9px 0 0"
                                  }}>
                                    This is your rest day. Your existing activities are saved.
                                    You can still add optional activities if you wish.
                                  </p>
                                </div>
                              ) : (
                                <p style={{
                                  color: "#64748b",
                                  fontSize: "13px",
                                  margin: "10px 0 16px"
                                }}>
                                  {day.description || "Plan your activities for this day."}
                                </p>
                              )}

                              {/* Day activities */}
                              <div style={{
                                display: "grid",
                                gap: "10px",
                                marginTop: "14px"
                              }}>
                                {dayActivities.map((activity) => (
                                  <div
                                    key={activity.id}
                                    style={{
                                      padding: "15px",
                                      background: "#ffffff",
                                      borderRadius: "9px",
                                      border: "1px solid #edf0f2"
                                    }}
                                  >
                                    <div style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      flexWrap: "wrap",
                                      gap: "12px"
                                    }}>
                                      <div style={{ flex: 1 }}>
                                        <strong style={{
                                          color: "#172b3a",
                                          fontSize: "14px"
                                        }}>
                                          {activity.title}
                                        </strong>

                                        {activity.description && (
                                          <p style={{
                                            color: "#64748b",
                                            fontSize: "12px",
                                            margin: "6px 0 0"
                                          }}>
                                            {activity.description}
                                          </p>
                                        )}

                                        {activity.location && (
                                          <p style={{
                                            color: "#64748b",
                                            fontSize: "12px",
                                            margin: "6px 0 0"
                                          }}>
                                            <MapPin size={12} style={{
                                              display: "inline",
                                              verticalAlign: "middle"
                                            }} />{" "}
                                            {activity.location}
                                          </p>
                                        )}

                                        {(activity.start_time || activity.end_time) && (
                                          <p style={{
                                            color: "#64748b",
                                            fontSize: "12px",
                                            margin: "6px 0 0"
                                          }}>
                                            <Clock size={12} style={{
                                              display: "inline",
                                              verticalAlign: "middle"
                                            }} />{" "}
                                            {activity.start_time
                                              ? String(activity.start_time).slice(0, 5)
                                              : "--:--"}
                                            {" – "}
                                            {activity.end_time
                                              ? String(activity.end_time).slice(0, 5)
                                              : "--:--"}
                                          </p>
                                        )}

                                        <p style={{
                                          color: "#087e70",
                                          fontWeight: "600",
                                          fontSize: "12px",
                                          margin: "7px 0 0"
                                        }}>
                                          Estimated Cost: ₹
                                          {Number(activity.estimated_cost || 0).toLocaleString("en-IN")}
                                        </p>
                                      </div>

                                      <div style={{
                                        display: "flex",
                                        gap: "7px",
                                        alignItems: "flex-start"
                                      }}>
                                        <button
                                          type="button"
                                          onClick={() => openEditForm(dayId, activity)}
                                          title="Edit activity"
                                          style={{
                                            padding: "8px",
                                            border: "1px solid #dbe3e8",
                                            background: "#ffffff",
                                            color: "#176b5b",
                                            borderRadius: "7px",
                                            cursor: "pointer"
                                          }}
                                        >
                                          <Pencil size={15} />
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => handleDeleteActivity(
                                            tripId,
                                            dayId,
                                            activity.id
                                          )}
                                          disabled={isSaving}
                                          title="Delete activity"
                                          style={{
                                            padding: "8px",
                                            border: "1px solid #fee2e2",
                                            background: "#fff5f5",
                                            color: "#dc2626",
                                            borderRadius: "7px",
                                            cursor: "pointer"
                                          }}
                                        >
                                          <Trash2 size={15} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}

                                {dayActivities.length === 0 && (
                                  <p style={{
                                    color: "#94a3b8",
                                    fontSize: "13px",
                                    margin: "4px 0"
                                  }}>
                                    No activities added to this day yet.
                                  </p>
                                )}
                              </div>

                              {/* Activity action buttons */}
                              <div style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "9px",
                                marginTop: "15px"
                              }}>
                                <button
                                  type="button"
                                  onClick={() => openAddForm(dayId)}
                                  style={{
                                    ...primaryButtonStyle,
                                    padding: "9px 12px"
                                  }}
                                >
                                  <Plus size={15} />
                                  Add Custom Activity
                                </button>

                                <button
                                  type="button"
                                  onClick={() => toggleActivityLibrary(dayId)}
                                  style={secondaryButtonStyle}
                                >
                                  <BookOpen size={15} />
                                  {libraryVisible ? "Hide Activity Library" : "Choose from Library"}
                                  {libraryVisible
                                    ? <ChevronUp size={14} />
                                    : <ChevronDown size={14} />}
                                </button>
                              </div>

                              {/* Activity library */}
                              {libraryVisible && (
                                <div style={{
                                  marginTop: "16px",
                                  padding: "16px",
                                  background: "#ffffff",
                                  border: "1px solid #dbe3e8",
                                  borderRadius: "10px"
                                }}>
                                  <h4 style={{
                                    margin: "0 0 6px",
                                    color: "#172b3a",
                                    fontSize: "15px"
                                  }}>
                                    <BookOpen
                                      size={17}
                                      style={{
                                        display: "inline",
                                        verticalAlign: "middle",
                                        marginRight: "7px",
                                        color: "#176b5b"
                                      }}
                                    />
                                    Destination Activity Library
                                  </h4>

                                  <p style={{
                                    margin: "0 0 14px",
                                    color: "#64748b",
                                    fontSize: "12px"
                                  }}>
                                    Choose an activity to add it to Day {day.day_number}.
                                    Already scheduled activities are excluded.
                                  </p>

                                  {isLibraryLoading ? (
                                    <LoaderCircle
                                      size={20}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <div style={{
                                      display: "grid",
                                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                                      gap: "10px"
                                    }}>
                                      {(destinationActivities[tripId] || [])
                                        .filter((activity) =>
                                          !usedActivityIds.has(activity.id)
                                        )
                                        .map((activity) => (
                                          <div
                                            key={activity.id}
                                            style={{
                                              padding: "13px",
                                              border: "1px solid #edf0f2",
                                              borderRadius: "9px",
                                              background: "#f8fafc"
                                            }}
                                          >
                                            <strong style={{
                                              display: "block",
                                              color: "#172b3a",
                                              fontSize: "13px"
                                            }}>
                                              {activity.title}
                                            </strong>

                                            <span style={{
                                              display: "inline-block",
                                              marginTop: "6px",
                                              padding: "4px 7px",
                                              borderRadius: "5px",
                                              background: "#eaf5f1",
                                              color: "#176b5b",
                                              fontSize: "10px",
                                              fontWeight: "600"
                                            }}>
                                              {activity.category}
                                            </span>

                                            {activity.location && (
                                              <p style={{
                                                color: "#64748b",
                                                fontSize: "11px",
                                                margin: "7px 0"
                                              }}>
                                                <MapPin size={11} style={{
                                                  display: "inline",
                                                  verticalAlign: "middle"
                                                }} />{" "}
                                                {activity.location}
                                              </p>
                                            )}

                                            <p style={{
                                              color: "#087e70",
                                              fontSize: "12px",
                                              fontWeight: "600",
                                              margin: "7px 0"
                                            }}>
                                              ₹{Number(activity.estimated_cost || 0).toLocaleString("en-IN")}
                                              {" · "}
                                              {activity.duration_minutes} min
                                            </p>

                                            <button
                                              type="button"
                                              disabled={Boolean(actionLoading)}
                                              onClick={() => handleAddLibraryActivity(
                                                tripId,
                                                dayId,
                                                activity
                                              )}
                                              style={{
                                                ...primaryButtonStyle,
                                                width: "100%",
                                                padding: "8px",
                                                fontSize: "12px",
                                                marginTop: "5px",
                                                opacity: actionLoading ? 0.6 : 1
                                              }}
                                            >
                                              <Plus size={14} />
                                              Add to This Day
                                            </button>
                                          </div>
                                        ))}

                                      {(destinationActivities[tripId] || [])
                                        .filter((activity) =>
                                          !usedActivityIds.has(activity.id)
                                        ).length === 0 && (
                                          <p style={{
                                            color: "#64748b",
                                            fontSize: "13px"
                                          }}>
                                            All library activities are already scheduled.
                                          </p>
                                        )}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Custom activity form */}
                              {isFormVisible && (
                                <form
                                  onSubmit={(event) =>
                                    handleActivitySubmit(event, tripId, dayId)
                                  }
                                  style={{
                                    marginTop: "18px",
                                    padding: "18px",
                                    background: "#ffffff",
                                    border: "1px solid #dbe3e8",
                                    borderRadius: "10px"
                                  }}
                                >
                                  <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "18px"
                                  }}>
                                    <h4 style={{
                                      margin: 0,
                                      color: "#172b3a",
                                      fontSize: "15px"
                                    }}>
                                      {isEditing ? "Edit Activity" : "Add New Activity"}
                                    </h4>

                                    <button
                                      type="button"
                                      onClick={() => closeActivityForm(dayId)}
                                      style={{
                                        border: "none",
                                        background: "transparent",
                                        color: "#64748b",
                                        cursor: "pointer"
                                      }}
                                    >
                                      <X size={19} />
                                    </button>
                                  </div>

                                  <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                                    gap: "14px"
                                  }}>
                                    <div>
                                      <label style={labelStyle}>
                                        Activity Name *
                                      </label>
                                      <input
                                        required
                                        value={form.title}
                                        onChange={(event) =>
                                          updateActivityForm(dayId, "title", event.target.value)
                                        }
                                        placeholder="e.g. Visit Solang Valley"
                                        style={fieldStyle}
                                      />
                                    </div>

                                    <div>
                                      <label style={labelStyle}>
                                        Location
                                      </label>
                                      <input
                                        value={form.location}
                                        onChange={(event) =>
                                          updateActivityForm(dayId, "location", event.target.value)
                                        }
                                        placeholder="Enter location"
                                        style={fieldStyle}
                                      />
                                    </div>

                                    <div>
                                      <label style={labelStyle}>
                                        Start Time
                                      </label>
                                      <input
                                        type="time"
                                        value={form.startTime}
                                        onChange={(event) =>
                                          updateActivityForm(dayId, "startTime", event.target.value)
                                        }
                                        style={fieldStyle}
                                      />
                                    </div>

                                    <div>
                                      <label style={labelStyle}>
                                        End Time
                                      </label>
                                      <input
                                        type="time"
                                        value={form.endTime}
                                        onChange={(event) =>
                                          updateActivityForm(dayId, "endTime", event.target.value)
                                        }
                                        style={fieldStyle}
                                      />
                                    </div>

                                    <div>
                                      <label style={labelStyle}>
                                        Estimated Cost (₹)
                                      </label>
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.estimatedCost}
                                        onChange={(event) =>
                                          updateActivityForm(dayId, "estimatedCost", event.target.value)
                                        }
                                        style={fieldStyle}
                                      />
                                    </div>

                                    <div style={{
                                      gridColumn: "1 / -1"
                                    }}>
                                      <label style={labelStyle}>
                                        Description
                                      </label>
                                      <textarea
                                        rows="3"
                                        value={form.description}
                                        onChange={(event) =>
                                          updateActivityForm(dayId, "description", event.target.value)
                                        }
                                        placeholder="Add some details about this activity..."
                                        style={{
                                          ...fieldStyle,
                                          resize: "vertical"
                                        }}
                                      />
                                    </div>
                                  </div>

                                  <div style={{
                                    display: "flex",
                                    gap: "10px",
                                    flexWrap: "wrap",
                                    marginTop: "17px"
                                  }}>
                                    <button
                                      type="submit"
                                      disabled={isSaving}
                                      style={{
                                        ...primaryButtonStyle,
                                        opacity: isSaving ? 0.7 : 1
                                      }}
                                    >
                                      {isSaving
                                        ? <LoaderCircle size={16} className="animate-spin" />
                                        : <Save size={16} />}
                                      {isEditing ? "Update Activity" : "Save Activity"}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => closeActivityForm(dayId)}
                                      style={secondaryButtonStyle}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </form>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default MyTrips;
