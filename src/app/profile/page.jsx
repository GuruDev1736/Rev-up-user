"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Container from "@/components/common/Container";
import { resetPassword } from "@/api/auth";

export default function Profile() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Change Password Modal States
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState(null);
  const [changePasswordSuccess, setChangePasswordSuccess] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [mounted, loading, isAuthenticated, router]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangePasswordLoading(true);
    setChangePasswordError(null);
    setChangePasswordSuccess(null);

    // Validation
    if (!newPassword || !confirmNewPassword) {
      setChangePasswordError("Please fill in all fields");
      setChangePasswordLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setChangePasswordError("Passwords do not match");
      setChangePasswordLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setChangePasswordError("Password must be at least 6 characters");
      setChangePasswordLoading(false);
      return;
    }

    try {
      const response = await resetPassword(user.email, newPassword);
      
      if (response.STS === "200") {
        setChangePasswordSuccess("Password changed successfully!");
        // Clear form
        setNewPassword("");
        setConfirmNewPassword("");
        
        // Close modal after 2 seconds
        setTimeout(() => {
          setShowChangePassword(false);
          setChangePasswordSuccess(null);
        }, 2000);
      } else {
        setChangePasswordError(response.MSG || "Failed to change password");
      }
    } catch (error) {
      setChangePasswordError(error.message || "Something went wrong");
    } finally {
      setChangePasswordLoading(false);
    }
  };

  const handleCloseChangePassword = () => {
    setShowChangePassword(false);
    setNewPassword("");
    setConfirmNewPassword("");
    setChangePasswordError(null);
    setChangePasswordSuccess(null);
  };

  if (loading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12">
      <Container>
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-6 border-t-4" style={{ borderTopColor: '#f51717' }}>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#f51717' }}>
              My Profile
            </h1>
            <p className="text-gray-600">
              Manage your account information
            </p>
          </div>

          {/* Profile Information */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile Picture */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {user.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt={user.fullName || "Profile"}
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  ) : (
                    <span>
                      {user.fullName
                        ? user.fullName.charAt(0).toUpperCase()
                        : user.firstName
                        ? user.firstName.charAt(0).toUpperCase()
                        : user.email
                        ? user.email.charAt(0).toUpperCase()
                        : "U"}
                    </span>
                  )}
                </div>
                <button
                  className="mt-4 px-4 py-2 text-sm font-medium text-red-600 border-2 border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  onClick={() => alert("Profile picture update coming soon!")}
                >
                  Change Photo
                </button>
              </div>

              {/* Profile Details */}
              <div className="flex-1 space-y-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-200 text-gray-800">
                    {user.firstName || "Not provided"}
                  </div>
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-200 text-gray-800">
                    {user.lastName || "Not provided"}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-200 text-gray-800">
                    {user.email || "Not provided"}
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-200 text-gray-800">
                    {user.phoneNumber || "Not provided"}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg"
                  onClick={() => alert("Edit profile coming soon!")}
                >
                  Edit Profile
                </button>
                <button
                  className="flex-1 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                  onClick={() => setShowChangePassword(true)}
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>

          {/* Account Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">0</div>
              <div className="text-gray-600 text-sm font-medium">Active Bookings</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">0</div>
              <div className="text-gray-600 text-sm font-medium">Total Rides</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">0</div>
              <div className="text-gray-600 text-sm font-medium">Favorites</div>
            </div>
          </div>
        </div>
      </Container>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-[100] px-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border-t-4" style={{ borderTopColor: '#f51717' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold" style={{ color: '#f51717' }}>
                Change Password
              </h3>
              <button
                onClick={handleCloseChangePassword}
                className="text-gray-400 hover:text-gray-600 text-3xl font-light transition-colors"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-5">
              {/* Error Message */}
              {changePasswordError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-red-700 text-sm">{changePasswordError}</p>
                </div>
              )}

              {/* Success Message */}
              {changePasswordSuccess && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <p className="text-green-700 text-sm">{changePasswordSuccess}</p>
                </div>
              )}

              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                    placeholder="Enter new password"
                    disabled={changePasswordLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                    placeholder="Confirm new password"
                    disabled={changePasswordLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseChangePassword}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  disabled={changePasswordLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={changePasswordLoading}
                >
                  {changePasswordLoading ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
