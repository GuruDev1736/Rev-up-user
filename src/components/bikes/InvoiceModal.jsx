"use client";

import { downloadInvoice } from "@/api/bookings";

export default function InvoiceModal({ booking, isOpen, onClose }) {
  if (!isOpen || !booking) return null;

  const handleDownload = () => {
    if (booking.invoiceUrl) {
      downloadInvoice(booking.invoiceUrl, booking.id);
    }
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "N/A";
    const date = new Date(dateTimeStr.replace(" ", "T"));
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-5xl mb-2">🎉</div>
              <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
              <p className="text-green-100 text-sm mt-1">
                Your bike is reserved
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-green-100 text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Booking Details */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📋</span>
              Booking Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Booking ID</p>
                <p className="font-semibold text-gray-900">#{booking.id}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Status</p>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                  {booking.bookingStatus}
                </span>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Payment Status</p>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                  {booking.paymentStatus}
                </span>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Payment ID</p>
                <p className="font-mono text-xs text-gray-900">
                  {booking.paymentId}
                </p>
              </div>
            </div>
          </div>

          {/* Bike Details */}
          {booking.bike && (
            <div className="border border-gray-200 rounded-2xl p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>🏍️</span>
                Bike Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bike Name</span>
                  <span className="font-semibold text-gray-900">
                    {booking.bike.bikeName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Model</span>
                  <span className="font-semibold text-gray-900">
                    {booking.bike.bikeModel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Brand</span>
                  <span className="font-semibold text-gray-900">
                    {booking.bike.brand}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available Quantity</span>
                  <span className={`font-semibold ${
                    booking.bike.quantity > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {booking.bike.quantity || 0}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Rental Period */}
          <div className="border border-gray-200 rounded-2xl p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>📅</span>
              Rental Period
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Start Date & Time</p>
                <p className="font-semibold text-gray-900">
                  {formatDateTime(booking.startDateTime)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">End Date & Time</p>
                <p className="font-semibold text-gray-900">
                  {formatDateTime(booking.endDateTime)}
                </p>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Duration</span>
                  <span className="font-semibold text-gray-900">
                    {booking.totalDays > 0 && `${booking.totalDays} Days `}
                    {booking.totalHours > 0 && `${booking.totalHours} Hours`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>💰</span>
              Payment Summary
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Amount Paid</span>
                <span className="font-semibold text-gray-900">
                  ₹{booking.totalAmount?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-green-300">
                <span className="text-lg font-bold text-gray-900">
                  Total Amount
                </span>
                <span className="text-2xl font-bold text-green-600">
                  ₹{booking.totalAmount?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Documents */}
          {(booking.aadharcardUrl || booking.drivingLicenseUrl) && (
            <div className="border border-gray-200 rounded-2xl p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>📄</span>
                Uploaded Documents
              </h3>
              <div className="space-y-2 text-sm">
                {booking.aadharcardUrl && (
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-gray-700">Aadhar Card</span>
                  </div>
                )}
                {booking.drivingLicenseUrl && (
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-gray-700">Driving License</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 rounded-b-3xl">
          <div className="flex gap-3">
            {booking.invoiceUrl && (
              <button
                onClick={handleDownload}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
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
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
