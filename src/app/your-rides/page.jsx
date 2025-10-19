"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserBookings, downloadInvoice, cancelBooking } from "@/api/bookings";
import { useRouter } from "next/navigation";
import Image from "next/image";
import fallbackImage from "@/app/images/house.jpg";

// Cancel Booking Dialog Component
const CancelDialog = ({ isOpen, onClose, onConfirm, bookingId }) => {
  const [reason, setReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const handleConfirm = async () => {
    if (!reason.trim()) {
      alert("Please provide a cancellation reason");
      return;
    }

    setCancelling(true);
    try {
      await onConfirm(reason);
      setReason("");
      onClose();
    } catch (error) {
      alert(error.message || "Failed to cancel booking");
    } finally {
      setCancelling(false);
    }
  };

  const handleClose = () => {
    if (!cancelling) {
      setReason("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Cancel Booking</h3>
          <button
            onClick={handleClose}
            disabled={cancelling}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Warning Message */}
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-red-800">
                Are you sure you want to cancel this booking?
              </p>
              <p className="text-xs text-red-600 mt-1">
                This action cannot be undone. Please provide a reason for cancellation.
              </p>
            </div>
          </div>
        </div>

        {/* Booking ID */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Booking ID: <span className="font-semibold text-gray-900">#{bookingId}</span>
          </p>
        </div>

        {/* Reason Input */}
        <div className="mb-6">
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
            Cancellation Reason *
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide a reason for cancellation..."
            rows={4}
            disabled={cancelling}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            required
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={cancelling}
            className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Keep Booking
          </button>
          <button
            onClick={handleConfirm}
            disabled={cancelling || !reason.trim()}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {cancelling ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Cancelling...
              </>
            ) : (
              "Cancel Booking"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Booking Status Badge Component
const StatusBadge = ({ status }) => {
  const getStatusStyle = () => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 border-green-200";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-purple-100 text-purple-800 border-purple-200";
    }
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyle()}`}
    >
      {status}
    </span>
  );
};

// Booking Card Component
const BookingCard = ({ booking, onBookingCancelled, showCancelButton }) => {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const startDate = new Date(booking.startDateTime);
  const endDate = new Date(booking.endDateTime);
  const now = new Date();

  const formatDate = (date) => {
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const calculateDuration = () => {
    const diff = endDate - startDate;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    if (days > 0) {
      return `${days}d ${remainingHours}h`;
    }
    return `${hours}h`;
  };

  const handleDownloadInvoice = () => {
    if (booking.invoiceUrl) {
      downloadInvoice(booking.invoiceUrl, booking.id);
    }
  };

  const handleCancelBooking = async (reason) => {
    await cancelBooking(booking.id, reason);
    if (onBookingCancelled) {
      onBookingCancelled();
    }
  };

  return (
    <>
      <CancelDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelBooking}
        bookingId={booking.id}
      />
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="md:flex">
        {/* Bike Image */}
        <div className="md:w-1/3 relative h-48 md:h-auto">
          <Image
            src={booking.bike?.bikeImage || fallbackImage}
            alt={booking.bike?.bikeName || "Bike"}
            fill
            className="object-cover"
          />
          <div className="absolute top-3 right-3">
            <StatusBadge status={booking.bookingStatus} />
          </div>
        </div>

        {/* Booking Details */}
        <div className="md:w-2/3 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {booking.bike?.bikeName || "N/A"}
              </h3>
              <p className="text-sm text-gray-600">
                {booking.bike?.brand} • {booking.bike?.bikeModel}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Booking ID</p>
              <p className="text-sm font-semibold text-gray-900">
                #{booking.id}
              </p>
            </div>
          </div>

          {/* Rental Period */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Pickup</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatDate(startDate)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Return</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatDate(endDate)}
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">⏱️</span>
              <span className="text-gray-700">Duration: {calculateDuration()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">💰</span>
              <span className="text-gray-700">
                Total: ₹{booking.totalAmount?.toFixed(2)}
              </span>
            </div>
            {booking.paymentId && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">💳</span>
                <span className="text-gray-700 text-xs">
                  {booking.paymentId}
                </span>
              </div>
            )}
          </div>

          {/* Documents Section */}
          {(booking.aadharcardUrl || booking.drivingLicenseUrl) && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-2 font-semibold">
                Uploaded Documents
              </p>
              <div className="flex flex-wrap gap-3">
                {booking.aadharcardUrl && (
                  <a
                    href={booking.aadharcardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-sm group"
                  >
                    <svg
                      className="w-4 h-4 text-gray-600 group-hover:text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <span className="text-gray-700 group-hover:text-blue-700">
                      View Aadhar Card
                    </span>
                  </a>
                )}
                {booking.drivingLicenseUrl && (
                  <a
                    href={booking.drivingLicenseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-sm group"
                  >
                    <svg
                      className="w-4 h-4 text-gray-600 group-hover:text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <span className="text-gray-700 group-hover:text-blue-700">
                      View Driving License
                    </span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            {showCancelButton && (
              <button
                onClick={() => setShowCancelDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition text-sm font-semibold"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Cancel Booking
              </button>
            )}
            {booking.invoiceUrl && (
              <button
                onClick={handleDownloadInvoice}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download Invoice
              </button>
            )}
            {booking.bike?.place && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm">
                <span className="text-gray-500">📍</span>
                <span className="text-gray-700">
                  {booking.bike.place.placeName}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default function YourRidesPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("CURRENT"); // CURRENT, UPCOMING, HISTORY
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user?.userId) {
          throw new Error("User ID not found");
        }

        const data = await getUserBookings(user.userId);
        setBookings(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setError(error.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, isAuthenticated, router]);

  // Refresh bookings after cancellation
  const handleBookingCancelled = async () => {
    try {
      if (!user?.userId) return;
      const data = await getUserBookings(user.userId);
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error refreshing bookings:", error);
    }
  };

  // Categorize bookings based on status
  const categorizeBookings = () => {
    return bookings.reduce(
      (acc, booking) => {
        // Use bookingStatus from API response
        const status = booking.bookingStatus?.toUpperCase();

        // History: CANCELLED or COMPLETED
        if (status === "CANCELLED" || status === "COMPLETED") {
          acc.history.push(booking);
        }
        // Current: ACTIVE
        else if (status === "ACTIVE") {
          acc.current.push(booking);
        }
        // Upcoming: CONFIRMED or PENDING
        else if (status === "CONFIRMED" || status === "PENDING") {
          acc.upcoming.push(booking);
        }
        // Default: put unknown statuses in history
        else {
          acc.history.push(booking);
        }

        return acc;
      },
      { current: [], upcoming: [], history: [] }
    );
  };

  const categorizedBookings = categorizeBookings();
  const currentBookings = categorizedBookings.current;
  const upcomingBookings = categorizedBookings.upcoming;
  const historyBookings = categorizedBookings.history;

  const getActiveBookings = () => {
    switch (activeTab) {
      case "CURRENT":
        return currentBookings;
      case "UPCOMING":
        return upcomingBookings;
      case "HISTORY":
        return historyBookings;
      default:
        return [];
    }
  };

  const activeBookings = getActiveBookings();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="bg-gray-300 h-10 rounded-lg w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="bg-gray-200 h-6 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-lg p-6 animate-pulse"
              >
                <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                <div className="bg-gray-200 h-6 rounded w-3/4 mb-2"></div>
                <div className="bg-gray-200 h-4 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-32 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center p-10 bg-red-50 rounded-2xl border-2 border-red-200">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-red-800 mb-2">
              Oops! Something went wrong
            </h3>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition shadow-lg hover:shadow-xl"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-32 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Your Rides 🏍️
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your current, upcoming, and past bookings
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          <button
            onClick={() => setActiveTab("CURRENT")}
            className={`px-6 py-3 rounded-full font-semibold transition-all ${
              activeTab === "CURRENT"
                ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200"
            }`}
          >
            Current
            {currentBookings.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {currentBookings.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("UPCOMING")}
            className={`px-6 py-3 rounded-full font-semibold transition-all ${
              activeTab === "UPCOMING"
                ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200"
            }`}
          >
            Upcoming
            {upcomingBookings.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {upcomingBookings.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("HISTORY")}
            className={`px-6 py-3 rounded-full font-semibold transition-all ${
              activeTab === "HISTORY"
                ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200"
            }`}
          >
            History
            {historyBookings.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {historyBookings.length}
              </span>
            )}
          </button>
        </div>

        {/* Bookings List */}
        {activeBookings.length > 0 ? (
          <div className="space-y-6">
            {activeBookings.map((booking) => (
              <BookingCard 
                key={booking.id} 
                booking={booking} 
                onBookingCancelled={handleBookingCancelled}
                showCancelButton={activeTab === "UPCOMING"}
              />
            ))}
          </div>
        ) : (
          <div className="text-center p-12 bg-white rounded-2xl border-2 border-dashed border-gray-300">
            <div className="text-gray-400 text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              No {activeTab.toLowerCase()} bookings
            </h3>
            <p className="text-gray-500 mb-6">
              {activeTab === "CURRENT" &&
                "You don't have any active bookings at the moment."}
              {activeTab === "UPCOMING" &&
                "You don't have any upcoming bookings scheduled."}
              {activeTab === "HISTORY" &&
                "Your booking history will appear here."}
            </p>
            <button
              onClick={() => router.push("/")}
              className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition shadow-lg hover:shadow-xl"
            >
              Browse Bikes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
