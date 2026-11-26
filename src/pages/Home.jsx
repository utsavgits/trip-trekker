
import { Link } from "react-router-dom";
import {
  Plane,
  Hotel,
  Train,
  Bus,
  Car,
  MapPin,
  ArrowRight,
  Compass,
  CalendarDays,
  Sparkles
} from "lucide-react";

const services = [
  { name: "Flights", description: "Book domestic and international flights", icon: Plane, path: "/flights" },
  { name: "Hotels", description: "Find comfortable stays at great prices", icon: Hotel, path: "/hotels" },
  { name: "Trains", description: "Explore train journeys across India", icon: Train, path: "/trains" },
  { name: "Buses", description: "Travel conveniently by bus", icon: Bus, path: "/buses" },
  { name: "Cabs", description: "Book rides for your journey", icon: Car, path: "/cabs" },
  { name: "Explore", description: "Discover amazing destinations", icon: Compass, path: "/explore" }
];

const destinations = [
  {
    name: "Manali",
    location: "Himachal Pradesh",
    price: "₹12,999",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23"
  },
  {
    name: "Goa",
    location: "Goa, India",
    price: "₹9,999",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2"
  },
  {
    name: "Jaipur",
    location: "Rajasthan",
    price: "₹7,999",
    image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a"
  }
];

function Home() {
  return (
    <div className="tt-home">

      <section className="tt-home-hero">
        <div className="tt-home-hero-content">
          <span className="tt-home-tag">
            <Sparkles size={15} />
            EXPLORE THE WORLD WITH TRIPTREKKER
          </span>

          <h1>
            Your Journey.
            <br />
            Your Story.
            <br />
            <span>Your Adventure.</span>
          </h1>

          <p>
            Discover beautiful destinations, plan memorable trips
            and make every journey worth remembering.
          </p>

          <div className="tt-home-hero-actions">
            <Link to="/explore" className="tt-home-primary-button">
              Explore Destinations <ArrowRight size={18} />
            </Link>

            <Link to="/trip-planner" className="tt-home-secondary-button">
              <CalendarDays size={18} /> Plan My Trip
            </Link>
          </div>
        </div>
      </section>

      <main className="tt-home-main">

        <section className="tt-home-services">
          <div className="tt-home-section-heading">
            <span>TRAVEL YOUR WAY</span>
            <h2>Everything You Need for Your Journey</h2>
            <p>All your travel services in one place.</p>
          </div>

          <div className="tt-home-service-grid">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <Link
                  to={service.path}
                  className="tt-home-service-card"
                  key={service.name}
                >
                  <div className="tt-home-service-icon">
                    <Icon size={26} />
                  </div>

                  <h3>{service.name}</h3>
                  <p>{service.description}</p>

                  <span className="tt-home-card-link">
                    Explore <ArrowRight size={15} />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="tt-home-planner-banner">
          <div>
            <span>YOUR PERSONAL TRAVEL COMPANION</span>
            <h2>Plan a Trip That Feels Like Yours</h2>
            <p>
              Choose your destination, budget and interests.
              Organize your next adventure with TripTrekker.
            </p>
            <Link to="/trip-planner">
              Start Planning <ArrowRight size={17} />
            </Link>
          </div>

          <div className="tt-home-planner-icon">
            <MapPin size={76} />
          </div>
        </section>

        <section className="tt-home-destinations">
          <div className="tt-home-section-heading">
            <span>POPULAR PLACES</span>
            <h2>Destinations Worth Exploring</h2>
            <p>Get inspired for your next getaway.</p>
          </div>

          <div className="tt-home-destination-grid">
            {destinations.map((destination, index) => (
              <article className="tt-home-destination-card" key={destination.name}>
                <img src={destination.image} alt={destination.name} />

                <div className="tt-home-destination-info">
                  <span>
                    <MapPin size={14} />
                    {destination.location}
                  </span>

                  <h3>{destination.name}</h3>

                  <p>
                    Starting from <strong>{destination.price}</strong>
                  </p>

                  <Link to={`/destination/${index + 1}`}>
                    View Destination <ArrowRight size={15} />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="tt-home-explore-all">
            <Link to="/explore">
              Explore All Destinations <ArrowRight size={17} />
            </Link>
          </div>
        </section>

      </main>

      <footer className="tt-home-footer">
        <Link to="/" className="tt-home-logo">
          <Compass size={24} />
          TripTrekker
        </Link>
        <p>Discover more. Travel better. Make memories.</p>
        <span>© 2026 TripTrekker. All rights reserved.</span>
      </footer>

    </div>
  );
}

export default Home;
