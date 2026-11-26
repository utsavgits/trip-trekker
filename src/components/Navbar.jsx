
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Plane,
  Hotel,
  Train,
  Bus,
  Car,
  Compass,
  Map,
  LayoutDashboard,
  LogIn,
} from "lucide-react";

function Navbar() {
  const location = useLocation();

  const navLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Flights", path: "/flights", icon: Plane },
    { name: "Hotels", path: "/hotels", icon: Hotel },
    { name: "Trains", path: "/trains", icon: Train },
    { name: "Buses", path: "/buses", icon: Bus },
    { name: "Cabs", path: "/cabs", icon: Car },
    { name: "Explore", path: "/explore", icon: Compass },
    { name: "Trip Planner", path: "/trip-planner", icon: Map },
  ];

  const token = localStorage.getItem("tripTrekkerToken");

  return (
    <nav className="tt-navbar">
      <Link to="/" className="tt-navbar-brand">
        <span>✈</span> TripTrekker
      </Link>

      <div className="tt-navbar-links">
        {navLinks.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => console.log("Navigating to:", item.path)}
              className={`tt-navbar-link ${
                location.pathname === item.path ? "active" : ""
              }`}
            >
              <Icon size={16} />
              {item.name}
            </Link>
          );
        })}
      </div>

      <Link
        to={token ? "/dashboard" : "/login"}
        className="tt-navbar-account"
      >
        {token ? <LayoutDashboard size={17} /> : <LogIn size={17} />}
        {token ? "Dashboard" : "Login"}
      </Link>
    </nav>
  );
}

export default Navbar;
