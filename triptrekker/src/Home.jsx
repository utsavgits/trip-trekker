
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plane, Hotel, TrainFront, BusFront, CarFront,
  MapPin, CalendarDays, Users, Search, ArrowRight,
  ShieldCheck, Headphones, Wallet, ChevronDown,
  Heart, Star, Sparkles
} from "lucide-react";

import "./App.css";

const travelTabs = [
  { name: "Flights", icon: Plane, path: "/flights" },
  { name: "Hotels", icon: Hotel, path: "/hotels" },
  { name: "Trains", icon: TrainFront, path: "/trains" },
  { name: "Buses", icon: BusFront, path: "/buses" },
  { name: "Cabs", icon: CarFront, path: "/cabs" },
];

const destinations = [
  {
    name: "Manali",
    country: "Himachal Pradesh, India",
    price: "₹8,499",
    image: "photo-1626621341517-bbf3d9990a23",
    rating: "4.9",
    tag: "Mountain escape",
  },
  {
    name: "Goa",
    country: "Goa, India",
    price: "₹6,999",
    image: "photo-1512343879784-a960bf40e7f2",
    rating: "4.8",
    tag: "Beach getaway",
  },
  {
    name: "Jaipur",
    country: "Rajasthan, India",
    price: "₹4,999",
    image: "photo-1599661046827-dacff0c0f09a",
    rating: "4.8",
    tag: "Royal experience",
  },
  {
    name: "Kashmir",
    country: "Jammu & Kashmir, India",
    price: "₹12,999",
    image: "photo-1595815771614-ade9d652a65d",
    rating: "5.0",
    tag: "Nature & serenity",
  },
];

const imageUrl = (id, width = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

function Home() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("Flights");
  const [tripType, setTripType] = useState("One Way");
  const [from, setFrom] = useState("New Delhi");
  const [to, setTo] = useState("");
  const [departure, setDeparture] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [travellers, setTravellers] = useState("1 Traveller");
  const [searchMessage, setSearchMessage] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();

    if (!to.trim()) {
      setSearchMessage("Please enter your destination.");
      return;
    }

    setSearchMessage(
      `${activeTab} search for ${to} is ready. Booking search will be connected in the next development phase.`
    );
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab.name);
    setSearchMessage("");
    navigate(tab.path);
  };

  return (
    <div className="app">

      {/* Navigation */}
      <header className="navbar">
        <Link to="/" className="brand">
          <span className="brand-icon">
            <Plane size={22} />
          </span>

          <span>
            Trip<span className="brand-highlight">Trekker</span>
          </span>
        </Link>

        <nav className="nav-links">
          <Link to="/" className="active">Home</Link>
          <Link to="/explore">Explore</Link>
          <Link to="/dashboard">Dashboard</Link>
          <a href="#packages">Packages</a>
          <a href="#offers">Offers</a>
        </nav>

        <div className="nav-actions">
          <button
            className="help-button"
            onClick={() => navigate("/explore")}
          >
            <Headphones size={17} />
            <span>Help</span>
          </button>

          <button
            className="login-button"
            onClick={() => navigate("/login")}
          >
            Login / Sign up
            <ArrowRight size={16} />
          </button>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="hero" id="home">
          <div className="hero-overlay"></div>

          <div className="hero-content">
            <div className="hero-tag">
              <Sparkles size={14} />
              YOUR NEXT ADVENTURE STARTS HERE
            </div>

            <h1>
              Travel beyond
              <br />
              <span>the ordinary.</span>
            </h1>

            <p>
              Discover incredible places, find the best stays
              and plan journeys worth remembering.
            </p>
          </div>

          {/* Booking Search */}
          <div className="booking-container">
            <div className="booking-tabs">
              {travelTabs.map((tab) => {
                const Icon = tab.icon;

                return (
                  <button
                    key={tab.name}
                    className={`booking-tab ${
                      activeTab === tab.name ? "selected" : ""
                    }`}
                    onClick={() => handleTabClick(tab)}
                  >
                    <Icon size={19} />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>

            <form className="search-form" onSubmit={handleSearch}>
              <div className="trip-options">
                <button
                  type="button"
                  className={tripType === "One Way" ? "trip-active" : ""}
                  onClick={() => setTripType("One Way")}
                >
                  One Way
                </button>

                <button
                  type="button"
                  className={tripType === "Round Trip" ? "trip-active" : ""}
                  onClick={() => setTripType("Round Trip")}
                >
                  Round Trip
                </button>
              </div>

              <div className="search-fields">
                <label className="search-field">
                  <span>FROM</span>
                  <div className="field-value">
                    <MapPin size={17} />
                    <input
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      placeholder="Departure city"
                    />
                  </div>
                </label>

                <label className="search-field">
                  <span>TO</span>
                  <div className="field-value">
                    <MapPin size={17} />
                    <input
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      placeholder="Where to?"
                    />
                  </div>
                </label>

                <label className="search-field">
                  <span>DEPARTURE</span>
                  <div className="field-value">
                    <CalendarDays size={17} />
                    <input
                      type="date"
                      value={departure}
                      onChange={(e) => setDeparture(e.target.value)}
                    />
                  </div>
                </label>

                <label className="search-field">
                  <span>RETURN</span>
                  <div className="field-value">
                    <CalendarDays size={17} />
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      disabled={tripType === "One Way"}
                    />
                  </div>
                </label>

                <label className="search-field traveller-field">
                  <span>TRAVELLERS</span>
                  <div className="field-value">
                    <Users size={17} />
                    <select
                      value={travellers}
                      onChange={(e) => setTravellers(e.target.value)}
                    >
                      <option>1 Traveller</option>
                      <option>2 Travellers</option>
                      <option>3 Travellers</option>
                      <option>4 Travellers</option>
                      <option>5+ Travellers</option>
                    </select>
                    <ChevronDown size={14} />
                  </div>
                </label>
              </div>

              <button type="submit" className="search-button">
                <Search size={19} />
                Search {activeTab}
              </button>

              {searchMessage && (
                <p className="search-message" role="status">
                  {searchMessage}
                </p>
              )}
            </form>
          </div>
        </section>

        {/* Trust features */}
        <section className="trust-section">
          <div className="trust-item">
            <ShieldCheck />
            <div>
              <strong>Secure bookings</strong>
              <span>Your journey, protected</span>
            </div>
          </div>

          <div className="trust-item">
            <Wallet />
            <div>
              <strong>Best value deals</strong>
              <span>Travel more, spend smart</span>
            </div>
          </div>

          <div className="trust-item">
            <Headphones />
            <div>
              <strong>Travel assistance</strong>
              <span>We're here to help</span>
            </div>
          </div>
        </section>

        {/* Destinations */}
        <section className="section destination-section" id="explore">
          <div className="section-heading">
            <div>
              <span className="eyebrow">EXPLORE THE WORLD</span>
              <h2>Popular destinations</h2>
              <p>Handpicked places for your next unforgettable journey.</p>
            </div>

            <Link to="/explore" className="view-all">
              Explore all <ArrowRight size={17} />
            </Link>
          </div>

          <div className="destination-grid">
            {destinations.map((place) => (
              <article className="destination-card" key={place.name}>
                <div className="destination-image">
                  <img
                    src={imageUrl(place.image)}
                    alt={place.name}
                  />

                  <span className="destination-tag">{place.tag}</span>

                  <button
                    className="wishlist-button"
                    aria-label={`Save ${place.name}`}
                    onClick={(e) =>
                      e.currentTarget.classList.toggle("liked")
                    }
                  >
                    <Heart size={19} />
                  </button>
                </div>

                <div className="destination-info">
                  <div className="destination-title-row">
                    <div>
                      <h3>{place.name}</h3>
                      <span>{place.country}</span>
                    </div>

                    <div className="rating">
                      <Star size={14} fill="currentColor" />
                      {place.rating}
                    </div>
                  </div>

                  <div className="destination-price">
                    <div>
                      <small>Starting from</small>
                      <strong>{place.price}</strong>
                      <small> / person</small>
                    </div>

                    <button
                      aria-label={`Explore ${place.name}`}
                      onClick={() => navigate("/explore")}
                    >
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Holiday inspiration */}
        <section className="package-banner" id="packages">
          <div className="package-content">
            <span className="eyebrow">MAKE EVERY MOMENT COUNT</span>

            <h2>
              More than a trip.
              <br />
              A lifetime of memories.
            </h2>

            <p>
              Find inspiring holiday packages and turn your
              dream destinations into reality.
            </p>

            <Link to="/explore" className="package-button">
              Discover packages <ArrowRight size={17} />
            </Link>
          </div>

          <div className="package-image">
            <img
              src={imageUrl("photo-1476514525535-07fb3b4ae5f1", 1000)}
              alt="Beautiful lake surrounded by mountains"
            />
          </div>
        </section>

        {/* Offers */}
        <section className="section offers-section" id="offers">
          <div className="section-heading">
            <div>
              <span className="eyebrow">TRAVEL SMARTER</span>
              <h2>Why travel with us?</h2>
              <p>Everything you need to plan a better journey.</p>
            </div>
          </div>

          <div className="benefit-grid">
            <div className="benefit-card">
              <span className="benefit-icon"><Search /></span>
              <h3>Discover more</h3>
              <p>
                Explore destinations, compare options and find your perfect trip.
              </p>
            </div>

            <div className="benefit-card">
              <span className="benefit-icon"><Wallet /></span>
              <h3>Plan your budget</h3>
              <p>Keep your travel expenses organized in one place.</p>
            </div>

            <div className="benefit-card">
              <span className="benefit-icon"><MapPin /></span>
              <h3>Plan every stop</h3>
              <p>Create personalized itineraries for your journey.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-main">
          <div className="footer-brand">
            <Link to="/" className="brand">
              <span className="brand-icon">
                <Plane size={21} />
              </span>

              <span>
                Trip<span className="brand-highlight">Trekker</span>
              </span>
            </Link>

            <p>
              Discover more. Travel better.
              <br />
              Make every journey unforgettable.
            </p>
          </div>

          <div className="footer-column">
            <h4>Explore</h4>
            <Link to="/explore">Destinations</Link>
            <a href="#packages">Holiday packages</a>
            <a href="#offers">Travel offers</a>
          </div>

          <div className="footer-column">
            <h4>Bookings</h4>
            <Link to="/flights">Flights</Link>
            <Link to="/hotels">Hotels</Link>
            <Link to="/trains">Trains</Link>
            <Link to="/buses">Buses</Link>
            <Link to="/cabs">Cabs</Link>
          </div>

          <div className="footer-column">
            <h4>Account</h4>
            <Link to="/dashboard">My Dashboard</Link>
            <Link to="/login">Login</Link>
            <Link to="/signup">Create Account</Link>
          </div>

          <div className="footer-column">
            <h4>Support</h4>
            <Link to="/explore">Help centre</Link>
            <Link to="/login">Contact us</Link>
            <a href="#home">Privacy policy</a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 TripTrekker. All rights reserved.</span>
          <span>Made for travellers, by travellers.</span>
        </div>
      </footer>

    </div>
  );
}

export default Home;
