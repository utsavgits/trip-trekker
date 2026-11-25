
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";

function Signup() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const updateField = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    setMessage("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.fullName.trim().length < 3) {
      setError("Please enter your full name (at least 3 characters).");
      return;
    }

    if (!/^[6-9][0-9]{9}$/.test(formData.phone)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (!termsAccepted) {
      setError("Please accept the Terms and Conditions.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed. Please try again.");
      }

      // Save authentication details
      localStorage.setItem("tripTrekkerToken", data.token);
      localStorage.setItem("tripTrekkerUser", JSON.stringify(data.user));

      setMessage("Your TripTrekker account has been created successfully!");

      setFormData({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
      });

      setTermsAccepted(false);

    } catch (err) {
      setError(
        err.message || "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <Link to="/" className="auth-back-link">
        <ArrowLeft size={18} />
        Back to Home
      </Link>

      <div className="auth-container">

        <div className="auth-brand-panel">

          <Link to="/" className="auth-brand">
            Trip<span>Trekker</span>
          </Link>

          <div className="auth-brand-content">
            <span>START YOUR ADVENTURE</span>

            <h1>
              Discover new places. Create unforgettable memories.
            </h1>

            <p>
              Create your TripTrekker account and start planning
              journeys that turn your travel dreams into reality.
            </p>
          </div>

          <div className="auth-brand-bottom">
            Your journey, your story.
          </div>

        </div>

        <div className="auth-form-panel">

          <div className="auth-form-content">

            <div className="auth-mobile-logo">
              <Link to="/" className="auth-brand">
                Trip<span>Trekker</span>
              </Link>
            </div>

            <span className="auth-label">JOIN TRIPTREKKER</span>

            <h2>Create your account</h2>

            <p className="auth-subtitle">
              Enter your details to get started.
            </p>

            <form onSubmit={handleSubmit}>

              <div className="auth-input-group">
                <label htmlFor="fullName">Full Name</label>

                <div className="auth-input-wrapper">
                  <User size={19} />

                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={updateField}
                    minLength={3}
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label htmlFor="signup-email">Email Address</label>

                <div className="auth-input-wrapper">
                  <Mail size={19} />

                  <input
                    id="signup-email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={updateField}
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label htmlFor="signup-phone">Mobile Number</label>

                <div className="auth-input-wrapper">
                  <Phone size={19} />

                  <input
                    id="signup-phone"
                    type="tel"
                    name="phone"
                    placeholder="Enter 10-digit mobile number"
                    value={formData.phone}
                    onChange={updateField}
                    maxLength={10}
                    inputMode="numeric"
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label htmlFor="signup-password">Password</label>

                <div className="auth-input-wrapper">
                  <Lock size={19} />

                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={updateField}
                    minLength={8}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              <div className="auth-input-group">
                <label htmlFor="confirm-password">Confirm Password</label>

                <div className="auth-input-wrapper">
                  <Lock size={19} />

                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={updateField}
                    minLength={8}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              <label className="signup-terms-option">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    setError("");
                  }}
                />

                <span>
                  I agree to the Terms of Service and Privacy Policy.
                </span>
              </label>

              {error && (
                <div className="auth-error-message">
                  {error}
                </div>
              )}

              {message && (
                <div className="auth-success-message">
                  {message}
                  <div style={{ marginTop: "10px" }}>
                    <button
                      type="button"
                      className="auth-submit-button"
                      onClick={() => navigate("/dashboard")}
                    >
                      Continue to Dashboard
                    </button>
                  </div>
                </div>
              )}

              {!message && (
                <button
                  type="submit"
                  className="auth-submit-button"
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              )}

            </form>

            <div className="auth-divider">
              <span>ALREADY A MEMBER?</span>
            </div>

            <p className="auth-switch-text">
              Already have an account?{" "}
              <Link to="/login">Login here</Link>
            </p>

            <p className="auth-terms">
              Your information is securely stored using encrypted passwords.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Signup;
