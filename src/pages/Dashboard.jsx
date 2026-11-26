
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MyTrips from "../components/MyTrips";

import {
  Plane,
  Hotel,
  Train,
  Bus,
  Car,
  MapPin,
  Heart,
  Wallet,
  CalendarDays,
  ArrowUpRight,
  Compass,
  ArrowRight,
  Ticket,
  CheckCircle2,
  LogOut,
  User,
  LoaderCircle,
  Eye,
  X,
  XCircle
} from "lucide-react";

import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);

  const [authLoading, setAuthLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");

  const [cancellingId, setCancellingId] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingFilter, setBookingFilter] = useState("All");

  const getToken = () => {
    return (
      localStorage.getItem("tripTrekkerToken") ||
      sessionStorage.getItem("tripTrekkerToken")
    );
  };

  // =========================
  // FETCH USER AND BOOKINGS
  // =========================

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = getToken();

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`
      };

      try {
        const [profileResponse, bookingsResponse] = await Promise.all([
          fetch("http://localhost:5000/api/auth/me", {
            method: "GET",
            headers
          }),

          fetch("http://localhost:5000/api/bookings/my-bookings", {
            method: "GET",
            headers
          })
        ]);

        const profileData = await profileResponse.json();
        const bookingsData = await bookingsResponse.json();

        if (
          profileResponse.status === 401 ||
          bookingsResponse.status === 401
        ) {
          handleLogout();
          return;
        }

        if (!profileResponse.ok || !profileData.success) {
          throw new Error(
            profileData.message || "Unable to load your profile."
          );
        }

        setUser(profileData.user);

        const storage = localStorage.getItem("tripTrekkerToken")
          ? localStorage
          : sessionStorage;

        storage.setItem(
          "tripTrekkerUser",
          JSON.stringify(profileData.user)
        );

        if (!bookingsResponse.ok || !bookingsData.success) {
          throw new Error(
            bookingsData.message || "Unable to load your bookings."
          );
        }

        setBookings(
          Array.isArray(bookingsData.bookings)
            ? bookingsData.bookings
            : []
        );

      } catch (error) {
        console.error("Dashboard Fetch Error:", error);

        setProfileError(
          error.message || "Unable to connect to the server."
        );

      } finally {
        setAuthLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("tripTrekkerToken");
    localStorage.removeItem("tripTrekkerUser");

    sessionStorage.removeItem("tripTrekkerToken");
    sessionStorage.removeItem("tripTrekkerUser");

    navigate("/login", { replace: true });
  };

  // =========================
  // QUICK ACTIONS
  // =========================

  const quickActions = [
    { name: "Flights", icon: Plane, path: "/flights" },
    { name: "Hotels", icon: Hotel, path: "/hotels" },
    { name: "Trains", icon: Train, path: "/trains" },
    { name: "Buses", icon: Bus, path: "/buses" },
    { name: "Cabs", icon: Car, path: "/cabs" },
    { name: "Explore", icon: Compass, path: "/explore" }
  ];

  // =========================
  // BOOKING CALCULATIONS
  // =========================

  const activeBookings = bookings.filter(
    (booking) => booking.status !== "Cancelled"
  );

  const cancelledBookings = bookings.filter(
    (booking) => booking.status === "Cancelled"
  );

  const totalBudget = activeBookings.reduce(
    (total, booking) =>
      total + Number(booking.item?.price || 0),
    0
  );

  const overview = [
    {
      title: "My Trips",
      value: activeBookings.length,
      detail: "Active booking records",
      icon: CalendarDays
    },
    {
      title: "My Bookings",
      value: bookings.length,
      detail: "Total booking records",
      icon: Ticket
    },
    {
      title: "Wishlist",
      value: "0",
      detail: "Saved destinations",
      icon: Heart
    },
    {
      title: "Travel Budget",
      value: `₹${totalBudget.toLocaleString("en-IN")}`,
      detail: "Active booking amount",
      icon: Wallet
    }
  ];

  const bookingIcons = {
    flights: Plane,
    hotels: Hotel,
    trains: Train,
    buses: Bus,
    cabs: Car
  };

  // =========================
  // FORMAT BOOKING DATE
  // =========================

  const formatDate = (date) => {
    if (!date) return "Date not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  // =========================
  // VIEW BOOKING DETAILS
  // =========================

  const handleViewDetails = async (bookingId) => {
    const token = getToken();

    if (!token) {
      handleLogout();
      return;
    }

    setDetailsLoading(true);
    setBookingError("");
    setSelectedBooking(null);

    try {
      const response = await fetch(
        `http://localhost:5000/api/bookings/${bookingId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        handleLogout();
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load booking details."
        );
      }

      setSelectedBooking(data.booking);

    } catch (error) {
      setBookingError(error.message);

    } finally {
      setDetailsLoading(false);
    }
  };

  // =========================
  // CANCEL BOOKING
  // =========================

  const handleCancelBooking = async (booking) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel booking ${booking.bookingId}?`
    );

    if (!confirmed) return;

    const token = getToken();

    if (!token) {
      handleLogout();
      return;
    }

    setCancellingId(booking._id);
    setBookingError("");
    setBookingMessage("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/bookings/${booking._id}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        handleLogout();
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to cancel booking."
        );
      }

      // Update booking status without refreshing the page
      setBookings((previousBookings) =>
        previousBookings.map((item) =>
          item._id === booking._id
            ? { ...item, status: "Cancelled" }
            : item
        )
      );

      // Update details popup if it is open
      setSelectedBooking((previous) =>
        previous && previous._id === booking._id
          ? { ...previous, status: "Cancelled" }
          : previous
      );

      setBookingMessage(
        `Booking ${booking.bookingId} cancelled successfully.`
      );

    } catch (error) {
      setBookingError(error.message);

    } finally {
      setCancellingId(null);
    }
  };

  // =========================
  // FILTER BOOKINGS
  // =========================

  const filteredBookings = bookings.filter((booking) => {
    if (bookingFilter === "Confirmed") {
      return booking.status !== "Cancelled";
    }

    if (bookingFilter === "Cancelled") {
      return booking.status === "Cancelled";
    }

    return true;
  });

  // =========================
  // LOADING SCREEN
  // =========================

  if (authLoading) {
    return (
      <div
        className="dashboard-page"
        style={{
          minHeight: "70vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: "12px"
        }}
      >
        <LoaderCircle size={35} className="animate-spin" />
        <p>Loading your travel dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">

        {/* HEADER */}
        <header className="dashboard-header">
          <div>
            <span className="dashboard-eyebrow">
              TRIPTREKKER / DASHBOARD
            </span>

            <h1>
              Welcome, {user?.name || "Traveller"}! <span>✈</span>
            </h1>

            <p>
              Your next adventure is just a few clicks away.
            </p>

            {user?.email && (
              <p
                style={{
                  marginTop: "7px",
                  fontSize: "13px",
                  color: "#64748b"
                }}
              >
                <User
                  size={14}
                  style={{
                    display: "inline",
                    verticalAlign: "middle",
                    marginRight: "5px"
                  }}
                />
                {user.email}
              </p>
            )}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap"
            }}
          >
            <Link to="/explore" className="dashboard-primary-btn">
              Explore Destinations <ArrowUpRight size={18} />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="dashboard-outline-btn"
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </header>

        {/* ERROR AND SUCCESS MESSAGES */}
        {profileError && (
          <div
            role="alert"
            style={{
              padding: "12px 16px",
              marginBottom: "20px",
              borderRadius: "10px",
              background: "#fff1f0",
              color: "#c0392b"
            }}
          >
            {profileError}
          </div>
        )}

        {bookingError && (
          <div
            role="alert"
            style={{
              padding: "12px 16px",
              marginBottom: "20px",
              borderRadius: "10px",
              background: "#fff1f0",
              color: "#c0392b"
            }}
          >
            {bookingError}
          </div>
        )}

        {bookingMessage && (
          <div
            role="status"
            style={{
              padding: "12px 16px",
              marginBottom: "20px",
              borderRadius: "10px",
              background: "#ecfdf5",
              color: "#087e50"
            }}
          >
            {bookingMessage}
          </div>
        )}

        {/* HERO BANNER */}
        <section className="dashboard-hero">
          <div className="dashboard-hero-content">
            <span className="hero-tag">
              <Compass size={15} /> YOUR JOURNEY BEGINS HERE
            </span>

            <h2>
              Discover places.<br />
              Create memories.
            </h2>

            <p>
              Find your next destination, plan your journey
              and make every trip unforgettable.
            </p>

            <Link to="/explore" className="hero-btn">
              Start Exploring <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* OVERVIEW */}
        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <span className="dashboard-eyebrow">
                YOUR ACTIVITY
              </span>

              <h2>Travel Overview</h2>
            </div>
          </div>

          <div className="overview-grid">
            {overview.map((item) => {
              const Icon = item.icon;

              return (
                <div className="overview-card" key={item.title}>
                  <div className="overview-card-top">
                    <div className="overview-icon">
                      <Icon size={21} />
                    </div>

                    <ArrowUpRight
                      size={18}
                      className="overview-arrow"
                    />
                  </div>

                  <h3>{item.value}</h3>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <span className="dashboard-eyebrow">
                PLAN YOUR JOURNEY
              </span>

              <h2>Quick Actions</h2>
            </div>
          </div>

          <div className="quick-actions-grid">
            {quickActions.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  to={item.path}
                  className="quick-action-card"
                  key={item.name}
                >
                  <div className="quick-action-icon">
                    <Icon size={24} />
                  </div>

                  <div>
                    <h3>{item.name}</h3>
                    <p>Explore options</p>
                  </div>

                  <ArrowUpRight
                    size={18}
                    className="quick-action-arrow"
                  />
                </Link>
              );
            })}
          </div>
        </section>
        {/* SAVED TRIPS */}
<MyTrips />
        {/* MY TRIPS AND BOOKINGS */}
        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <span className="dashboard-eyebrow">
                YOUR ADVENTURES
              </span>

              <h2>My Trips & Bookings</h2>
            </div>

            <span style={{ color: "#64748b", fontSize: "14px" }}>
              {bookings.length} booking(s)
            </span>
          </div>

          {/* BOOKING FILTERS */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginBottom: "20px"
            }}
          >
            {["All", "Confirmed", "Cancelled"].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setBookingFilter(filter)}
                style={{
                  padding: "9px 17px",
                  borderRadius: "25px",
                  border: bookingFilter === filter
                    ? "1px solid #176b5b"
                    : "1px solid #e2e8f0",
                  background: bookingFilter === filter
                    ? "#176b5b"
                    : "#ffffff",
                  color: bookingFilter === filter
                    ? "#ffffff"
                    : "#475569",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                {filter}
                {" "}
                ({filter === "All"
                  ? bookings.length
                  : filter === "Confirmed"
                    ? activeBookings.length
                    : cancelledBookings.length})
              </button>
            ))}
          </div>

          {filteredBookings.length === 0 ? (
            <div className="empty-dashboard-card">
              <div className="empty-dashboard-icon">
                <MapPin size={30} />
              </div>

              <h3>
                {bookings.length === 0
                  ? "No trips planned yet"
                  : `No ${bookingFilter.toLowerCase()} bookings`}
              </h3>

              <p>
                {bookings.length === 0
                  ? "Your travel stories start here. Discover a destination and plan your first adventure."
                  : "Try selecting another booking filter to see your travel records."}
              </p>

              {bookings.length === 0 && (
                <Link
                  to="/explore"
                  className="dashboard-outline-btn"
                >
                  Discover Destinations <ArrowRight size={17} />
                </Link>
              )}
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "20px"
              }}
            >
              {filteredBookings.map((booking) => {
                const type = booking.type?.toLowerCase() || "flights";
                const Icon = bookingIcons[type] || Ticket;
                const item = booking.item || {};
                const isCancelled = booking.status === "Cancelled";
                const isCancelling = cancellingId === booking._id;

                return (
                  <article
                    key={booking._id || booking.bookingId}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "16px",
                      padding: "22px",
                      boxShadow: "0 5px 20px rgba(0,0,0,0.04)"
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "18px"
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px"
                        }}
                      >
                        <div className="overview-icon">
                          <Icon size={21} />
                        </div>

                        <div>
                          <strong style={{ textTransform: "capitalize" }}>
                            {type}
                          </strong>

                          <p
                            style={{
                              margin: 0,
                              color: "#64748b",
                              fontSize: "12px"
                            }}
                          >
                            {booking.bookingId}
                          </p>
                        </div>
                      </div>

                      <span
                        style={{
                          color: isCancelled ? "#b42318" : "#087e50",
                          background: isCancelled ? "#fff1f0" : "#ecfdf5",
                          padding: "6px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {isCancelled ? (
                          <XCircle
                            size={13}
                            style={{
                              display: "inline",
                              verticalAlign: "middle",
                              marginRight: "4px"
                            }}
                          />
                        ) : (
                          <CheckCircle2
                            size={13}
                            style={{
                              display: "inline",
                              verticalAlign: "middle",
                              marginRight: "4px"
                            }}
                          />
                        )}

                        {booking.status || "Confirmed"}
                      </span>
                    </div>

                    <h3 style={{ margin: "0 0 8px", fontSize: "19px" }}>
                      {item.name || "Travel Booking"}
                    </h3>

                    <p
                      style={{
                        color: "#64748b",
                        fontSize: "14px",
                        marginBottom: "16px"
                      }}
                    >
                      <MapPin
                        size={14}
                        style={{
                          display: "inline",
                          verticalAlign: "middle",
                          marginRight: "5px"
                        }}
                      />
                      {booking.route || "Route not available"}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "12px",
                        borderTop: "1px solid #edf0f2",
                        paddingTop: "15px"
                      }}
                    >
                      <div>
                        <p
                          style={{
                            color: "#94a3b8",
                            fontSize: "12px",
                            margin: "0 0 5px"
                          }}
                        >
                          Booking Date
                        </p>

                        <strong style={{ fontSize: "13px" }}>
                          {formatDate(booking.bookingDate)}
                        </strong>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <p
                          style={{
                            color: "#94a3b8",
                            fontSize: "12px",
                            margin: "0 0 5px"
                          }}
                        >
                          Amount
                        </p>

                        <strong
                          style={{
                            fontSize: "17px",
                            color: "#087e70"
                          }}
                        >
                          ₹{Number(item.price || 0).toLocaleString("en-IN")}
                        </strong>
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: "15px",
                        padding: "9px 11px",
                        background: "#fff8e8",
                        color: "#94651a",
                        borderRadius: "8px",
                        fontSize: "12px"
                      }}
                    >
                      Database record · No actual reservation made
                    </div>

                    {/* BOOKING ACTIONS */}
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "16px",
                        flexWrap: "wrap"
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleViewDetails(booking._id)}
                        disabled={detailsLoading}
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "7px",
                          padding: "11px",
                          border: "1px solid #176b5b",
                          borderRadius: "9px",
                          background: "#ffffff",
                          color: "#176b5b",
                          fontWeight: "600",
                          cursor: "pointer"
                        }}
                      >
                        <Eye size={16} />
                        View Details
                      </button>

                      {!isCancelled && (
                        <button
                          type="button"
                          onClick={() => handleCancelBooking(booking)}
                          disabled={isCancelling || !booking._id}
                          style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "7px",
                            padding: "11px",
                            border: "1px solid #fecaca",
                            borderRadius: "9px",
                            background: "#fff1f0",
                            color: "#b42318",
                            fontWeight: "600",
                            cursor: isCancelling ? "not-allowed" : "pointer",
                            opacity: isCancelling ? 0.7 : 1
                          }}
                        >
                          {isCancelling ? (
                            <LoaderCircle size={16} className="animate-spin" />
                          ) : (
                            <XCircle size={16} />
                          )}

                          {isCancelling ? "Cancelling..." : "Cancel Booking"}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* BOTTOM LINKS */}
        <section className="dashboard-bottom-grid">
          <Link to="/explore" className="dashboard-feature-card">
            <Heart size={24} />

            <div>
              <h3>Saved Destinations</h3>
              <p>Keep your favourite places close.</p>
            </div>

            <ArrowUpRight size={19} />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="dashboard-feature-card"
            style={{
              cursor: "pointer",
              textAlign: "left",
              font: "inherit"
            }}
          >
            <LogOut size={24} />

            <div>
              <h3>Logout Account</h3>
              <p>Securely sign out of your account.</p>
            </div>

            <ArrowUpRight size={19} />
          </button>
        </section>

        <footer className="dashboard-footer">
          <p>Made for travellers, powered by TripTrekker.</p>
        </footer>

      </div>

      {/* BOOKING DETAILS MODAL */}
      {selectedBooking && (
        <div
          onClick={() => setSelectedBooking(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(15, 23, 42, 0.65)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px"
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "520px",
              maxHeight: "85vh",
              overflowY: "auto",
              background: "#ffffff",
              borderRadius: "18px",
              padding: "25px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                marginBottom: "20px"
              }}
            >
              <div>
                <span className="dashboard-eyebrow">
                  TRIPTREKKER / BOOKING
                </span>

                <h2 style={{ margin: "5px 0 0" }}>
                  Booking Details
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                aria-label="Close booking details"
                style={{
                  border: "none",
                  background: "#f1f5f9",
                  borderRadius: "50%",
                  width: "38px",
                  height: "38px",
                  cursor: "pointer"
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                padding: "16px",
                background: "#f8fafc",
                borderRadius: "12px",
                marginBottom: "18px"
              }}
            >
              <p style={{ color: "#64748b", fontSize: "12px", margin: 0 }}>
                Booking ID
              </p>

              <strong>{selectedBooking.bookingId}</strong>
            </div>

            <div style={{ display: "grid", gap: "15px" }}>
              <div>
                <p style={{ color: "#64748b", margin: "0 0 4px", fontSize: "13px" }}>
                  Booking Type
                </p>

                <strong style={{ textTransform: "capitalize" }}>
                  {selectedBooking.type}
                </strong>
              </div>

              <div>
                <p style={{ color: "#64748b", margin: "0 0 4px", fontSize: "13px" }}>
                  Item
                </p>

                <strong>
                  {selectedBooking.item?.name || "Travel Booking"}
                </strong>
              </div>

              <div>
                <p style={{ color: "#64748b", margin: "0 0 4px", fontSize: "13px" }}>
                  Route
                </p>

                <strong>{selectedBooking.route || "Not available"}</strong>
              </div>

              <div>
                <p style={{ color: "#64748b", margin: "0 0 4px", fontSize: "13px" }}>
                  Booking Date
                </p>

                <strong>{formatDate(selectedBooking.bookingDate)}</strong>
              </div>

              <div>
                <p style={{ color: "#64748b", margin: "0 0 4px", fontSize: "13px" }}>
                  Amount
                </p>

                <strong style={{ color: "#087e70", fontSize: "20px" }}>
                  ₹{Number(selectedBooking.item?.price || 0).toLocaleString("en-IN")}
                </strong>
              </div>

              <div>
                <p style={{ color: "#64748b", margin: "0 0 4px", fontSize: "13px" }}>
                  Status
                </p>

                <strong
                  style={{
                    color: selectedBooking.status === "Cancelled"
                      ? "#b42318"
                      : "#087e50"
                  }}
                >
                  {selectedBooking.status}
                </strong>
              </div>
            </div>

            <div
              style={{
                marginTop: "22px",
                padding: "12px",
                background: "#fff8e8",
                color: "#94651a",
                borderRadius: "9px",
                fontSize: "12px"
              }}
            >
              This is a TripTrekker database booking record.
              No actual travel reservation or payment has been made.
            </div>

            <button
              type="button"
              onClick={() => setSelectedBooking(null)}
              className="dashboard-primary-btn"
              style={{
                width: "100%",
                justifyContent: "center",
                marginTop: "18px"
              }}
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
