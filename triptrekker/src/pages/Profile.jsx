
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserRound,
  Mail,
  Phone,
  ArrowLeft,
  Save,
  LockKeyhole,
  ShieldCheck,
  LoaderCircle,
  Plane,
  Pencil,
  Eye,
  EyeOff
} from "lucide-react";

import "./Profile.css";

const API_URL = "http://localhost:5000";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getToken = () => {
    return (
      localStorage.getItem("tripTrekkerToken") ||
      sessionStorage.getItem("tripTrekkerToken")
    );
  };

  // GET PROFILE
  useEffect(() => {
    const fetchProfile = async () => {
      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load profile.");
        }

        setUser(data.user);

        setFormData({
          name: data.user.name || "",
          email: data.user.email || "",
          phone: data.user.phone || ""
        });

        localStorage.setItem(
          "tripTrekkerUser",
          JSON.stringify(data.user)
        );

        sessionStorage.setItem(
          "tripTrekkerUser",
          JSON.stringify(data.user)
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // HANDLE INPUT
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // UPDATE PROFILE
  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Profile update failed.");
      }

      setUser(data.user);

      setFormData({
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone
      });

      localStorage.setItem(
        "tripTrekkerUser",
        JSON.stringify(data.user)
      );

      sessionStorage.setItem(
        "tripTrekkerUser",
        JSON.stringify(data.user)
      );

      setEditMode(false);
      setMessage("Your profile has been updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // CHANGE PASSWORD
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (passwordData.newPassword.length < 8) {
      setError("New password must contain at least 8 characters.");
      return;
    }

    setChangingPassword(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`
          },
          body: JSON.stringify(passwordData)
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Password update failed.");
      }

      setPasswordData({
        currentPassword: "",
        newPassword: ""
      });

      setMessage("Password changed successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <LoaderCircle className="loading-icon" size={32} />
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">

        <Link to="/dashboard" className="profile-back-link">
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <div className="profile-heading">
          <div>
            <span className="profile-eyebrow">
              ACCOUNT SETTINGS
            </span>
            <h1>My Profile</h1>
            <p>Manage your personal information and account security.</p>
          </div>

          <div className="profile-heading-icon">
            <UserRound size={30} />
          </div>
        </div>

        {message && (
          <div className="profile-message success">
            <ShieldCheck size={18} />
            {message}
          </div>
        )}

        {error && (
          <div className="profile-message error">
            {error}
          </div>
        )}

        <div className="profile-layout">

          {/* PROFILE INFORMATION */}
          <section className="profile-card">
            <div className="profile-card-header">
              <div>
                <span className="profile-card-label">
                  PERSONAL DETAILS
                </span>
                <h2>Basic Information</h2>
              </div>

              {!editMode && (
                <button
                  className="profile-edit-btn"
                  onClick={() => {
                    setError("");
                    setMessage("");
                    setEditMode(true);
                  }}
                >
                  <Pencil size={15} />
                  Edit Profile
                </button>
              )}
            </div>

            <div className="profile-avatar-section">
              <div className="profile-avatar">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <div>
                <h3>{user.name}</h3>
                <p>TripTrekker Member</p>
              </div>
            </div>

            <form onSubmit={handleProfileUpdate}>
              <div className="profile-form-group">
                <label>Full Name</label>
                <div className="profile-input-wrapper">
                  <UserRound size={18} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!editMode}
                    required
                    minLength={3}
                  />
                </div>
              </div>

              <div className="profile-form-group">
                <label>Email Address</label>
                <div className="profile-input-wrapper">
                  <Mail size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!editMode}
                    required
                  />
                </div>
              </div>

              <div className="profile-form-group">
                <label>Phone Number</label>
                <div className="profile-input-wrapper">
                  <Phone size={18} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!editMode}
                    required
                    maxLength={10}
                  />
                </div>
              </div>

              {editMode && (
                <div className="profile-form-actions">
                  <button
                    type="button"
                    className="profile-cancel-btn"
                    onClick={() => {
                      setFormData({
                        name: user.name,
                        email: user.email,
                        phone: user.phone
                      });
                      setEditMode(false);
                      setError("");
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="profile-save-btn"
                    disabled={saving}
                  >
                    <Save size={17} />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </form>
          </section>

          {/* PASSWORD SECURITY */}
          <section className="profile-card security-card">
            <div className="profile-card-header">
              <div>
                <span className="profile-card-label">
                  ACCOUNT SECURITY
                </span>
                <h2>Change Password</h2>
              </div>

              <div className="security-icon">
                <LockKeyhole size={22} />
              </div>
            </div>

            <p className="security-description">
              Keep your account secure by using a strong password.
            </p>

            <form onSubmit={handlePasswordUpdate}>
              <div className="profile-form-group">
                <label>Current Password</label>
                <div className="profile-input-wrapper">
                  <LockKeyhole size={18} />
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    required
                  />
                </div>
              </div>

              <div className="profile-form-group">
                <label>New Password</label>
                <div className="profile-input-wrapper">
                  <LockKeyhole size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    minLength={8}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="profile-save-btn password-submit"
                disabled={changingPassword}
              >
                <LockKeyhole size={17} />
                {changingPassword ? "Updating..." : "Update Password"}
              </button>
            </form>
          </section>

        </div>

        <div className="profile-footer-note">
          <Plane size={17} />
          <span>Your next journey begins with a well-managed account.</span>
        </div>

      </div>
    </div>
  );
}

export default Profile;
