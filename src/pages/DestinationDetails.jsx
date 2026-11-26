
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  ArrowLeft,
  MapPin,
  Clock,
  IndianRupee,
  Star,
  Compass,
  CheckCircle2,
  CalendarDays,
  ArrowRight,
  Mountain
} from "lucide-react";

const API_URL = "http://localhost:5000/api/destinations";

function DestinationDetails() {
  const { id } = useParams();

  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // FETCH SINGLE DESTINATION
  useEffect(() => {
    const controller = new AbortController();

    const fetchDestination = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/${id}`, {
          signal: controller.signal
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load destination."
          );
        }

        const item = data.destination;

        setDestination({
          ...item,
          location: `${item.state}, India`,
          price: Number(item.price),
          rating: Number(item.rating),
          highlights:
            typeof item.highlights === "string"
              ? JSON.parse(item.highlights)
              : item.highlights || []
        });

      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Destination Details Error:", err);
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchDestination();

    return () => controller.abort();
  }, [id]);

  // LOADING STATE
  if (loading) {
    return (
      <div className="destination-detail-state">
        <Compass size={42} />
        <h2>Discovering your destination...</h2>
        <p>Please wait while we load the details.</p>
      </div>
    );
  }

  // ERROR STATE
  if (error || !destination) {
    return (
      <div className="destination-detail-state">
        <Compass size={42} />
        <h2>Destination not found</h2>
        <p>{error || "This destination is unavailable."}</p>

        <Link to="/explore" className="destination-back-button">
          <ArrowLeft size={17} />
          Back to Explore
        </Link>
      </div>
    );
  }

  return (
    <div className="destination-detail-page">

      {/* NAVBAR */}
      <header className="destination-detail-nav">
        <Link to="/explore" className="destination-back-link">
          <ArrowLeft size={18} />
          Back to Explore
        </Link>

        <Link to="/" className="explore-logo">
          Trip<span>Trekker</span>
        </Link>
      </header>

      {/* HERO IMAGE */}
      <section className="destination-detail-hero">
        <img
          src={destination.image}
          alt={destination.name}
          className="destination-detail-cover"
        />

        <div className="destination-detail-overlay">
          <span className="destination-detail-category">
            {destination.category}
          </span>

          <h1>{destination.name}</h1>

          <div className="destination-detail-location">
            <MapPin size={18} />
            {destination.location}
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="destination-detail-container">

        <div className="destination-detail-main">

          {/* INTRODUCTION */}
          <section className="destination-about">
            <span className="section-label">EXPLORE DESTINATION</span>

            <h2>Discover {destination.name}</h2>

            <p>{destination.description}</p>

            <p>
              Experience the beauty of {destination.name} and explore
              its popular attractions, local experiences and memorable
              travel opportunities.
            </p>
          </section>

          {/* QUICK INFORMATION */}
          <section className="destination-info-grid">

            <div className="destination-info-card">
              <Clock size={23} />
              <div>
                <span>Trip Duration</span>
                <strong>{destination.duration}</strong>
              </div>
            </div>

            <div className="destination-info-card">
              <Star size={23} />
              <div>
                <span>Destination Rating</span>
                <strong>{destination.rating} / 5</strong>
              </div>
            </div>

            <div className="destination-info-card">
              <Mountain size={23} />
              <div>
                <span>Travel Category</span>
                <strong>{destination.category}</strong>
              </div>
            </div>

          </section>

          {/* HIGHLIGHTS */}
          <section className="destination-highlights">

            <span className="section-label">MAKE THE MOST OF IT</span>

            <h2>Top experiences & highlights</h2>

            <div className="destination-highlight-list">
              {destination.highlights.map((highlight, index) => (
                <div
                  className="destination-highlight-item"
                  key={highlight}
                >
                  <CheckCircle2 size={20} />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>

          </section>

          {/* TRAVEL INFORMATION */}
          <section className="destination-travel-info">

            <h2>Plan your visit</h2>

            <p>
              Explore {destination.name} at your own pace. Choose your
              preferred travel dates and prepare for an unforgettable
              journey with TripTrekker.
            </p>

            <div className="destination-travel-note">
              <CalendarDays size={21} />
              <span>
                Travel dates and final package availability will be
                confirmed through booking integrations.
              </span>
            </div>

          </section>

        </div>

        {/* BOOKING CARD */}
        <aside className="destination-booking-card">

          <span className="destination-booking-label">
            YOUR NEXT ADVENTURE
          </span>

          <h3>Explore {destination.name}</h3>

          <div className="destination-booking-rating">
            <Star size={16} fill="currentColor" />
            {destination.rating} / 5
          </div>

          <div className="destination-booking-price">
            <span>Starting from</span>

            <strong>
              <IndianRupee size={23} />
              {destination.price.toLocaleString("en-IN")}
            </strong>

            <small>per person</small>
          </div>

          <div className="destination-booking-duration">
            <Clock size={17} />
            {destination.duration}
          </div>

          <Link
            to="/"
            className="destination-plan-button"
          >
            Plan This Trip
            <ArrowRight size={18} />
          </Link>

          <p className="destination-booking-disclaimer">
            Sample package pricing. Final availability and pricing
            depend on provider integrations.
          </p>

        </aside>

      </main>

      {/* FOOTER */}
      <footer className="explore-footer">
        <Link to="/" className="explore-logo">
          Trip<span>Trekker</span>
        </Link>

        <p>Discover more. Travel better.</p>

        <span>© 2026 TripTrekker</span>
      </footer>

    </div>
  );
}

export default DestinationDetails;
