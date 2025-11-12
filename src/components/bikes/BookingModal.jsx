"use client";

import { useState } from "react";
import Image from "next/image";
import { uploadDocument } from "@/api/upload";
import { createBooking } from "@/api/bookings";
import { initiateRazorpayPayment } from "@/lib/razorpay";
import { useAuth } from "@/contexts/AuthContext";
import InvoiceModal from "./InvoiceModal";

export default function BookingModal({ bike, isOpen, onClose }) {
  const { user } = useAuth();
  const [fromDate, setFromDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toDate, setToDate] = useState("");
  const [toTime, setToTime] = useState("");
  const [aadharCard, setAadharCard] = useState(null);
  const [drivingLicense, setDrivingLicense] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [bookingResult, setBookingResult] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);

  if (!isOpen) return null;

  // Handle from date change with validation
  const handleFromDateChange = (e) => {
    const selectedDate = e.target.value;
    setFromDate(selectedDate);
    
    // If date is today, validate from time isn't in the past
    const today = new Date().toISOString().split("T")[0];
    if (selectedDate === today && fromTime) {
      const now = new Date();
      const selectedDateTime = new Date(`${selectedDate}T${fromTime}`);
      if (selectedDateTime < now) {
        setFromTime(""); // Clear invalid time
      }
    }
    
    // Update to date minimum if needed
    if (toDate && selectedDate > toDate) {
      setToDate("");
      setToTime("");
    }
  };

  // Handle from time change with validation
  const handleFromTimeChange = (e) => {
    const selectedTime = e.target.value;
    setFromTime(selectedTime);
    
    // If same date as to date, validate to time
    if (fromDate === toDate && toTime) {
      if (selectedTime >= toTime) {
        setToTime(""); // Clear invalid to time
      }
    }
  };

  // Handle to date change
  const handleToDateChange = (e) => {
    const selectedDate = e.target.value;
    setToDate(selectedDate);
    
    // Clear to time if dates are same and need revalidation
    if (selectedDate === fromDate && toTime && fromTime && toTime <= fromTime) {
      setToTime("");
    }
  };

  // Handle to time change with validation
  const handleToTimeChange = (e) => {
    setToTime(e.target.value);
  };

  // Format datetime for API (YYYY-MM-DD HH:mm)
  const formatForAPI = (date, time) => {
    if (!date || !time) return null;
    return `${date} ${time}`;
  };

  // Calculate duration and total cost
  const calculateBooking = () => {
    if (!fromDate || !fromTime || !toDate || !toTime) return { days: 0, totalCost: 0 };

    const from = new Date(`${fromDate}T${fromTime}`);
    const to = new Date(`${toDate}T${toTime}`);
    const diffTime = Math.abs(to - from);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      days: diffDays,
      totalCost: diffDays * bike.pricePerDay,
      fromDateTime: formatForAPI(fromDate, fromTime), // Format: "2025-10-16 13:46"
      toDateTime: formatForAPI(toDate, toTime),
    };
  };

  const { days, totalCost, fromDateTime, toDateTime } = calculateBooking();

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === "aadhar") {
        setAadharCard(file);
      } else {
        setDrivingLicense(file);
      }
    }
  };

  const handleBooking = async () => {
    // Validation
    if (!fromDate || !fromTime || !toDate || !toTime) {
      alert("Please select booking dates and times");
      return;
    }

    if (!aadharCard) {
      alert("Please upload your Aadhar Card");
      return;
    }

    if (!drivingLicense) {
      alert("Please upload your Driving License");
      return;
    }

    if (!user || !user.userId) {
      alert("Please login to book a bike");
      return;
    }

    const from = new Date(`${fromDate}T${fromTime}`);
    const to = new Date(`${toDate}T${toTime}`);
    const now = new Date();

    // Check if from date/time is in the past
    if (from < now) {
      alert("'From' date and time cannot be in the past");
      return;
    }

    if (from >= to) {
      alert("'To' date and time must be after 'From' date and time");
      return;
    }

    setLoading(true);
    setUploadProgress("Uploading documents...");

    try {
      // Format dates for API (YYYY-MM-DD HH:mm format)
      const startDateTime = formatForAPI(fromDate, fromTime);
      const endDateTime = formatForAPI(toDate, toTime);

      // Step 1: Upload Aadhar Card
      setUploadProgress("Uploading Aadhar Card...");
      const aadharUpload = await uploadDocument(aadharCard, user.userId);
      
      if (!aadharUpload.success) {
        throw new Error("Failed to upload Aadhar Card");
      }

      // Step 2: Upload Driving License
      setUploadProgress("Uploading Driving License...");
      const licenseUpload = await uploadDocument(drivingLicense, user.userId);
      
      if (!licenseUpload.success) {
        throw new Error("Failed to upload Driving License");
      }

      setUploadProgress("Processing payment...");
      setLoading(false); // Allow Razorpay modal to open

      // Calculate total amount
      const { totalCost } = calculateBooking();

      // Step 3: Initiate Razorpay Payment
      await initiateRazorpayPayment({
        amount: totalCost,
        description: `Bike Rental: ${bike.bikeName}`,
        prefill: {
          name: user.fullName || user.email,
          email: user.email,
          contact: user.phoneNumber || "",
        },
        onSuccess: async (paymentResponse) => {
          // Payment successful, create booking
          setLoading(true);
          setUploadProgress("Creating booking...");

          try {
            const bookingData = {
              userId: user.userId,
              bikeId: bike.id,
              startDateTime: startDateTime,
              endDateTime: endDateTime,
              paymentId: paymentResponse.razorpay_payment_id,
              totalAmount: totalCost,
              aadharcardUrl: aadharUpload.url,
              drivingLicenseUrl: licenseUpload.url,
            };

            console.log("Creating booking with data:", bookingData);

            const bookingResponse = await createBooking(bookingData);

            if (bookingResponse.success && bookingResponse.booking) {
              setBookingResult(bookingResponse.booking);
              setShowInvoice(true);
              
              // Reset form
              setFromDate("");
              setFromTime("");
              setToDate("");
              setToTime("");
              setAadharCard(null);
              setDrivingLicense(null);
            } else {
              throw new Error(bookingResponse.message || "Booking failed");
            }
          } catch (error) {
            console.error("Booking creation error:", error);
            alert(`Booking failed: ${error.message}\n\nPayment was successful but booking creation failed. Please contact support with Payment ID: ${paymentResponse.razorpay_payment_id}`);
          } finally {
            setLoading(false);
            setUploadProgress("");
          }
        },
        onFailure: (error) => {
          console.error("Payment failed:", error);
          alert("Payment was cancelled or failed. Please try again.");
          setLoading(false);
          setUploadProgress("");
        },
      });

    } catch (error) {
      console.error("Booking error:", error);
      alert(`Error: ${error.message}\n\nPlease try again.`);
      setLoading(false);
      setUploadProgress("");
    }
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split("T")[0];
  
  // Get current time in HH:mm format
  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Check if selected from date is today
  const isFromDateToday = fromDate === today;
  
  // Check if selected to date is same as from date
  const isToDateSameAsFrom = toDate === fromDate;
  
  // Get minimum time for from time input
  const getMinFromTime = () => {
    if (isFromDateToday) {
      return getCurrentTime();
    }
    return undefined;
  };
  
  // Get minimum time for to time input
  const getMinToTime = () => {
    if (isToDateSameAsFrom && fromTime) {
      // If to date is same as from date, to time must be after from time
      const [hours, minutes] = fromTime.split(':');
      const minMinutes = parseInt(minutes) + 1;
      if (minMinutes >= 60) {
        const newHours = (parseInt(hours) + 1) % 24;
        return `${String(newHours).padStart(2, '0')}:00`;
      }
      return `${hours}:${String(minMinutes).padStart(2, '0')}`;
    }
    return undefined;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <h2 className="text-2xl font-bold text-gray-900">Book Bike</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Bike Details */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 border border-gray-200">
            <div className="flex gap-4">
              <div className="relative w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden">
                <Image
                  src={bike.bikeImage}
                  alt={bike.bikeName}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {bike.bikeName}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {bike.brand} • {bike.bikeModel}
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <span>⚡</span>
                    <span className="text-gray-700">
                      {bike.engineCapacity}cc
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>⛽</span>
                    <span className="text-gray-700">{bike.fuelType}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>⚙️</span>
                    <span className="text-gray-700">{bike.transmission}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-700 font-semibold">
                      {bike.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Period */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Select Booking Period
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* From Date & Time */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <span className="text-red-600">🕐</span>
                  From
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={fromDate}
                    onChange={handleFromDateChange}
                    min={today}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all bg-white"
                  />
                  <input
                    type="time"
                    value={fromTime}
                    onChange={handleFromTimeChange}
                    min={getMinFromTime()}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all bg-white"
                  />
                  {isFromDateToday && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <span>⚠️</span>
                      <span>Cannot select past time for today</span>
                    </p>
                  )}
                  {fromDate && fromTime && (
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(`${fromDate}T${fromTime}`).toLocaleString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  )}
                </div>
              </div>

              {/* To Date & Time */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <span className="text-red-600">🕐</span>
                  To
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={toDate}
                    onChange={handleToDateChange}
                    min={fromDate || today}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all bg-white"
                  />
                  <input
                    type="time"
                    value={toTime}
                    onChange={handleToTimeChange}
                    min={getMinToTime()}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all bg-white"
                  />
                  {isToDateSameAsFrom && fromTime && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <span>⚠️</span>
                      <span>Must be after {fromTime}</span>
                    </p>
                  )}
                  {toDate && toTime && (
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(`${toDate}T${toTime}`).toLocaleString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Duration & Cost */}
            {days > 0 && (
              <div className="mt-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-medium">
                    Duration: {days} {days === 1 ? "Day" : "Days"}
                  </span>
                  <span className="text-gray-600 text-sm">
                    ₹{bike.pricePerDay.toFixed(2)} × {days}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-red-300">
                  <span className="text-lg font-bold text-gray-900">
                    Total Cost:
                  </span>
                  <span className="text-2xl font-bold text-red-600">
                    ₹{totalCost.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Description
            </h3>
            <p className="text-gray-600">{bike.description}</p>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Features
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-200">
                {bike.engineCapacity} cc Engine
              </span>
              <span className="px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-200">
                {bike.fuelType}
              </span>
              <span className="px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-200">
                {bike.transmission}
              </span>
              <span className="px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-200">
                Registration: {bike.registrationNumber}
              </span>
            </div>
          </div>

          {/* Document Upload */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Document Upload
              </h3>
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                Required
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Please upload both documents to proceed with booking
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Aadhar Card Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-red-400 transition-colors">
                <input
                  type="file"
                  id="aadhar"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(e, "aadhar")}
                  className="hidden"
                />
                <label htmlFor="aadhar" className="cursor-pointer">
                  <div className="text-5xl mb-3">
                    {aadharCard ? "✅" : "🆔"}
                  </div>
                  <div className="font-semibold text-gray-900 mb-1">
                    Aadhar Card
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {aadharCard
                      ? aadharCard.name
                      : "Upload front side"}
                  </div>
                  {!aadharCard && (
                    <div className="text-xs text-red-600 font-medium">
                      Click to upload
                    </div>
                  )}
                </label>
              </div>

              {/* Driving License Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-red-400 transition-colors">
                <input
                  type="file"
                  id="license"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(e, "license")}
                  className="hidden"
                />
                <label htmlFor="license" className="cursor-pointer">
                  <div className="text-5xl mb-3">
                    {drivingLicense ? "✅" : "🚗"}
                  </div>
                  <div className="font-semibold text-gray-900 mb-1">
                    Driving License
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {drivingLicense
                      ? drivingLicense.name
                      : "Upload front side"}
                  </div>
                  {!drivingLicense && (
                    <div className="text-xs text-red-600 font-medium">
                      Click to upload
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 rounded-b-3xl">
          {/* Upload Progress */}
          {uploadProgress && (
            <div className="mb-3 text-center">
              <p className="text-sm font-medium text-red-600 animate-pulse">
                {uploadProgress}
              </p>
            </div>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className={`flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl transition-all ${
                loading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-50"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleBooking}
              disabled={loading || !fromDate || !fromTime || !toDate || !toTime || !aadharCard || !drivingLicense}
              className={`flex-1 px-6 py-3 font-semibold rounded-xl transition-all ${
                loading || !fromDate || !fromTime || !toDate || !toTime || !aadharCard || !drivingLicense
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 hover:shadow-lg"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Confirm Booking"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        booking={bookingResult}
        isOpen={showInvoice}
        onClose={() => {
          setShowInvoice(false);
          setBookingResult(null);
          onClose(); // Close main booking modal too
        }}
      />
    </div>
  );
}
