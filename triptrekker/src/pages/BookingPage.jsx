
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  MapPin,
  CalendarDays,
  Users,
  Clock3,
} from "lucide-react";

const bookingConfigs = {
  flights: {
    fields: [
      { key: "from", label: "FROM", placeholder: "Departure city" },
      { key: "to", label: "TO", placeholder: "Destination city" },
      { key: "departure", label: "DEPARTURE", type: "date" },
      { key: "returnDate", label: "RETURN", type: "date" },
      {
        key: "travellers",
        label: "TRAVELLERS",
        type: "select",
        options: ["1 Traveller", "2 Travellers", "3 Travellers", "4 Travellers", "5+ Travellers"],
      },
      {
        key: "travelClass",
        label: "CLASS",
        type: "select",
        options: ["Economy", "Premium Economy", "Business", "First Class"],
      },
    ],
  },

  hotels: {
    fields: [
      { key: "destination", label: "DESTINATION", placeholder: "City or hotel name" },
      { key: "checkIn", label: "CHECK-IN", type: "date" },
      { key: "checkOut", label: "CHECK-OUT", type: "date" },
      {
        key: "rooms",
        label: "ROOMS",
        type: "select",
        options: ["1 Room", "2 Rooms", "3 Rooms", "4 Rooms"],
      },
      {
        key: "guests",
        label: "GUESTS",
        type: "select",
        options: ["1 Guest", "2 Guests", "3 Guests", "4 Guests", "5+ Guests"],
      },
    ],
  },

  trains: {
    fields: [
      { key: "from", label: "FROM STATION", placeholder: "Departure station" },
      { key: "to", label: "TO STATION", placeholder: "Arrival station" },
      { key: "journeyDate", label: "JOURNEY DATE", type: "date" },
      {
        key: "travelClass",
        label: "TRAVEL CLASS",
        type: "select",
        options: ["All Classes", "Sleeper", "AC 3 Tier", "AC 2 Tier", "AC First Class", "Chair Car"],
      },
    ],
  },

  buses: {
    fields: [
      { key: "from", label: "FROM", placeholder: "Leaving from" },
      { key: "to", label: "TO", placeholder: "Going to" },
      { key: "journeyDate", label: "JOURNEY DATE", type: "date" },
      {
        key: "passengers",
        label: "PASSENGERS",
        type: "select",
        options: ["1 Passenger", "2 Passengers", "3 Passengers", "4 Passengers", "5+ Passengers"],
      },
    ],
  },

  cabs: {
    fields: [
      { key: "pickup", label: "PICKUP LOCATION", placeholder: "Enter pickup location" },
      { key: "drop", label: "DROP LOCATION", placeholder: "Enter drop location" },
      { key: "travelDate", label: "PICKUP DATE", type: "date" },
      { key: "travelTime", label: "PICKUP TIME", type: "time" },
      {
        key: "cabType",
        label: "CAB TYPE",
        type: "select",
        options: ["Hatchback", "Sedan", "SUV", "Premium"],
      },
    ],
  },
};

const pageDetails = {
  flights: {
    title: "Book Your Flights",
    description: "Compare flight options and plan your next journey.",
    icon: "✈️",
  },
  hotels: {
    title: "Find Your Perfect Stay",
    description: "Discover comfortable hotels for every kind of trip.",
    icon: "🏨",
  },
  trains: {
    title: "Book Train Tickets",
    description: "Plan your rail journey with the right travel class.",
    icon: "🚆",
  },
  buses: {
    title: "Book Bus Tickets",
    description: "Find convenient bus options for your next journey.",
    icon: "🚌",
  },
  cabs: {
    title: "Book a Cab",
    description: "Choose your ride for local or outstation travel.",
    icon: "🚕",
  },
};

function BookingPage({ type, title, description, icon }) {
  // Older page components can continue working during this upgrade.
  const pageType =
    type ||
    (title?.toLowerCase().includes("hotel") || title?.toLowerCase().includes("stay")
      ? "hotels"
      : title?.toLowerCase().includes("train")
      ? "trains"
      : title?.toLowerCase().includes("bus")
      ? "buses"
      : title?.toLowerCase().includes("cab")
      ? "cabs"
      : "flights");

  const config = bookingConfigs[pageType] || bookingConfigs.flights;
  const details = pageDetails[pageType] || pageDetails.flights;
  const navigate = useNavigate();

  const [tripType, setTripType] = useState("One Way");
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState("");

  const updateField = (key, value) => {
    setFormData((previous) => ({
      ...previous,
      [key]: value,
    }));
    setMessage("");
  };

  
const handleSubmit = (e) => {
  e.preventDefault();

  if (
    pageType === "flights" &&
    tripType === "Round Trip" &&
    formData.departure &&
    formData.returnDate &&
    formData.returnDate < formData.departure
  ) {
    setMessage("Return date cannot be earlier than departure date.");
    return;
  }

  if (
    pageType === "hotels" &&
    formData.checkIn &&
    formData.checkOut &&
    formData.checkOut <= formData.checkIn
  ) {
    setMessage("Check-out date must be after check-in date.");
    return;
  }

  navigate("/booking-results", {
    state: {
      type: pageType,
      formData: {
        ...formData,
        ...(pageType === "flights" && { tripType })
      }
    }
  });
};

  const displayTitle = title || details.title;
  const displayDescription = description || details.description;
  const displayIcon = icon || details.icon;

  return (
    <div className="booking-page">
      <header className="booking-header">
        <Link to="/" className="booking-logo">
          TripTrekker
        </Link>

        <Link to="/" className="back-home">
          <ArrowLeft size={17} />
          Back to Home
        </Link>
      </header>

      <main className="booking-content">
        <div className="booking-icon">{displayIcon}</div>

        <span className="booking-eyebrow">PLAN YOUR NEXT JOURNEY</span>

        <h1>{displayTitle}</h1>
        <p>{displayDescription}</p>

        <form className="booking-search-box" onSubmit={handleSubmit}>
          {pageType === "flights" && (
            <div className="booking-trip-options">
              <button
                type="button"
                className={tripType === "One Way" ? "active" : ""}
                onClick={() => {
                  setTripType("One Way");
                  setMessage("");
                }}
              >
                One Way
              </button>

              <button
                type="button"
                className={tripType === "Round Trip" ? "active" : ""}
                onClick={() => {
                  setTripType("Round Trip");
                  setMessage("");
                }}
              >
                Round Trip
              </button>
            </div>
          )}

          <div className="booking-fields-grid">
            {config.fields
              .filter(
                (field) =>
                  !(
                    pageType === "flights" &&
                    field.key === "returnDate" &&
                    tripType === "One Way"
                  )
              )
              .map((field) => (
                <div className="booking-input" key={field.key}>
                  <label htmlFor={field.key}>{field.label}</label>

                  {field.type === "select" ? (
                    <select
                      id={field.key}
                      required
                      value={formData[field.key] || field.options[0]}
                      onChange={(e) => updateField(field.key, e.target.value)}
                    >
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={field.key}
                      type={field.type || "text"}
                      placeholder={field.placeholder || ""}
                      value={formData[field.key] || ""}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      required
                    />
                  )}
                </div>
              ))}
          </div>

          <button type="submit" className="booking-search-button">
            <Search size={18} />
            Search {pageType.charAt(0).toUpperCase() + pageType.slice(1)}
          </button>

          {message && (
            <p className="booking-message" role="status">
              {message}
            </p>
          )}
        </form>

        <div className="booking-help-text">
          <MapPin size={16} />
          <span>Explore your options and make every journey memorable.</span>
        </div>
      </main>
    </div>
  );
}

export default BookingPage;
