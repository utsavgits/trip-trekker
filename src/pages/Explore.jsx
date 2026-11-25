
import { useState } from "react";
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
  X
} from "lucide-react";

const destinations = [
  {
    id: 1,
    name: "Manali",
    location: "Himachal Pradesh, India",
    category: "Mountains",
    duration: "5 Days / 4 Nights",
    price: 12999,
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=900&q=80",
    description:
      "Explore snow-covered mountains, beautiful valleys and the peaceful atmosphere of the Himalayas.",
    highlights: ["Solang Valley", "Rohtang Pass", "Old Manali"]
  },
  {
    id: 2,
    name: "Goa",
    location: "Goa, India",
    category: "Beaches",
    duration: "4 Days / 3 Nights",
    price: 9999,
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=80",
    description:
      "Enjoy beautiful beaches, sunset views, local food and the relaxed coastal lifestyle.",
    highlights: ["Baga Beach", "Fort Aguada", "Calangute"]
  },
  {
    id: 3,
    name: "Jaipur",
    location: "Rajasthan, India",
    category: "Cities",
    duration: "3 Days / 2 Nights",
    price: 7999,
    rating: "4.7",
    image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=900&q=80",
    description:
      "Discover royal palaces, historic forts, colourful markets and authentic Rajasthani culture.",
    highlights: ["Hawa Mahal", "Amber Fort", "City Palace"]
  },
  {
    id: 4,
    name: "Kashmir",
    location: "Jammu & Kashmir, India",
    category: "Mountains",
    duration: "6 Days / 5 Nights",
    price: 18999,
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=900&q=80",
    description:
      "Experience breathtaking landscapes, peaceful lakes and unforgettable mountain views.",
    highlights: ["Srinagar", "Gulmarg", "Dal Lake"]
  },
  {
    id: 5,
    name: "Rishikesh",
    location: "Uttarakhand, India",
    category: "Mountains",
    duration: "3 Days / 2 Nights",
    price: 5999,
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=900&q=80",
    description:
      "A perfect escape for river rafting, adventure activities and peaceful mountain surroundings.",
    highlights: ["River Rafting", "Lakshman Jhula", "Ganga Aarti"]
  },
  {
    id: 6,
    name: "Mumbai",
    location: "Maharashtra, India",
    category: "Cities",
    duration: "3 Days / 2 Nights",
    price: 8999,
    rating: "4.6",
    image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=900&q=80",
    description:
      "Explore India's vibrant city life, famous landmarks, street food and coastal attractions.",
    highlights: ["Gateway of India", "Marine Drive", "Juhu Beach"]
  }
];

const categories = ["All", "Mountains", "Beaches", "Cities"];

function Explore() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedDestination, setSelectedDestination] = useState(null);

  const filteredDestinations = destinations.filter((destination) => {
    const matchesSearch =
      destination.name.toLowerCase().includes(search.toLowerCase()) ||
      destination.location.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      activeCategory === "All" ||
      destination.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="explore-page">

      <div className="explore-topbar">
        <Link to="/" className="explore-back">
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <Link to="/" className="explore-logo">
          Trip<span>Trekker</span>
        </Link>
      </div>

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

      <section className="explore-content">

        <div className="explore-section-heading">
          <div>
            <span className="section-label">TRAVEL YOUR WAY</span>
            <h2>Find your next escape</h2>
            <p>Choose the kind of experience you're looking for.</p>
          </div>
        </div>

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

        <div className="explore-results-heading">
          <h3>Popular destinations</h3>

          <span>
            {filteredDestinations.length} destinations found
          </span>
        </div>

        {filteredDestinations.length > 0 ? (
          <div className="destination-grid">

            {filteredDestinations.map((destination) => (
              <article className="destination-card" key={destination.id}>

                <div className="destination-image-wrapper">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="destination-image"
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

                    <button
                      className="destination-details-button"
                      onClick={() =>
                        setSelectedDestination(
                          selectedDestination === destination.id
                            ? null
                            : destination.id
                        )
                      }
                    >
                      {selectedDestination === destination.id
                        ? "Hide Details"
                        : "View Details"}

                      <ArrowRight size={16} />
                    </button>

                  </div>

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
          <div className="explore-empty">
            <Compass size={38} />

            <h3>No destinations found</h3>

            <p>Try searching for another destination.</p>

            <button
              onClick={() => {
                setSearch("");
                setActiveCategory("All");
              }}
            >
              Clear Filters
            </button>
          </div>
        )}

      </section>

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
