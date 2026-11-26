
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./Home";
import Flights from "./pages/Flights";
import Hotels from "./pages/Hotels";
import Trains from "./pages/Trains";
import Buses from "./pages/Buses";
import Cabs from "./pages/Cabs";
import Explore from "./pages/Explore";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import BookingResults from "./pages/BookingResults";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import DestinationDetails from "./pages/DestinationDetails";
import TripPlanner from "./pages/TripPlanner";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/flights" element={<Flights />} />
        <Route path="/hotels" element={<Hotels />} />
        <Route path="/trains" element={<Trains />} />
        <Route path="/buses" element={<Buses />} />
        <Route path="/cabs" element={<Cabs />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/destination/:id" element={<DestinationDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/booking-results" element={<BookingResults />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/trip-planner" element={<TripPlanner />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
