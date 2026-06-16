"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Container from "@/components/common/Container";
import { resetPassword } from "@/api/auth";
import { getUserById, updateUser, uploadProfilePicture } from "@/api/user";
import { getDigilockerAuthUrl, getDigilockerStatus, getDigilockerDocuments, downloadDigilockerDocument } from "@/api/digilocker";

export default function Profile() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // User profile data from API
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [digilockerStatus, setDigilockerStatus] = useState(null);
  const [digilockerLoading, setDigilockerLoading] = useState(true);
  const [digilockerError, setDigilockerError] = useState(null);
  const [digilockerDocuments, setDigilockerDocuments] = useState([]);
  const [digilockerDocumentsLoading, setDigilockerDocumentsLoading] = useState(false);
  const [digilockerDocumentsError, setDigilockerDocumentsError] = useState(null);
  const [downloadingDocumentId, setDownloadingDocumentId] = useState(null);

  // Edit Profile Modal States
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhoneNumber, setEditPhoneNumber] = useState("");
  const [editProfilePicture, setEditProfilePicture] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editProfileLoading, setEditProfileLoading] = useState(false);
  const [editProfileError, setEditProfileError] = useState(null);
  const [editProfileSuccess, setEditProfileSuccess] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Real-time field errors for edit profile
  const [editEmailError, setEditEmailError] = useState("");
  const [editPhoneError, setEditPhoneError] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[6-9]\d{9}$/;

  const handleEditEmailChange = (val) => {
    setEditEmail(val);
    if (val && !emailRegex.test(val)) setEditEmailError("Enter a valid email address");
    else setEditEmailError("");
  };

  const handleEditPhoneChange = (val) => {
    const numeric = val.replace(/\D/g, "");
    setEditPhoneNumber(numeric);
    if (numeric && !phoneRegex.test(numeric)) setEditPhoneError("Enter a valid 10-digit Indian mobile number");
    else setEditPhoneError("");
  };

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

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user || !user.userId) {
        setProfileLoading(false);
        return;
      }

      try {
        setProfileLoading(true);
        setProfileError(null);
        const response = await getUserById(user.userId);
        
        if (response.STS === "200" && response.CONTENT) {
          setProfileData(response.CONTENT);
        } else {
          setProfileError(response.MSG || "Failed to load profile data");
        }
      } catch (error) {
        setProfileError(error.message || "Failed to load profile data");
        console.error("Error fetching user profile:", error);
      } finally {
        setProfileLoading(false);
      }
    };

    if (mounted && isAuthenticated && user) {
      fetchUserProfile();
    }
  }, [mounted, isAuthenticated, user]);

  useEffect(() => {
    const fetchDigilockerStatus = async () => {
      if (!user?.userId) {
        setDigilockerStatus(null);
        setDigilockerLoading(false);
        return;
      }

      try {
        setDigilockerError(null);
        setDigilockerLoading(true);
        const response = await getDigilockerStatus(user.userId);
        setDigilockerStatus(response);
      } catch (error) {
        console.error("Error fetching DigiLocker status:", error);
        setDigilockerError(error?.message || "Failed to fetch DigiLocker status.");
      } finally {
        setDigilockerLoading(false);
      }
    };

    if (mounted && isAuthenticated && user) {
      fetchDigilockerStatus();
    }
  }, [mounted, isAuthenticated, user]);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user?.userId) {
        setDigilockerDocuments([]);
        setDigilockerDocumentsLoading(false);
        return;
      }

      try {
        setDigilockerDocumentsError(null);
        setDigilockerDocumentsLoading(true);
        const response = await getDigilockerDocuments(user.userId);
        
        if (response?.items && Array.isArray(response.items)) {
          setDigilockerDocuments(response.items);
        } else {
          setDigilockerDocuments([]);
        }
      } catch (error) {
        console.error("Error fetching DigiLocker documents:", error);
        setDigilockerDocumentsError(error?.message || "Failed to fetch documents.");
      } finally {
        setDigilockerDocumentsLoading(false);
      }
    };

    if (mounted 
      && isAuthenticated 
      && user 
      // && digilockerStatus?.verified
    ) {
      fetchDocuments();
    }
  }, [mounted, isAuthenticated, user, digilockerStatus]);

  const handleVerifyWithDigilocker = async () => {
    try {
      setDigilockerError(null);
      setDigilockerLoading(true);
      const response = await getDigilockerAuthUrl(user.userId);
      const authUrl = response?.authUrl;
      if (!authUrl) {
        throw new Error("Digilocker authorization URL is unavailable.");
      }
      window.location.href = authUrl;
    } catch (error) {
      console.error("Error starting DigiLocker verification:", error);
      setDigilockerError(error?.message || "Unable to open DigiLocker authorization.");
      setDigilockerLoading(false);
    }
  };

  const handleDownloadDocument = async (documentId) => {
    try {
      setDownloadingDocumentId(documentId);

      const response =
        await downloadDigilockerDocument(documentId);

      if (!response.ok) {
        throw new Error(
          "Failed to download document"
        );
      }

      const blob = await response.blob();

      const url =
        window.URL.createObjectURL(blob);

      window.open(url, "_blank");

    } catch (error) {
      console.error(
        "Error downloading document:",
        error
      );

      alert(
        error?.message ||
        "Failed to download document"
      );
    } finally {
      setDownloadingDocumentId(null);
    }
  };

  const handleOpenEditProfile = () => {
    if (displayData) {
      setEditFirstName(displayData.firstName || "");
      setEditLastName(displayData.lastName || "");
      setEditEmail(displayData.email || "");
      setEditPhoneNumber(displayData.phoneNumber || "");
      setEditProfilePicture(displayData.profilePicture || displayData.profilePic || "");
      setImagePreview(displayData.profilePicture || displayData.profilePic || null);
    }
    setShowEditProfile(true);
  };

  const handleCloseEditProfile = () => {
    setShowEditProfile(false);
    setEditFirstName("");
    setEditLastName("");
    setEditEmail("");
    setEditPhoneNumber("");
    setEditProfilePicture("");
    setSelectedImage(null);
    setImagePreview(null);
    setEditProfileError(null);
    setEditProfileSuccess(null);
    setEditEmailError("");
    setEditPhoneError("");
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the data:image/...;base64, prefix
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();

    if (!emailRegex.test(editEmail)) {
      setEditEmailError("Enter a valid email address");
      return;
    }
    if (!phoneRegex.test(editPhoneNumber)) {
      setEditPhoneError("Enter a valid 10-digit Indian mobile number");
      return;
    }

    setEditProfileLoading(true);
    setEditProfileError(null);
    setEditProfileSuccess(null);

    try {
      let profilePictureUrl = editProfilePicture;

      // If a new image was selected, upload it first
      if (selectedImage) {
        setUploadingImage(true);
        const base64Data = await convertImageToBase64(selectedImage);
        
        const uploadResponse = await uploadProfilePicture({
          fileName: selectedImage.name,
          fileData: base64Data,
          userId: user.userId.toString()
        });

        if (uploadResponse.STS === "200" && uploadResponse.CONTENT) {
          profilePictureUrl = uploadResponse.CONTENT;
        } else {
          throw new Error(uploadResponse.MSG || "Failed to upload image");
        }
        setUploadingImage(false);
      }

      // Update user profile
      const updateData = {
        firstName: editFirstName,
        lastName: editLastName,
        email: editEmail,
        phoneNumber: editPhoneNumber,
        profilePicture: profilePictureUrl
      };

      const response = await updateUser(user.userId, updateData);

      if (response.STS === "200") {
        setEditProfileSuccess("Profile updated successfully!");
        
        // Update profileData with new data
        if (response.CONTENT) {
          setProfileData(response.CONTENT);
        }

        // Close modal after 2 seconds
        setTimeout(() => {
          handleCloseEditProfile();
        }, 2000);
      } else {
        setEditProfileError(response.MSG || "Failed to update profile");
      }
    } catch (error) {
      setEditProfileError(error.message || "Something went wrong");
    } finally {
      setEditProfileLoading(false);
      setUploadingImage(false);
    }
  };

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

  if (loading || !mounted || profileLoading) {
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

  if (profileError) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 pb-12">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <div className="text-red-600 text-5xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Profile</h2>
              <p className="text-gray-600 mb-6">{profileError}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all"
              >
                Retry
              </button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  // Use profileData from API, fallback to context user data
  const displayData = profileData || user;
  const hasDrivingLicense = digilockerDocuments.some((doc) => doc.type === "DRIVING_LICENSE");

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

          <div className="bg-white rounded-2xl shadow-sm p-8 mb-6 border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Digilocker Verification</h2>
                {digilockerLoading ? (
                  <p className="text-sm text-gray-600 mt-2">Checking verification status...</p>
                ) : digilockerError ? (
                  <p className="text-sm text-red-600 mt-2">{digilockerError}</p>
                ) : digilockerStatus?.verified ? (
                  <p className="text-sm text-green-700 mt-2">Verified via DigiLocker{digilockerStatus?.verifiedAt ? ` on ${new Date(digilockerStatus.verifiedAt).toLocaleString()}` : ''}.</p>
                ) : (
                  <p className="text-sm text-gray-600 mt-2">Your account is not verified via DigiLocker. Verification is recommended to unlock all features.</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${digilockerStatus?.verified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {digilockerStatus?.status || (digilockerLoading ? 'Loading' : 'Not Verified')}
                </span>
                {!digilockerStatus?.verified && (
                  <button
                    onClick={handleVerifyWithDigilocker}
                    className="px-5 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                  >
                    Verify via DigiLocker
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile Picture */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {displayData.profilePicture || displayData.profilePic ? (
                    <img
                      src={displayData.profilePicture || displayData.profilePic}
                      alt={`${displayData.firstName} ${displayData.lastName}` || "Profile"}
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  ) : (
                    <span>
                      {displayData.firstName
                        ? displayData.firstName.charAt(0).toUpperCase()
                        : displayData.email
                        ? displayData.email.charAt(0).toUpperCase()
                        : "U"}
                    </span>
                  )}
                </div>
              </div>

              {/* Profile Details */}
              <div className="flex-1 space-y-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-200 text-gray-800">
                    {displayData.firstName || "Not provided"}
                  </div>
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-200 text-gray-800">
                    {displayData.lastName || "Not provided"}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-200 text-gray-800">
                    {displayData.email || "Not provided"}
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-200 text-gray-800">
                    {displayData.phoneNumber || "Not provided"}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg"
                  onClick={handleOpenEditProfile}
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

          {/* DigiLocker Documents Section */}
          {
          // digilockerStatus?.verified && 
          (
            <div className="bg-white rounded-2xl shadow-sm p-8 mb-6 border border-gray-200">
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Your Documents</h2>
                    <p className="text-sm text-gray-600">Documents fetched from DigiLocker</p>
                  </div>
                  {!hasDrivingLicense && (
                    <div className="rounded-xl bg-yellow-100 border border-yellow-300 px-4 py-3 text-sm text-yellow-800">
                      Driving license is required to book rides!
                    </div>
                  )}
                </div>
              </div>

              {digilockerDocumentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto mb-3"></div>
                    <p className="text-gray-600 text-sm">Loading documents...</p>
                  </div>
                </div>
              ) : digilockerDocumentsError ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-red-700 text-sm">{digilockerDocumentsError}</p>
                </div>
              ) : digilockerDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">No documents found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {digilockerDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{doc.name || 'Unknown Document'}</p>
                        <div className="flex gap-4 mt-1 text-xs text-gray-600">
                          {doc.type && <span className="px-2 py-1 bg-gray-100 rounded">Type: {doc.type}</span>}
                          {doc.issuerName && <span className="px-2 py-1 bg-gray-100 rounded">Issuer: {doc.issuerName}</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownloadDocument(doc.id)}
                        disabled={downloadingDocumentId === doc.id}
                        className="ml-4 flex-shrink-0 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {downloadingDocumentId === doc.id ? (
                          <>
                            <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                            Downloading...
                          </>
                        ) : (
                          <>
                            <span>⬇️</span>
                            Download
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Container>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-[100] px-4 overflow-y-auto py-8">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl border-t-4 my-8" style={{ borderTopColor: '#f51717' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold" style={{ color: '#f51717' }}>
                Edit Profile
              </h3>
              <button
                onClick={handleCloseEditProfile}
                className="text-gray-400 hover:text-gray-600 text-3xl font-light transition-colors"
                disabled={editProfileLoading}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEditProfile} className="space-y-5">
              {/* Error Message */}
              {editProfileError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-red-700 text-sm">{editProfileError}</p>
                </div>
              )}

              {/* Success Message */}
              {editProfileSuccess && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <p className="text-green-700 text-sm">{editProfileSuccess}</p>
                </div>
              )}

              {/* Profile Picture Upload */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-4xl font-bold shadow-lg mb-4 overflow-hidden">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile Preview"
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  ) : (
                    <span>
                      {editFirstName ? editFirstName.charAt(0).toUpperCase() : "U"}
                    </span>
                  )}
                </div>
                <label className="cursor-pointer px-4 py-2 text-sm font-medium text-red-600 border-2 border-red-600 rounded-lg hover:bg-red-50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={editProfileLoading}
                  />
                  Change Profile Picture
                </label>
                {uploadingImage && (
                  <p className="text-sm text-gray-600 mt-2">Uploading image...</p>
                )}
              </div>

              {/* First Name & Last Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                    placeholder="Enter first name"
                    required
                    disabled={editProfileLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                    placeholder="Enter last name"
                    required
                    disabled={editProfileLoading}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => handleEditEmailChange(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                    editEmailError ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-red-500"
                  }`}
                  placeholder="Enter email address"
                  required
                  disabled={editProfileLoading}
                />
                {editEmailError && <p className="text-red-500 text-xs mt-1">{editEmailError}</p>}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editPhoneNumber}
                  onChange={(e) => handleEditPhoneChange(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                    editPhoneError ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-red-500"
                  }`}
                  placeholder="Enter phone number"
                  maxLength={10}
                  required
                  disabled={editProfileLoading}
                />
                {editPhoneError && <p className="text-red-500 text-xs mt-1">{editPhoneError}</p>}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseEditProfile}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  disabled={editProfileLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={editProfileLoading || uploadingImage}
                >
                  {editProfileLoading ? "Updating..." : uploadingImage ? "Uploading..." : "Update Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
