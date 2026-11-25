
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowLeft,
  LoaderCircle
} from "lucide-react";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters long.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed. Please try again.");
      }

      // Clear previous login session
      localStorage.removeItem("tripTrekkerToken");
      localStorage.removeItem("tripTrekkerUser");
      sessionStorage.removeItem("tripTrekkerToken");
      sessionStorage.removeItem("tripTrekkerUser");

      // Save login details
      const storage = rememberMe ? localStorage : sessionStorage;

      storage.setItem("tripTrekkerToken", data.token);
      storage.setItem("tripTrekkerUser", JSON.stringify(data.user));

      setMessage("Login successful! Redirecting to your dashboard...");
      setMessageType("success");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);

    } catch (error) {
      setMessage(error.message || "Something went wrong. Please try again.");
      setMessageType("error");
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
            <span>YOUR JOURNEY BEGINS HERE</span>

            <h1>
              Every great journey starts with a single step.
            </h1>

            <p>
              Sign in to explore destinations, manage your trips
              and make your next adventure unforgettable.
            </p>
          </div>

          <div className="auth-brand-bottom">
            Discover more. Travel better.
          </div>
        </div>

        <div className="auth-form-panel">

          <div className="auth-form-content">

            <div className="auth-mobile-logo">
              <Link to="/" className="auth-brand">
                Trip<span>Trekker</span>
              </Link>
            </div>

            <span className="auth-label">WELCOME BACK</span>

            <h2>Login to your account</h2>

            <p className="auth-subtitle">
              Enter your details to continue your journey.
            </p>

            <form onSubmit={handleSubmit}>

              <div className="auth-input-group">
                <label htmlFor="login-email">Email Address</label>

                <div className="auth-input-wrapper">
                  <Mail size={19} />

                  <input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setMessage("");
                    }}
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label htmlFor="login-password">Password</label>

                <div className="auth-input-wrapper">
                  <Lock size={19} />

                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setMessage("");
                    }}
                    minLength={8}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              <div className="auth-form-options">
                <label className="remember-option">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Remember me
                </label>

                <span className="forgot-password">
                  Forgot password?
                </span>
              </div>

              <button
                type="submit"
                className="auth-submit-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login to Account"
                )}
              </button>

              {message && (
                <div
                  className="auth-success-message"
                  role="alert"
                  style={{
                    color: messageType === "error" ? "#c0392b" : "#16834a"
                  }}
                >
                  {message}
                </div>
              )}

            </form>

            <div className="auth-divider">
              <span>NEW TO TRIPTREKKER?</span>
            </div>

            <p className="auth-switch-text">
              Don't have an account?{" "}
              <Link to="/signup">Create Account</Link>
            </p>

            <p className="auth-terms">
              By continuing, you agree to our Terms of Service
              and Privacy Policy.
            </p>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Login;
