
import { useEffect, useState } from "react";
import {
  MapPin,
  CalendarDays,
  Users,
  Wallet,
  Mountain,
  Heart,
  Camera,
  Utensils,
  Compass,
  Plus,
} from "lucide-react";

function TripPlanner() {
  const [destinations, setDestinations] = useState([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);
  const [destinationError, setDestinationError] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    destinationId: "",
    startDate: "",
    endDate: "",
    travellers: "2",
    budget: "",
    travelStyle: "Adventure",
    interests: [],
  });

  // Fetch destinations from MySQL through backend API
  useEffect(() => {
    const controller = new AbortController();

    const fetchDestinations = async () => {
      try {
        setLoadingDestinations(true);
        setDestinationError("");

        const response = await fetch(
          "http://localhost:5000/api/destinations",
          { signal: controller.signal }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load destinations.");
        }

        setDestinations(data.destinations || []);
      } catch (error) {
        if (error.name !== "AbortError") {
          setDestinationError(error.message || "Something went wrong.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingDestinations(false);
        }
      }
    };

    fetchDestinations();

    return () => controller.abort();
  }, []);

  const interestsList = [
    { name: "Adventure", icon: Mountain },
    { name: "Nature", icon: Heart },
    { name: "Photography", icon: Camera },
    { name: "Food", icon: Utensils },
    { name: "Sightseeing", icon: Compass },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSubmitError("");
    setSuccessMessage("");
  };

  const toggleInterest = (interest) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((item) => item !== interest)
        : [...prev.interests, interest],
    }));

    setSubmitError("");
    setSuccessMessage("");
  };

  // Save trip to MySQL through backend API
  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitError("");
    setSuccessMessage("");

    if (formData.endDate < formData.startDate) {
      setSubmitError("End date cannot be earlier than start date.");
      return;
    }

    const token = localStorage.getItem("tripTrekkerToken");

    if (!token) {
      setSubmitError("Please login first to create your trip.");
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch("http://localhost:5000/api/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to create trip.");
      }

      setSuccessMessage("Your trip has been saved successfully!");

      console.log("Saved Trip:", data.trip);

      setFormData({
        destinationId: "",
        startDate: "",
        endDate: "",
        travellers: "2",
        budget: "",
        travelStyle: "Adventure",
        interests: [],
      });

    } catch (error) {
      console.error("Create Trip Error:", error);
      setSubmitError(error.message || "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="trip-planner-page">
      <section className="trip-planner-hero">
        <div className="trip-planner-hero-content">
          <span className="trip-planner-tag">YOUR JOURNEY STARTS HERE</span>

          <h1>
            Plan Your Perfect <span>Trip</span>
          </h1>

          <p>
            Create your dream journey with personalized travel plans,
            exciting destinations and memorable experiences.
          </p>

          <a href="#create-trip" className="trip-planner-cta">
            Start Planning <Plus size={18} />
          </a>
        </div>
      </section>

      <section className="trip-planner-form-section" id="create-trip">
        <div className="trip-planner-form-heading">
          <span>LET'S GET STARTED</span>
          <h2>Create Your Trip</h2>
          <p>Tell us a little about your next adventure.</p>
        </div>

        <form className="trip-planner-form" onSubmit={handleSubmit}>
          <div className="trip-form-grid">
            <div className="trip-form-group">
              <label>
                <MapPin size={17} /> Destination
              </label>

              <select
                name="destinationId"
                value={formData.destinationId}
                onChange={handleChange}
                required
                disabled={loadingDestinations || destinations.length === 0}
              >
                <option value="">
                  {loadingDestinations
                    ? "Loading destinations..."
                    : "Select your destination"}
                </option>

                {destinations.map((destination) => (
                  <option key={destination.id} value={destination.id}>
                    {destination.name}, {destination.state}
                  </option>
                ))}
              </select>

              {destinationError && (
                <small className="trip-destination-error">
                  {destinationError}
                </small>
              )}

              {!loadingDestinations &&
                !destinationError &&
                destinations.length === 0 && (
                  <small className="trip-destination-error">
                    No destinations available right now.
                  </small>
                )}
            </div>

            <div className="trip-form-group">
              <label>
                <Users size={17} /> Number of Travellers
              </label>

              <select
                name="travellers"
                value={formData.travellers}
                onChange={handleChange}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => (
                  <option key={number} value={number}>
                    {number} {number === 1 ? "Traveller" : "Travellers"}
                  </option>
                ))}
              </select>
            </div>

            <div className="trip-form-group">
              <label>
                <CalendarDays size={17} /> Start Date
              </label>

              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div className="trip-form-group">
              <label>
                <CalendarDays size={17} /> End Date
              </label>

              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={
                  formData.startDate ||
                  new Date().toISOString().split("T")[0]
                }
                required
              />
            </div>

            <div className="trip-form-group">
              <label>
                <Wallet size={17} /> Total Budget (₹)
              </label>

              <input
                type="number"
                name="budget"
                placeholder="e.g. 25000"
                min="1"
                value={formData.budget}
                onChange={handleChange}
                required
              />
            </div>

            <div className="trip-form-group">
              <label>
                <Compass size={17} /> Travel Style
              </label>

              <select
                name="travelStyle"
                value={formData.travelStyle}
                onChange={handleChange}
              >
                <option value="Adventure">Adventure</option>
                <option value="Relaxation">Relaxation</option>
                <option value="Family">Family Vacation</option>
                <option value="Romantic">Romantic Getaway</option>
                <option value="Solo">Solo Travel</option>
                <option value="Luxury">Luxury Travel</option>
              </select>
            </div>
          </div>

          <div className="trip-interests-section">
            <h3>What are you interested in?</h3>
            <p>Select the experiences you would love to include.</p>

            <div className="trip-interests-grid">
              {interestsList.map((interest) => {
                const Icon = interest.icon;
                const selected = formData.interests.includes(interest.name);

                return (
                  <button
                    type="button"
                    key={interest.name}
                    className={`trip-interest-card ${
                      selected ? "selected" : ""
                    }`}
                    onClick={() => toggleInterest(interest.name)}
                  >
                    <Icon size={21} />
                    <span>{interest.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {submitError && (
            <p className="trip-destination-error">{submitError}</p>
          )}

          {successMessage && (
            <p className="trip-success-message">{successMessage}</p>
          )}

          <button
            type="submit"
            className="trip-submit-button"
            disabled={
              loadingDestinations ||
              destinations.length === 0 ||
              isSaving
            }
          >
            {isSaving ? "Saving Your Trip..." : "Create My Trip"}
            {!isSaving && <Compass size={19} />}
          </button>
        </form>
      </section>
    </main>
  );
}

export default TripPlanner;
