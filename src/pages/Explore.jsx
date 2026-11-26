
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowLeft,
  Search,
  MapPin,
  Clock,
  IndianRupee,
  ArrowRight,
  Mountain,
  Waves,
  Building2,
  Compass,
  X,
  SlidersHorizontal
} from "lucide-react";

const API_URL = "http://localhost:5000/api/destinations";

const categories = ["All", "Mountains", "Beaches", "Cities"];

function Explore() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [sort, setSort] = useState("");

  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // FETCH DESTINATIONS FROM MYSQL API
  useEffect(() => {
    const controller = new AbortController();

    const fetchDestinations = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        if (search.trim()) {
          params.append("search", search.trim());
        }

        if (activeCategory !== "All") {
          params.append("category", activeCategory);
        }

        if (sort) {
          params.append("sort", sort);
        }

        const queryString = params.toString();

        const response = await fetch(
          `${API_URL}${queryString ? `?${queryString}` : ""}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch destinations.");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || "Unable to load destinations.");
        }

        setDestinations(
          data.destinations.map((destination) => ({
            ...destination,
            location: `${destination.state}, India`,
            price: Number(destination.price),
            rating: String(destination.rating),
            highlights:
              typeof destination.highlights === "string"
                ? JSON.parse(destination.highlights)
                : destination.highlights || []
          }))
        );

      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Destination API Error:", err);
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    const timer = setTimeout(fetchDestinations, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };

  }, [search, activeCategory, sort]);

  return (
    <div className="explore-page">

      {/* TOP NAVIGATION */}
      <div className="explore-topbar">
        <Link to="/" className="explore-back">
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <Link to="/" className="explore-logo">
          Trip<span>Trekker</span>
        </Link>
      </div>

      {/* HERO SECTION */}
      <section className="explore-hero">
        <div className="explore-hero-content">

          <span className="explore-eyebrow">
            <Compass size={16} />
            YOUR NEXT ADVENTURE STARTS HERE
          </span>

          <h1>
            Explore the world.
            <br />
            <span>One journey at a time.</span>
          </h1>

          <p>
            Discover amazing destinations, find your perfect getaway
            and make every journey unforgettable.
          </p>

          <div className="explore-search">
            <Search size={21} />

            <input
              type="text"
              placeholder="Search destinations, cities or places..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="clear-search"
              >
                <X size={18} />
              </button>
            )}

          </div>
        </div>
      </section>

      {/* DESTINATION CONTENT */}
      <section className="explore-content">

        <div className="explore-section-heading">
          <div>
            <span className="section-label">TRAVEL YOUR WAY</span>
            <h2>Find your next escape</h2>
            <p>Choose the kind of experience you're looking for.</p>
          </div>
        </div>

        {/* CATEGORY FILTERS */}
        <div className="explore-categories">

          {categories.map((category) => (
            <button
              key={category}
              className={`category-button ${
                activeCategory === category ? "active" : ""
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category === "Mountains" && <Mountain size={17} />}
              {category === "Beaches" && <Waves size={17} />}
              {category === "Cities" && <Building2 size={17} />}
              {category === "All" && <Compass size={17} />}

              {category}
            </button>
          ))}

        </div>

        {/* RESULTS HEADING AND SORTING */}
        <div className="explore-results-heading">
          <div>
            <h3>Popular destinations</h3>

            <span>
              {loading
                ? "Loading destinations..."
                : `${destinations.length} destinations found`}
            </span>
          </div>

          <div className="explore-sort">
            <SlidersHorizontal size={18} />

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort destinations"
            >
              <option value="">Recommended</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading ? (

          <div className="explore-empty">
            <Compass size={38} />
            <h3>Finding amazing places...</h3>
            <p>Please wait while we load destinations.</p>
          </div>

        ) : error ? (

          /* ERROR STATE */
          <div className="explore-empty">
            <Compass size={38} />
            <h3>Unable to load destinations</h3>
            <p>{error}</p>

            <button
              onClick={() => {
                setSearch("");
                setActiveCategory("All");
                setSort("");
              }}
            >
              Try Again
            </button>
          </div>

        ) : destinations.length > 0 ? (

          /* DESTINATION CARDS */
          <div className="destination-grid">

            {destinations.map((destination) => (

              <article
                className="destination-card"
                key={destination.id}
              >

                <div className="destination-image-wrapper">

                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="destination-image"
                    loading="lazy"
                  />

                  <span className="destination-category">
                    {destination.category}
                  </span>

                  <span className="destination-rating">
                    ★ {destination.rating}
                  </span>

                </div>

                <div className="destination-card-content">

                  <div className="destination-location">
                    <MapPin size={15} />
                    {destination.location}
                  </div>

                  <h3>{destination.name}</h3>

                  <p className="destination-description">
                    {destination.description}
                  </p>

                  <div className="destination-duration">
                    <Clock size={15} />
                    {destination.duration}
                  </div>

                  <div className="destination-card-bottom">

                    <div className="destination-price">

                      <span>Starting from</span>

                      <strong>
                        <IndianRupee size={17} />
                        {destination.price.toLocaleString("en-IN")}
                      </strong>

                      <small>per person</small>

                    </div>

                    <Link
  to={`/destination/${destination.id}`}
  className="destination-details-button"
>
  View Details
  <ArrowRight size={16} />
</Link>

                  </div>

                  {/* EXTRA DETAILS */}
                  {selectedDestination === destination.id && (

                    <div className="destination-extra-details">

                      <h4>Top experiences</h4>

                      <ul>
                        {destination.highlights.map((highlight) => (
                          <li key={highlight}>{highlight}</li>
                        ))}
                      </ul>

                      <p>
                        This is a sample travel package.
                        Final pricing and availability will be added
                        through provider integrations.
                      </p>

                    </div>

                  )}

                </div>

              </article>

            ))}

          </div>

        ) : (

          /* EMPTY STATE */
          <div className="explore-empty">

            <Compass size={38} />

            <h3>No destinations found</h3>

            <p>Try searching for another destination.</p>

            <button
              onClick={() => {
                setSearch("");
                setActiveCategory("All");
                setSort("");
              }}
            >
              Clear Filters
            </button>

          </div>

        )}

      </section>

      {/* CTA SECTION */}
      <section className="explore-cta">

        <div>
          <span>YOUR JOURNEY, YOUR WAY</span>

          <h2>Ready to plan your next adventure?</h2>

          <p>
            Let TripTrekker help you discover your next favourite place.
          </p>
        </div>

        <Link to="/" className="explore-cta-button">
          Plan Your Trip
          <ArrowRight size={18} />
        </Link>

      </section>

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

export default Explore;
