
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft,
  Search,
  MapPin,
  Users,
  Star,
  CheckCircle2,
  Plane,
  Hotel,
  TrainFront,
  Bus,
  Car,
  ArrowRight,
} from "lucide-react";

const demoResults = {
  flights: [
    { id: 1, name: "IndiGo", detail: "Non-stop flight", departure: "06:30 AM", arrival: "08:45 AM", duration: "2h 15m", price: 4599, tag: "Best Value" },
    { id: 2, name: "Air India", detail: "Non-stop flight", departure: "10:15 AM", arrival: "12:30 PM", duration: "2h 15m", price: 5299, tag: "Comfort Choice" },
    { id: 3, name: "Akasa Air", detail: "Non-stop flight", departure: "04:45 PM", arrival: "07:00 PM", duration: "2h 15m", price: 4899, tag: "Popular" },
  ],
  hotels: [
    { id: 1, name: "The Grand Retreat", detail: "Luxury hotel · Mountain view", rating: "4.8", location: "Near city centre", price: 3499, tag: "Top Rated", image: "photo-1566073771259-6a8506099945" },
    { id: 2, name: "Urban Comfort Stay", detail: "Premium hotel · Free Wi-Fi", rating: "4.5", location: "Central location", price: 2199, tag: "Best Value", image: "photo-1564501049412-61c2a3083791" },
    { id: 3, name: "The Heritage House", detail: "Boutique stay · Breakfast included", rating: "4.7", location: "Heritage district", price: 2899, tag: "Guest Favourite", image: "photo-1571896349842-33c89424de2d" },
  ],
  trains: [
    { id: 1, name: "Rajdhani Express", detail: "Train No. 12951", departure: "04:55 PM", arrival: "08:35 AM", duration: "15h 40m", price: 1850, tag: "Premium" },
    { id: 2, name: "Shatabdi Express", detail: "Train No. 12002", departure: "06:00 AM", arrival: "02:10 PM", duration: "8h 10m", price: 1250, tag: "Fast Journey" },
    { id: 3, name: "Superfast Express", detail: "Train No. 12903", departure: "09:30 PM", arrival: "11:15 AM", duration: "13h 45m", price: 950, tag: "Budget Choice" },
  ],
  buses: [
    { id: 1, name: "Volvo Multi-Axle", detail: "AC Sleeper · Luxury", departure: "09:00 PM", arrival: "06:00 AM", duration: "9h", price: 999, tag: "Popular" },
    { id: 2, name: "IntrCity SmartBus", detail: "AC Sleeper · Premium", departure: "10:30 PM", arrival: "07:30 AM", duration: "9h", price: 799, tag: "Best Value" },
    { id: 3, name: "Express Travels", detail: "AC Seater · Comfortable", departure: "08:00 PM", arrival: "05:30 AM", duration: "9h 30m", price: 649, tag: "Budget Choice" },
  ],
  cabs: [
    { id: 1, name: "Hatchback", detail: "Up to 4 passengers", capacity: "4 Seats", price: 999, tag: "Budget Friendly" },
    { id: 2, name: "Sedan", detail: "Comfortable city ride", capacity: "4 Seats", price: 1399, tag: "Popular" },
    { id: 3, name: "SUV", detail: "Extra space for your group", capacity: "6-7 Seats", price: 2199, tag: "Group Travel" },
  ],
};

const categoryDetails = {
  flights: { title: "Available Flights", subtitle: "Compare flight options for your journey.", icon: Plane, unit: "per person" },
  hotels: { title: "Recommended Stays", subtitle: "Find a comfortable place for your trip.", icon: Hotel, unit: "per night" },
  trains: { title: "Available Trains", subtitle: "Explore train options for your journey.", icon: TrainFront, unit: "per person" },
  buses: { title: "Available Buses", subtitle: "Choose a comfortable ride to your destination.", icon: Bus, unit: "per person" },
  cabs: { title: "Available Cabs", subtitle: "Choose the right ride for your journey.", icon: Car, unit: "estimated fare" },
};

function BookingResults() {
  const location = useLocation();
  const navigate = useNavigate();

  const [selected, setSelected] = useState(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [savedBooking, setSavedBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const searchData = location.state;

  if (!searchData || !searchData.type) {
    return (
      <div className="booking-page">
        <div className="simple-page">
          <h2>No Search Details Found</h2>
          <p>Please go back and search again.</p>
          <button onClick={() => navigate("/")}>
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  const type = searchData.type.toLowerCase();
  const formData = searchData.formData || {};
  const results = demoResults[type] || [];
  const category = categoryDetails[type] || categoryDetails.flights;
  const CategoryIcon = category.icon;

  const formatLabel = (key) =>
    key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

  const formatValue = (value) => {
    if (!value) return "Not specified";
    return String(value);
  };

  const getRoute = () => {
    if (type === "hotels") {
      return formData.destination || "Your destination";
    }

    if (type === "cabs") {
      return `${formData.pickup || "Pickup"} → ${formData.drop || "Drop"}`;
    }

    return `${formData.from || "Starting point"} → ${formData.to || "Destination"}`;
  };

  const handleSelect = (item) => {
    setSelected(item);
    setBookingConfirmed(false);
    setSavedBooking(null);
    setErrorMessage("");
  };

  const handleConfirmBooking = async () => {
    if (!selected || loading) return;

    const token =
      localStorage.getItem("tripTrekkerToken") ||
      sessionStorage.getItem("tripTrekkerToken");

    if (!token) {
      navigate("/login", {
        state: { from: location.pathname },
      });
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type,
          item: selected,
          formData,
          route: getRoute(),
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("tripTrekkerToken");
        localStorage.removeItem("tripTrekkerUser");
        sessionStorage.removeItem("tripTrekkerToken");
        sessionStorage.removeItem("tripTrekkerUser");

        navigate("/login", {
          state: { message: "Your session has expired. Please login again." },
        });
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save booking.");
      }

      setSavedBooking(data.booking);
      setBookingConfirmed(true);

    } catch (error) {
      console.error("Booking Error:", error);
      setErrorMessage(
        error.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="results-page">

      <header className="results-header">
        <button
          className="results-back"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <button
          className="results-brand"
          onClick={() => navigate("/")}
        >
          TripTrekker<span>.</span>
        </button>

        <button
          className="results-modify-top"
          onClick={() => navigate(-1)}
        >
          <Search size={16} />
          Modify Search
        </button>
      </header>

      <main className="results-container">

        <div className="results-heading">
          <div>
            <span className="results-eyebrow">
              YOUR JOURNEY STARTS HERE
            </span>

            <h1>{category.title}</h1>
            <p>{category.subtitle}</p>
          </div>

          <div className="results-heading-icon">
            <CategoryIcon size={30} />
          </div>
        </div>

        <section className="results-summary">
          <div className="summary-route">
            <MapPin size={19} />

            <div>
              <span>YOUR ROUTE</span>
              <strong>{getRoute()}</strong>
            </div>
          </div>

          <div className="summary-divider" />

          {Object.entries(formData).slice(0, 3).map(([key, value]) => (
            <div className="summary-item" key={key}>
              <span>{formatLabel(key)}</span>
              <strong>{formatValue(value)}</strong>
            </div>
          ))}

          <button
            className="summary-edit"
            onClick={() => navigate(-1)}
          >
            <Search size={16} />
            Edit
          </button>
        </section>

        <div className="results-count">
          <div>
            <h2>Explore your options</h2>
            <p>
              {results.length} demo options found for your search
            </p>
          </div>

          <span className="demo-label">DEMO RESULTS</span>
        </div>

        <div className="results-list">
          {results.map((item) => (
            <article className="result-card" key={item.id}>

              {type === "hotels" && (
                <div className="hotel-result-image">
                  <img
                    src={`https://images.unsplash.com/${item.image}?auto=format&fit=crop&w=700&q=80`}
                    alt={item.name}
                  />
                </div>
              )}

              <div className="result-card-main">

                <div className="result-card-top">
                  <span className="result-tag">
                    {item.tag}
                  </span>

                  {item.rating && (
                    <span className="result-rating">
                      <Star size={14} fill="currentColor" />
                      {item.rating}
                    </span>
                  )}
                </div>

                <h3>{item.name}</h3>

                <p className="result-description">
                  {item.detail}
                </p>

                {type === "hotels" && (
                  <p className="result-extra">
                    <MapPin size={14} />
                    {item.location}
                  </p>
                )}

                {type === "cabs" ? (
                  <p className="result-extra">
                    <Users size={14} />
                    {item.capacity}
                  </p>
                ) : (
                  <div className="result-timing">
                    <div>
                      <strong>{item.departure}</strong>
                      <span>
                        {type === "flights" ? "Departure" : "Start"}
                      </span>
                    </div>

                    <div className="timing-line">
                      <span>{item.duration}</span>
                      <div />
                      <ArrowRight size={15} />
                    </div>

                    <div>
                      <strong>{item.arrival}</strong>
                      <span>
                        {type === "flights" ? "Arrival" : "End"}
                      </span>
                    </div>
                  </div>
                )}

                <div className="result-card-bottom">
                  <div className="result-price">
                    <strong>
                      ₹{item.price.toLocaleString("en-IN")}
                    </strong>
                    <span>{category.unit}</span>
                  </div>

                  <button
                    className={`result-select-button ${
                      selected?.id === item.id ? "selected" : ""
                    }`}
                    onClick={() => handleSelect(item)}
                    disabled={bookingConfirmed || loading}
                  >
                    {selected?.id === item.id ? (
                      <>
                        <CheckCircle2 size={17} />
                        Selected
                      </>
                    ) : (
                      "Select Option"
                    )}
                  </button>
                </div>

              </div>
            </article>
          ))}
        </div>

        {selected && !bookingConfirmed && (
          <section
            style={{
              background: "#ffffff",
              border: "1px solid #dce9e5",
              borderRadius: "14px",
              padding: "24px",
              marginTop: "25px",
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              Confirm Your Selection
            </h2>

            <p>
              Selected: <strong>{selected.name}</strong>
            </p>

            <p>
              Total price:{" "}
              <strong>
                ₹{selected.price.toLocaleString("en-IN")}
              </strong>
            </p>

            {errorMessage && (
              <p style={{ color: "#dc2626", marginBottom: "15px" }}>
                {errorMessage}
              </p>
            )}

            <button
              onClick={handleConfirmBooking}
              disabled={loading}
              style={{
                background: loading ? "#6b9d96" : "#087e70",
                color: "#ffffff",
                border: "none",
                borderRadius: "9px",
                padding: "13px 22px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.8 : 1,
              }}
            >
              <CheckCircle2
                size={17}
                style={{
                  display: "inline",
                  verticalAlign: "middle",
                  marginRight: "8px",
                }}
              />
              {loading ? "Saving Booking..." : "Confirm Booking"}
            </button>
          </section>
        )}

        {bookingConfirmed && savedBooking && (
          <section
            style={{
              background: "#ecfdf5",
              border: "1px solid #a7e8c5",
              borderRadius: "14px",
              padding: "25px",
              marginTop: "25px",
            }}
          >
            <CheckCircle2 size={38} color="#07834f" />

            <h2 style={{ color: "#087e50" }}>
              Booking Record Created!
            </h2>

            <p>
              Your booking details have been saved successfully.
            </p>

            <p>
              Booking ID: <strong>{savedBooking.bookingId}</strong>
            </p>

            <p>
              Service: <strong>{savedBooking.item?.name}</strong>
            </p>

            <p>
              Amount:{" "}
              <strong>
                ₹{Number(savedBooking.item?.price || 0).toLocaleString("en-IN")}
              </strong>
            </p>

            <button
              onClick={() => navigate("/dashboard")}
              style={{
                background: "#087e70",
                color: "white",
                border: "none",
                borderRadius: "9px",
                padding: "13px 20px",
                cursor: "pointer",
                fontWeight: "600",
                marginTop: "10px",
              }}
            >
              Go to Dashboard <ArrowRight size={17} />
            </button>
          </section>
        )}

        <div className="results-disclaimer">
          <CheckCircle2 size={18} />

          <p>
            These are sample results created for the TripTrekker demo.
            Prices and availability are illustrative, not live provider
            offers. A booking record is saved in our database, but no
            actual ticket, hotel or cab reservation or payment is made.
          </p>
        </div>

      </main>
    </div>
  );
}

export default BookingResults;
