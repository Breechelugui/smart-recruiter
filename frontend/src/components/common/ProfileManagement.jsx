import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { logout } from "../../features/auth/authSlice";
import apiClient from "../../services/apiClient";
import PageWrapper from "../layout/PageWrapper";
import BackToDashboardButton from "./BackToDashboardButton";

export default function ProfileManagement() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    username: "",
    full_name: "",
    email: "",
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  // Profile picture state
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.username || "",
        full_name: user.full_name || "",
        email: user.email || "",
      });
      // Construct full URL for profile picture
      const baseURL = import.meta.env.VITE_API_URL || "https://smart-recruiter-backend-9uv4.onrender.com";
      const profilePicUrl = user.profile_picture 
        ? (user.profile_picture.startsWith('http') 
            ? user.profile_picture 
            : `${baseURL}${user.profile_picture}`)
        : "";
      setPreviewUrl(profilePicUrl);
    }
  }, [user]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.put("/api/users/profile", profileForm);
      showMessage("success", "Profile updated successfully!");
      
      // Update user in Redux store
      dispatch({ type: "auth/setUser", payload: response.data });
    } catch (error) {
      showMessage("error", error.response?.data?.detail || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.post("/api/users/change-password", passwordForm);
      showMessage("success", "Password changed successfully!");
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      showMessage("error", error.response?.data?.detail || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showMessage("error", "Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showMessage("error", "File size must be less than 5MB");
      return;
    }

    setProfilePicture(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadProfilePicture = async () => {
    if (!profilePicture) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", profilePicture);

    try {
      const response = await apiClient.post("/api/users/upload-profile-picture", formData, {
        // Don't set Content-Type for FormData - let browser set it with boundary
      });
      
      showMessage("success", "Profile picture uploaded successfully!");
      
      // Construct full URL for the uploaded picture
      const baseURL = import.meta.env.VITE_API_URL || "https://smart-recruiter-backend-9uv4.onrender.com";
      const fullProfilePicUrl = response.data.profile_picture.startsWith('http')
        ? response.data.profile_picture
        : `${baseURL}${response.data.profile_picture}`;
      
      setPreviewUrl(fullProfilePicUrl);
      
      // Update user in Redux store with full URL
      dispatch({ type: "auth/setUser", payload: { ...user, profile_picture: fullProfilePicUrl } });
      setProfilePicture(null);
    } catch (error) {
      console.error("Upload error:", error);
      showMessage("error", error.response?.data?.detail || "Failed to upload profile picture");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Profile Management</h1>
              <p className="text-gray-400">Manage your account settings and preferences</p>
            </div>
            <BackToDashboardButton />
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              message.type === "success"
                ? "bg-green-900/50 border-green-700 text-green-300"
                : "bg-red-900/50 border-red-700 text-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-700">
            <nav className="flex">
              {["profile", "security", "picture"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 px-6 text-sm font-medium border-b-2 transition-all ${
                    activeTab === tab
                      ? "border-purple-500 text-purple-400 bg-purple-500/10"
                      : "border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-700/50"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={profileForm.username}
                    onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Updating..." : "Update Profile"}
                </button>
              </form>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                    required
                    minLength="6"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                    required
                    minLength="6"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Changing..." : "Change Password"}
                </button>
              </form>
            )}

            {/* Profile Picture Tab */}
            {activeTab === "picture" && (
              <div className="space-y-6">
                <div className="flex items-center space-x-6">
                  {/* Current Profile Picture */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-700 border-4 border-gray-600">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Profile Picture
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureUpload}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                      />
                      <p className="mt-2 text-sm text-gray-400">
                        Upload a profile picture (JPG, PNG, GIF - Max 5MB)
                      </p>
                    </div>

                    {profilePicture && (
                      <button
                        onClick={uploadProfilePicture}
                        disabled={loading}
                        className="mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Uploading..." : "Upload Picture"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-purple-300 mb-2">Profile Picture Guidelines</h3>
                  <ul className="text-sm text-purple-400 space-y-1">
                    <li>• Use a clear, recent photo of yourself</li>
                    <li>• Ensure good lighting and neutral background</li>
                    <li>• File size should be less than 5MB</li>
                    <li>• Recommended dimensions: 400x400 pixels</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
