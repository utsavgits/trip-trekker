
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
  Clock3,
  Luggage,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

const demoResults = {
  flights: [],
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
  flights: {
    title: "Available Flights",
    subtitle: "Compare flight options for your journey.",
    icon: Plane,
    unit: "per person",
  },
  hotels: {
    title: "Recommended Stays",
    subtitle: "Find a comfortable place for your trip.",
    icon: Hotel,
    unit: "per night",
  },
  trains: {
    title: "Available Trains",
    subtitle: "Explore train options for your journey.",
    icon: TrainFront,
    unit: "per person",
  },
  buses: {
    title: "Available Buses",
    subtitle: "Choose a comfortable ride to your destination.",
    icon: Bus,
    unit: "per person",
  },
  cabs: {
    title: "Available Cabs",
    subtitle: "Choose the right ride for your journey.",
    icon: Car,
    unit: "estimated fare",
  },
};

const formatDuration = (seconds) => {
  if (seconds === null || seconds === undefined || Number.isNaN(Number(seconds))) {
    return "Duration unavailable";
  }

  const totalMinutes = Math.round(Number(seconds) / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours > 0 ? `${hours}h ` : ""}${minutes}m`;
};

const formatTime = (value) => {
  if (!value) return "Time unavailable";

  if (/^\d{2}:\d{2}$/.test(String(value))) {
    const [hours, minutes] = value.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;

    return `${String(formattedHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatFlightDate = (value) => {
  if (!value) return "";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatExpiry = (value) => {
  if (!value) return "Not provided";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const getLiveFlightResults = (flightResults) => {
  const groups = flightResults?.flights_options || [];
  const globalSegments = flightResults?.segments || [];
  const fares = flightResults?.fares || [];

  const segmentMap = new Map(
    globalSegments.map((segment) => [segment.id, segment])
  );

  const results = [];

  groups.forEach((group, groupIndex) => {
    const flights = group.flights || [];
    const offers = group.offers || [];

    flights.forEach((flight, flightIndex) => {
      const segments = (flight.segments || [])
        .map((segment) => {
          if (typeof segment === "string") {
            return segmentMap.get(segment);
          }

          return segment;
        })
        .filter(Boolean);

      if (segments.length === 0) return;

      const firstSegment = segments[0];
      const lastSegment = segments[segments.length - 1];

      const flightOffers =
        flights.length === 1
          ? offers
          : offers.filter((offer) =>
              (offer.flights || []).includes(flight.id)
            );

      flightOffers.forEach((offer, offerIndex) => {
        const priceDetail = offer.price_details?.[0] || {};
        const priceObject =
          priceDetail.price ||
          offer.price?.price ||
          offer.price ||
          {};

        const amount = Number(priceObject.amount);
        const currency = priceObject.currency || "EUR";

        const fareIds = Array.isArray(offer.fares)
          ? offer.fares.map((fare) =>
              typeof fare === "string" ? fare : fare.id
            )
          : [];

        const matchedFare = fares.find((fare) =>
          fareIds.includes(fare.id)
        );

        const airlineNames = [
          ...new Set(
            segments
              .map((segment) => segment.carrier?.airline_name)
              .filter(Boolean)
          ),
        ];

        const airline =
          airlineNames[0] || offer.channel || "Airline details unavailable";

        const departureAirport =
          firstSegment.departure_airport?.code ||
          firstSegment.departure_city?.code ||
          "";

        const arrivalAirport =
          lastSegment.arrival_airport?.code ||
          lastSegment.arrival_city?.code ||
          "";

        const baggage = matchedFare?.baggage
          ?.map((item) => item.description || item.name || "")
          .filter(Boolean)
          .join(", ");

        const stops = Math.max(segments.length - 1, 0);

        const stopLabel =
          stops === 0
            ? "Non-stop"
            : stops === 1
              ? "1 stop"
              : `${stops} stops`;

        const segmentDetails = segments.map((segment) => ({
          airline:
            segment.carrier?.airline_name ||
            segment.carrier?.airline_code ||
            "Airline unavailable",
          airlineCode: segment.carrier?.airline_code || "",
          flightNumber: segment.flight_number || "",
          from:
            segment.departure_airport?.code ||
            segment.departure_city?.code ||
            "N/A",
          fromName:
            segment.departure_airport?.name ||
            segment.departure_city?.name ||
            "",
          to:
            segment.arrival_airport?.code ||
            segment.arrival_city?.code ||
            "N/A",
          toName:
            segment.arrival_airport?.name ||
            segment.arrival_city?.name ||
            "",
          departure: formatTime(segment.departure_time),
          arrival: formatTime(segment.arrival_time),
          departureDate: segment.departure_date,
          arrivalDate: segment.arrival_date,
          duration: formatDuration(segment.duration),
          aircraft: segment.aircraft || "",
        }));

        results.push({
          id: `${offer.id || groupIndex}-${flight.id || flightIndex}-${offerIndex}`,
          name: airline,
          detail: [
            matchedFare?.price_class_name,
            matchedFare?.cabin_class,
            baggage,
            stopLabel,
          ]
            .filter(Boolean)
            .join(" · "),
          departure: formatTime(firstSegment.departure_time),
          arrival: formatTime(lastSegment.arrival_time),
          departureDate: firstSegment.departure_date,
          arrivalDate: lastSegment.arrival_date,
          duration: formatDuration(flight.journey_time),
          price: Number.isFinite(amount) ? amount : null,
          currency,
          tag: "DRCT Sandbox",
          routeLabel:
            departureAirport && arrivalAirport
              ? `${departureAirport} → ${arrivalAirport}`
              : "",
          stops,
          stopLabel,
          segmentDetails,
          offerId: offer.id,
          flightId: flight.id,
          segments,
          isLiveFlight: true,
        });
      });
    });
  });

  return results;
};

const formatPrice = (price, currency) => {
  if (price === null || price === undefined || !Number.isFinite(Number(price))) {
    return "Price unavailable";
  }

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(Number(price));
  } catch {
    return `${currency} ${Number(price).toLocaleString("en-IN")}`;
  }
};

function BookingResults() {
  const location = useLocation();
  const navigate = useNavigate();

  const [selected, setSelected] = useState(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [savedBooking, setSavedBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verifyingPrice, setVerifyingPrice] = useState(false);
  const [verifiedOffer, setVerifiedOffer] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const searchData = location.state;

  if (!searchData || !searchData.type) {
    return (
      <div className="booking-page">
        <div className="simple-page">
          <h2>No Search Details Found</h2>
          <p>Please go back and search again.</p>
          <button onClick={() => navigate("/")}>Go to Homepage</button>
        </div>
      </div>
    );
  }

  const type = searchData.type.toLowerCase();
  const formData = searchData.formData || {};

  const isLiveFlightSearch =
    type === "flights" && Boolean(searchData.flightResults);

  const results =
    type === "flights"
      ? isLiveFlightSearch
        ? getLiveFlightResults(searchData.flightResults)
        : []
      : demoResults[type] || [];

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
    if (item.price === null || item.price === undefined) {
      setErrorMessage("The provider has not supplied a valid price for this offer.");
      return;
    }

    setSelected(item);
    setVerifiedOffer(null);
    setBookingConfirmed(false);
    setSavedBooking(null);
    setErrorMessage("");
  };

  // Verify the selected offer with DRCT
  const handleVerifyPrice = async () => {
    if (!selected?.isLiveFlight || verifyingPrice) return;

    if (!selected.offerId) {
      setErrorMessage("A valid provider offer ID was not found.");
      return;
    }

    setVerifyingPrice(true);
    setVerifiedOffer(null);
    setErrorMessage("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/flights/offers/${encodeURIComponent(selected.offerId)}/price`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to verify the flight price. Please search again."
        );
      }

      const offer = data.data;

      if (!offer?.price || !Number.isFinite(Number(offer.price.amount))) {
        throw new Error("The provider did not return a valid verified price.");
      }

      setVerifiedOffer(offer);

    } catch (error) {
      console.error("Flight Price Verification Error:", error);
      setErrorMessage(
        error.message || "Something went wrong while verifying the price."
      );
    } finally {
      setVerifyingPrice(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selected || loading) return;

    if (selected.isLiveFlight) return;

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

  const verifiedPrice = verifiedOffer?.price?.amount;
  const verifiedCurrency = verifiedOffer?.price?.currency || selected?.currency;

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
              {results.length} {isLiveFlightSearch ? "provider" : "demo"}{" "}
              options found for your search
            </p>
          </div>

          <span className="demo-label">
            {isLiveFlightSearch ? "DRCT SANDBOX" : "DEMO RESULTS"}
          </span>
        </div>

        {type === "flights" && !isLiveFlightSearch && (
          <p>
            No live flight search data was received. Please go back and
            search again.
          </p>
        )}

        {isLiveFlightSearch && results.length === 0 && (
          <p>
            The provider returned no flight offers for this search.
            Try another route or departure date.
          </p>
        )}

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
                  <span className="result-tag">{item.tag}</span>

                  {item.rating && (
                    <span className="result-rating">
                      <Star size={14} fill="currentColor" />
                      {item.rating}
                    </span>
                  )}
                </div>

                <h3>{item.name}</h3>

                <p className="result-description">{item.detail}</p>

                {type === "hotels" && (
                  <p className="result-extra">
                    <MapPin size={14} />
                    {item.location}
                  </p>
                )}

                {type === "flights" && item.routeLabel && (
                  <p className="result-extra">
                    <Plane size={14} />
                    {item.routeLabel}
                  </p>
                )}

                {type === "flights" && (
                  <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                    margin: "12px 0",
                  }}>
                    <span style={{
                      background: "#eaf5f2",
                      color: "#087e70",
                      padding: "6px 11px",
                      borderRadius: "20px",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}>
                      {item.stopLabel}
                    </span>

                    {item.departureDate && (
                      <span style={{
                        color: "#64748b",
                        fontSize: "13px",
                        padding: "6px 0",
                      }}>
                        {formatFlightDate(item.departureDate)}
                      </span>
                    )}
                  </div>
                )}

                {type === "cabs" ? (
                  <p className="result-extra">
                    <Users size={14} />
                    {item.capacity}
                  </p>
                ) : (
                  <div className="result-timing">
                    <div>
                      <strong>{item.departure || "Not provided"}</strong>
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
                      <strong>{item.arrival || "Not provided"}</strong>
                      <span>
                        {type === "flights" ? "Arrival" : "End"}
                      </span>
                    </div>
                  </div>
                )}

                {type === "flights" && item.segmentDetails?.length > 0 && (
                  <div style={{
                    marginTop: "20px",
                    padding: "18px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "8px",
                      marginBottom: "16px",
                    }}>
                      <strong style={{ fontSize: "14px", color: "#1e293b" }}>
                        Flight journey details
                      </strong>

                      <span style={{ fontSize: "12px", color: "#64748b" }}>
                        {item.segmentDetails.length} flight segment(s)
                      </span>
                    </div>

                    {item.segmentDetails.map((segment, index) => (
                      <div key={`${item.id}-segment-${index}`}>
                        <div style={{
                          display: "grid",
                          gridTemplateColumns: "1fr auto 1fr",
                          gap: "12px",
                          alignItems: "center",
                        }}>
                          <div>
                            <strong style={{
                              display: "block",
                              fontSize: "19px",
                              color: "#0f172a",
                            }}>
                              {segment.departure}
                            </strong>

                            <strong style={{
                              display: "block",
                              fontSize: "14px",
                              marginTop: "4px",
                            }}>
                              {segment.from}
                            </strong>

                            {segment.fromName && (
                              <span style={{
                                display: "block",
                                fontSize: "11px",
                                color: "#64748b",
                                marginTop: "3px",
                              }}>
                                {segment.fromName}
                              </span>
                            )}

                            {segment.departureDate && (
                              <span style={{
                                display: "block",
                                fontSize: "11px",
                                color: "#64748b",
                                marginTop: "3px",
                              }}>
                                {formatFlightDate(segment.departureDate)}
                              </span>
                            )}
                          </div>

                          <div style={{ textAlign: "center", minWidth: "75px" }}>
                            <Plane size={17} color="#087e70" />
                            <div style={{
                              height: "1px",
                              background: "#cbd5e1",
                              margin: "7px 0",
                            }} />
                            <span style={{ fontSize: "11px", color: "#64748b" }}>
                              {segment.duration}
                            </span>
                          </div>

                          <div style={{ textAlign: "right" }}>
                            <strong style={{
                              display: "block",
                              fontSize: "19px",
                              color: "#0f172a",
                            }}>
                              {segment.arrival}
                            </strong>

                            <strong style={{
                              display: "block",
                              fontSize: "14px",
                              marginTop: "4px",
                            }}>
                              {segment.to}
                            </strong>

                            {segment.toName && (
                              <span style={{
                                display: "block",
                                fontSize: "11px",
                                color: "#64748b",
                                marginTop: "3px",
                              }}>
                                {segment.toName}
                              </span>
                            )}

                            {segment.arrivalDate && (
                              <span style={{
                                display: "block",
                                fontSize: "11px",
                                color: "#64748b",
                                marginTop: "3px",
                              }}>
                                {formatFlightDate(segment.arrivalDate)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div style={{
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          gap: "8px",
                          marginTop: "12px",
                          padding: "9px 11px",
                          background: "#ffffff",
                          borderRadius: "8px",
                          fontSize: "12px",
                          color: "#475569",
                        }}>
                          <Plane size={14} color="#087e70" />
                          <strong>{segment.airline}</strong>

                          {segment.airlineCode && segment.flightNumber && (
                            <span>
                              {segment.airlineCode}-{segment.flightNumber}
                            </span>
                          )}

                          {segment.aircraft && (
                            <span>· Aircraft {segment.aircraft}</span>
                          )}
                        </div>

                        {index < item.segmentDetails.length - 1 && (
                          <div style={{
                            margin: "16px 0",
                            padding: "11px",
                            background: "#fff7ed",
                            border: "1px solid #fed7aa",
                            borderRadius: "9px",
                            display: "flex",
                            alignItems: "center",
                            gap: "9px",
                            color: "#9a3412",
                            fontSize: "13px",
                          }}>
                            <Clock3 size={16} />
                            <div>
                              <strong>Change planes at {segment.to}</strong>
                              <div style={{ fontSize: "12px", marginTop: "3px" }}>
                                Connecting airport: {segment.toName || segment.to}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {type === "flights" && (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    flexWrap: "wrap",
                    marginTop: "12px",
                    fontSize: "12px",
                    color: "#64748b",
                  }}>
                    <Luggage size={15} />
                    <span>
                      Baggage information is based on the selected fare, when provided.
                    </span>
                  </div>
                )}

                <div className="result-card-bottom">
                  <div className="result-price">
                    <strong>
                      {type === "flights"
                        ? formatPrice(item.price, item.currency)
                        : `₹${Number(item.price).toLocaleString("en-IN")}`}
                    </strong>
                    <span>{category.unit}</span>
                  </div>

                  <button
                    className={`result-select-button ${
                      selected?.id === item.id ? "selected" : ""
                    }`}
                    onClick={() => handleSelect(item)}
                    disabled={bookingConfirmed || loading || verifyingPrice}
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

        {errorMessage && (
          <p style={{ color: "#dc2626", marginTop: "15px" }}>
            {errorMessage}
          </p>
        )}

        {selected && !bookingConfirmed && (
          <section style={{
            background: "#ffffff",
            border: "1px solid #dce9e5",
            borderRadius: "14px",
            padding: "24px",
            marginTop: "25px",
          }}>
            <h2 style={{ marginTop: 0 }}>
              {selected.isLiveFlight ? "Review Your Flight" : "Confirm Your Selection"}
            </h2>

            <p>
              Selected: <strong>{selected.name}</strong>
            </p>

            {selected.isLiveFlight ? (
              <>
                <p>
                  Original search price:{" "}
                  <strong>{formatPrice(selected.price, selected.currency)}</strong>
                </p>

                {verifiedOffer ? (
                  <div style={{
                    background: "#ecfdf5",
                    border: "1px solid #a7e8c5",
                    borderRadius: "12px",
                    padding: "18px",
                    margin: "18px 0",
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "#087e50",
                      fontWeight: 700,
                    }}>
                      <ShieldCheck size={21} />
                      Price successfully verified
                    </div>

                    <p style={{ marginBottom: "6px", color: "#475569" }}>
                      Latest provider price
                    </p>

                    <h2 style={{
                      margin: "0 0 12px",
                      color: "#087e50",
                      fontSize: "27px",
                    }}>
                      {formatPrice(verifiedPrice, verifiedCurrency)}
                    </h2>

                    {verifiedOffer.price_details?.map((detail, index) => (
                      <div key={index} style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "12px",
                        fontSize: "13px",
                        marginTop: "7px",
                        color: "#475569",
                      }}>
                        <span>{detail.type || "Passenger"} × {detail.count || 1}</span>
                        <strong>
                          {formatPrice(
                            detail.price?.amount,
                            detail.price?.currency || verifiedCurrency
                          )}
                        </strong>
                      </div>
                    ))}

                    <div style={{
                      borderTop: "1px solid #ccebd9",
                      marginTop: "14px",
                      paddingTop: "12px",
                      fontSize: "12px",
                      color: "#475569",
                    }}>
                      <strong>Offer expires:</strong>{" "}
                      {formatExpiry(verifiedOffer.expire_at)}
                    </div>

                    <p style={{
                      marginBottom: 0,
                      marginTop: "12px",
                      fontSize: "12px",
                      color: "#64748b",
                    }}>
                      This is a verified sandbox offer. It does not represent a confirmed reservation.
                    </p>
                  </div>
                ) : (
                  <p style={{ color: "#64748b" }}>
                    Verify the latest provider price before proceeding to passenger details.
                  </p>
                )}

                <button
                  onClick={handleVerifyPrice}
                  disabled={verifyingPrice}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "9px",
                    background: verifyingPrice ? "#6b9d96" : "#087e70",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "9px",
                    padding: "13px 22px",
                    fontWeight: 600,
                    cursor: verifyingPrice ? "not-allowed" : "pointer",
                    opacity: verifyingPrice ? 0.8 : 1,
                  }}
                >
                  {verifyingPrice ? (
                    <>
                      <RefreshCw size={17} />
                      Verifying Price...
                    </>
                  ) : verifiedOffer ? (
                    <>
                      <RefreshCw size={17} />
                      Verify Price Again
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={17} />
                      Verify Price
                    </>
                  )}
                </button>

                {verifiedOffer && (
                  <p style={{
                    color: "#087e50",
                    fontSize: "13px",
                    marginTop: "12px",
                  }}>
                    Price verification complete. Passenger details will be the next step.
                  </p>
                )}
              </>
            ) : (
              <>
                <p>
                  Total price:{" "}
                  <strong>
                    ₹{Number(selected.price).toLocaleString("en-IN")}
                  </strong>
                </p>

                <button
                  onClick={handleConfirmBooking}
                  disabled={loading}
                  style={{
                    background: loading ? "#6b9d96" : "#087e70",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "9px",
                    padding: "13px 22px",
                    fontWeight: 600,
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
              </>
            )}
          </section>
        )}

        {bookingConfirmed && savedBooking && (
          <section style={{
            background: "#ecfdf5",
            border: "1px solid #a7e8c5",
            borderRadius: "14px",
            padding: "25px",
            marginTop: "25px",
          }}>
            <CheckCircle2 size={38} color="#07834f" />

            <h2 style={{ color: "#087e50" }}>
              Booking Record Created!
            </h2>

            <p>Your booking details have been saved successfully.</p>

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
            {isLiveFlightSearch
              ? "Flight offers are retrieved from the DRCT sandbox for testing. Sandbox offers are not valid for actual travel and do not confirm a reservation. No ticket or payment is issued."
              : "These are sample results created for the TripTrekker demo. Prices and availability are illustrative, not live provider offers. A booking record is saved in our database, but no actual ticket, hotel or cab reservation or payment is made."}
          </p>
        </div>
      </main>
    </div>
  );
}

export default BookingResults;
