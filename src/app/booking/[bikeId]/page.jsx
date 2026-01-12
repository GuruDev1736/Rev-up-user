"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { uploadDocument } from "@/api/upload";
import { createBooking, checkActiveBooking } from "@/api/bookings";
import { getBikeById } from "@/api/bikes";
import { applyCoupon, submitCouponUsage } from "@/api/coupons";
import { initiateRazorpayPayment } from "@/lib/razorpay";
import { createRazorpayOrder } from "@/api/razorpay";
import { useAuth } from "@/contexts/AuthContext";
import Container from "@/components/common/Container";
import InvoiceModal from "@/components/bikes/InvoiceModal";

// Safe image source validator
const getSafeImageSrc = (src) => {
  if (!src || typeof src !== 'string' || src.trim() === '') {
    return null;
  }

  const trimmedSrc = src.trim();

  // Accept: absolute URLs (http/https), or paths starting with /
  if (trimmedSrc.startsWith('http://') || 
      trimmedSrc.startsWith('https://') || 
      trimmedSrc.startsWith('/')) {
    return trimmedSrc;
  }

  // For relative paths without leading slash (like "img1.jpg"), return null
  console.warn('Invalid bike image path:', trimmedSrc);
  return null;
};

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const bikeId = params.bikeId;
  
  // Check if booking from approved request
  const fromRequest = searchParams.get('fromRequest') === 'true';

  const [bike, setBike] = useState(null);
  const [pricingPeriod, setPricingPeriod] = useState("day");
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
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedDeposit, setAcceptedDeposit] = useState(false);
  const [aadharVerified, setAadharVerified] = useState(false);
  const [licenseVerified, setLicenseVerified] = useState(false);
  const [aadharDigiLockerData, setAadharDigiLockerData] = useState(null);
  const [licenseDigiLockerData, setLicenseDigiLockerData] = useState(null);
  const [currentAddress, setCurrentAddress] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");
  const [sameAsCurrentAddress, setSameAsCurrentAddress] = useState(false);
  const [alternateMobile, setAlternateMobile] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [hasActiveBooking, setHasActiveBooking] = useState(false);
  const [checkingBooking, setCheckingBooking] = useState(true);

  // Check for active bookings (skip if coming from approved request)
  useEffect(() => {
    const checkUserBooking = async () => {
      if (fromRequest) {
        // Skip active booking check if coming from approved request
        setCheckingBooking(false);
        setHasActiveBooking(false);
        return;
      }
      
      if (user?.userId) {
        setCheckingBooking(true);
        const result = await checkActiveBooking(user.userId);
        setHasActiveBooking(result.hasActiveBooking);
        setCheckingBooking(false);
      } else {
        setCheckingBooking(false);
      }
    };

    checkUserBooking();
  }, [user, fromRequest]);

  useEffect(() => {
    const fetchBikeData = async () => {
      // First, try to get bike from localStorage
      const storedBike = localStorage.getItem("selectedBike");
      const storedPricingPeriod = localStorage.getItem("selectedPricingPeriod");
      
      if (storedBike) {
        try {
          const bikeData = JSON.parse(storedBike);
          setBike(bikeData);
          
          if (storedPricingPeriod) {
            setPricingPeriod(storedPricingPeriod);
          }
          
          // Try to fetch fresh data in the background to update quantity
          try {
            const response = await getBikeById(bikeId);
            
            // Handle different API response formats
            let freshBikeData = null;
            if (response && response.STS === "200" && response.CONTENT) {
              freshBikeData = response.CONTENT;
            } else if (response && typeof response === 'object' && response.id) {
              freshBikeData = response;
            }
            
            // Update with fresh data if available
            if (freshBikeData) {
              setBike(freshBikeData);
            }
          } catch (apiError) {
            // Silently fail - we already have data from localStorage
            console.log("Could not fetch fresh bike data, using cached data");
          }
        } catch (parseError) {
          console.error("Error parsing stored bike data:", parseError);
          router.push("/");
        }
      } else {
        // No localStorage data, redirect to home
        router.push("/");
      }
    };

    if (bikeId) {
      fetchBikeData();
    }
  }, [bikeId, router]);

  if (!bike) {
    return (
      <Container className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bike details...</p>
        </div>
      </Container>
    );
  }

  // Handle from date change with validation and pricing period restrictions
  const handleFromDateChange = (e) => {
    const selectedDate = e.target.value;
    setFromDate(selectedDate);

    const today = new Date().toISOString().split("T")[0];
    if (selectedDate === today && fromTime) {
      const now = new Date();
      const selectedDateTime = new Date(`${selectedDate}T${fromTime}`);
      if (selectedDateTime < now) {
        setFromTime("");
      }
    }

    // Auto-calculate end date based on pricing period
    if (selectedDate && fromTime) {
      const startDate = new Date(`${selectedDate}T${fromTime}`);
      let endDate;

      switch (pricingPeriod) {
        case "week":
          // Add 7 days for weekly rental
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 7);
          setToDate(endDate.toISOString().split("T")[0]);
          setToTime(fromTime);
          break;
        case "month":
          // Add 30 days for monthly rental
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 30);
          setToDate(endDate.toISOString().split("T")[0]);
          setToTime(fromTime);
          break;
        default:
          // For daily rental, clear end date to allow user selection
          if (toDate && selectedDate > toDate) {
            setToDate("");
            setToTime("");
          }
      }
    }
  };

  const handleFromTimeChange = (e) => {
    const selectedTime = e.target.value;
    setFromTime(selectedTime);

    // Auto-calculate end date based on pricing period
    if (fromDate && selectedTime) {
      const startDate = new Date(`${fromDate}T${selectedTime}`);
      let endDate;

      switch (pricingPeriod) {
        case "week":
          // Add 7 days for weekly rental
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 7);
          setToDate(endDate.toISOString().split("T")[0]);
          setToTime(selectedTime);
          break;
        case "month":
          // Add 30 days for monthly rental
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 30);
          setToDate(endDate.toISOString().split("T")[0]);
          setToTime(selectedTime);
          break;
        default:
          if (fromDate === toDate && toTime) {
            if (selectedTime >= toTime) {
              setToTime("");
            }
          }
      }
    }
  };

  // Handle pricing period change - reset dates when period changes
  const handlePricingPeriodChange = (newPeriod) => {
    setPricingPeriod(newPeriod);
    
    // If dates are already selected, recalculate end date based on new period
    if (fromDate && fromTime) {
      const startDate = new Date(`${fromDate}T${fromTime}`);
      let endDate;

      switch (newPeriod) {
        case "week":
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 7);
          setToDate(endDate.toISOString().split("T")[0]);
          setToTime(fromTime);
          break;
        case "month":
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 30);
          setToDate(endDate.toISOString().split("T")[0]);
          setToTime(fromTime);
          break;
        default:
          // For daily rental, clear end date to allow user selection
          setToDate("");
          setToTime("");
      }
    }
  };

  const handleToDateChange = (e) => {
    const selectedDate = e.target.value;
    setToDate(selectedDate);

    if (selectedDate === fromDate && toTime && fromTime && toTime <= fromTime) {
      setToTime("");
    }
  };

  const handleToTimeChange = (e) => {
    setToTime(e.target.value);
  };

  const formatForAPI = (date, time) => {
    if (!date || !time) return null;
    return `${date} ${time}`;
  };

  // Get price based on selected pricing period from API response
  const getPriceByPeriod = () => {
    if (!bike) return 0;
    
    switch (pricingPeriod) {
      case "day":
        return bike.pricePerDay || 0;
      case "week":
        // Return weekly price divided by 7 for daily rate
        return bike.pricePerWeek ? bike.pricePerWeek / 7 : bike.pricePerDay || 0;
      case "month":
        // Return monthly price divided by 30 for daily rate
        return bike.pricePerMonth ? bike.pricePerMonth / 30 : bike.pricePerDay || 0;
      default:
        return bike.pricePerDay || 0;
    }
  };

  const getPeriodLabel = () => {
    switch (pricingPeriod) {
      case "day":
        return "Per Day";
      case "week":
        return "Per Week";
      case "month":
        return "Per Month";
      default:
        return "Per Day";
    }
  };

  const getTotalPriceForPeriod = () => {
    if (!bike) return 0;
    
    switch (pricingPeriod) {
      case "day":
        return bike.pricePerDay || 0;
      case "week":
        return bike.pricePerWeek || 0;
      case "month":
        return bike.pricePerMonth || 0;
      default:
        return bike.pricePerDay || 0;
    }
  };

  const calculateBooking = () => {
    if (!fromDate || !fromTime || !toDate || !toTime) return { days: 0, totalCost: 0, discount: 0, finalCost: 0 };

    const from = new Date(`${fromDate}T${fromTime}`);
    const to = new Date(`${toDate}T${toTime}`);
    const diffTime = Math.abs(to - from);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const pricePerDay = getPriceByPeriod();
    const subtotal = diffDays * pricePerDay;
    let discount = 0;
    
    // Apply coupon discount if available (percentage based)
    if (appliedCoupon && appliedCoupon.discount) {
      discount = (subtotal * appliedCoupon.discount) / 100;
    }

    const finalCost = Math.max(0, subtotal - discount);

    return {
      days: diffDays,
      totalCost: subtotal,
      discount: discount,
      finalCost: finalCost,
      fromDateTime: formatForAPI(fromDate, fromTime),
      toDateTime: formatForAPI(toDate, toTime),
    };
  };

  const { days, totalCost, discount, finalCost, fromDateTime, toDateTime } = calculateBooking();

  // Apply coupon handler
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    if (totalCost <= 0) {
      setCouponError("Please select booking dates first");
      return;
    }

    setApplyingCoupon(true);
    setCouponError("");

    try {
      // Call API to validate and get coupon details
      const response = await applyCoupon(couponCode);
      
      if (response.success && response.coupon) {
        setAppliedCoupon(response.coupon);
        setCouponError("");
      } else {
        setCouponError("Invalid coupon code");
        setAppliedCoupon(null);
      }
    } catch (error) {
      setCouponError(error.message || "Failed to apply coupon. Please try again.");
      setAppliedCoupon(null);
    } finally {
      setApplyingCoupon(false);
    }
  };

  // Remove coupon handler
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === "aadhar") {
        setAadharCard(file);
        setAadharVerified(false);
        setAadharDigiLockerData(null);
      } else {
        setDrivingLicense(file);
        setLicenseVerified(false);
        setLicenseDigiLockerData(null);
      }
    }
  };

  // DigiLocker Integration
  const handleDigiLockerVerification = async (docType) => {
    try {
      setLoading(true);
      setUploadProgress(`Connecting to DigiLocker for ${docType === 'aadhar' ? 'Aadhar' : 'Driving License'}...`);

      // Official DigiLocker OAuth URL
      const baseUrl = window.location.origin;
      const redirectUri = `${baseUrl}/api/digilocker/callback`;
      
      // DigiLocker Client ID - Replace with your actual Client ID from DigiLocker Developer Portal
      const clientId = process.env.NEXT_PUBLIC_DIGILOCKER_CLIENT_ID || 'YOUR_DIGILOCKER_CLIENT_ID';
      
      // Actual DigiLocker Authorization URL
      const digiLockerAuthUrl = `https://digilocker.gov.in/public/oauth2/1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${docType}`;

      // Open DigiLocker in popup
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const popup = window.open(
        digiLockerAuthUrl,
        'DigiLocker Authentication',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
      );

      // Listen for DigiLocker callback
      const handleCallback = (event) => {
        if (event.origin === window.location.origin && event.data.type === 'digilocker-callback') {
          if (event.data.success) {
            if (docType === 'aadhar') {
              setAadharVerified(true);
              setAadharDigiLockerData(event.data.data);
              setAadharCard(null);
            } else {
              setLicenseVerified(true);
              setLicenseDigiLockerData(event.data.data);
              setDrivingLicense(null);
            }
            alert(`${docType === 'aadhar' ? 'Aadhar' : 'Driving License'} verified successfully via DigiLocker!`);
          } else {
            alert('DigiLocker verification failed. Please try manual upload.');
          }
          window.removeEventListener('message', handleCallback);
          if (popup) popup.close();
          setLoading(false);
          setUploadProgress('');
        }
      };

      window.addEventListener('message', handleCallback);

      // Check if popup was blocked
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        alert('Popup blocked! Please allow popups for DigiLocker verification.');
        window.removeEventListener('message', handleCallback);
        setLoading(false);
        setUploadProgress('');
      }

    } catch (error) {
      console.error('DigiLocker error:', error);
      alert('Failed to connect to DigiLocker. Please try manual upload.');
      setLoading(false);
      setUploadProgress('');
    }
  };

  const handleBooking = async () => {
    if (!fromDate || !fromTime || !toDate || !toTime) {
      alert("Please select booking dates and times");
      return;
    }

    if (!currentAddress.trim()) {
      alert("Please enter your current address");
      return;
    }

    if (!permanentAddress.trim()) {
      alert("Please enter your permanent address");
      return;
    }

    if (!alternateMobile.trim() || alternateMobile.length !== 10) {
      alert("Please enter a valid 10-digit alternate mobile number");
      return;
    }

    if (!aadharCard && !aadharVerified) {
      alert("Please upload your Aadhar Card or verify via DigiLocker");
      return;
    }

    if (!drivingLicense && !licenseVerified) {
      alert("Please upload your Driving License or verify via DigiLocker");
      return;
    }

    if (!acceptedTerms) {
      alert("Please accept the Terms and Conditions");
      return;
    }

    if (!acceptedDeposit) {
      alert("Please accept the Deposit Terms");
      return;
    }

    if (!user || !user.userId) {
      alert("Please login to book a bike");
      return;
    }

    const from = new Date(`${fromDate}T${fromTime}`);
    const to = new Date(`${toDate}T${toTime}`);
    const now = new Date();

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
      const startDateTime = formatForAPI(fromDate, fromTime);
      const endDateTime = formatForAPI(toDate, toTime);

      // Upload documents based on source (manual or DigiLocker)
      let aadharUpload, licenseUpload;

      if (aadharVerified && aadharDigiLockerData) {
        // Use DigiLocker verified data
        setUploadProgress("Using DigiLocker verified Aadhar...");
        aadharUpload = {
          success: true,
          url: aadharDigiLockerData.documentUrl || 'digilocker-verified',
          verified: true,
          source: 'digilocker'
        };
      } else {
        // Upload manual document
        setUploadProgress("Uploading Aadhar Card...");
        aadharUpload = await uploadDocument(aadharCard, user.userId);
        
        if (!aadharUpload.success) {
          throw new Error("Failed to upload Aadhar Card");
        }
      }

      if (licenseVerified && licenseDigiLockerData) {
        // Use DigiLocker verified data
        setUploadProgress("Using DigiLocker verified License...");
        licenseUpload = {
          success: true,
          url: licenseDigiLockerData.documentUrl || 'digilocker-verified',
          verified: true,
          source: 'digilocker'
        };
      } else {
        // Upload manual document
        setUploadProgress("Uploading Driving License...");
        licenseUpload = await uploadDocument(drivingLicense, user.userId);
        
        if (!licenseUpload.success) {
          throw new Error("Failed to upload Driving License");
        }
      }

      setUploadProgress("Processing payment...");
      setLoading(false);

      const { finalCost } = calculateBooking();

      // Create Razorpay order first
      setUploadProgress("Creating payment order...");
      setLoading(true);
      
      const orderResponse = await createRazorpayOrder({
        bikeId: bike.id,
        userId: user.userId,
        amount: Math.round(finalCost).toString(),
        receipt: "None"
      });

      if (!orderResponse.success) {
        throw new Error("Failed to create payment order");
      }

      setUploadProgress("Processing payment...");
      setLoading(false);

      await initiateRazorpayPayment({
        amount: finalCost,
        description: `Bike Rental: ${bike.bikeName}${appliedCoupon ? ` (Coupon: ${appliedCoupon.code})` : ''}`,
        orderId: orderResponse.orderId,
        prefill: {
          name: user.fullName || user.email,
          email: user.email,
          contact: user.phoneNumber || "",
        },
        onSuccess: async (paymentResponse) => {
          setLoading(true);
          setUploadProgress("Creating booking...");

          try {
            const bookingData = {
              userId: user.userId,
              bikeId: bike.id,
              startDateTime: startDateTime,
              endDateTime: endDateTime,
              paymentId: paymentResponse.razorpay_payment_id,
              totalAmount: finalCost,
              aadharcardUrl: aadharUpload.url,
              drivingLicenseUrl: licenseUpload.url,
              presentAddress: currentAddress,
              permanentAddress: permanentAddress,
              alternateContactNumber: alternateMobile,
              rentalPeriodType: pricingPeriod.toUpperCase(), // DAY, WEEK, or MONTH
              quantity: 1, // User can only book one bike at a time
              couponCode: appliedCoupon?.code || null,
            };

            console.log("Creating booking with data:", bookingData);

            const bookingResponse = await createBooking(bookingData);

            if (bookingResponse.success && bookingResponse.booking) {
              // Submit coupon usage if coupon was applied
              if (appliedCoupon?.code) {
                try {
                  await submitCouponUsage(appliedCoupon.code);
                  console.log("Coupon usage recorded successfully");
                } catch (error) {
                  console.error("Failed to record coupon usage:", error);
                  // Don't fail the booking if coupon submission fails
                }
              }
              
              setBookingResult(bookingResponse.booking);
              setShowInvoice(true);

              setFromDate("");
              setFromTime("");
              setToDate("");
              setToTime("");
              setAadharCard(null);
              setDrivingLicense(null);
              setAcceptedTerms(false);
              setAcceptedDeposit(false);
              setAadharVerified(false);
              setLicenseVerified(false);
              setAadharDigiLockerData(null);
              setLicenseDigiLockerData(null);
              setCurrentAddress("");
              setPermanentAddress("");
              setSameAsCurrentAddress(false);
              setAlternateMobile("");
              setCouponCode("");
              setAppliedCoupon(null);
              setCouponError("");
            } else {
              throw new Error(bookingResponse.message || "Booking failed");
            }
          } catch (error) {
            console.error("Booking creation error:", error);
            alert(
              `Booking failed: ${error.message}\n\nPayment was successful but booking creation failed. Please contact support with Payment ID: ${paymentResponse.razorpay_payment_id}`
            );
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

  const today = new Date().toISOString().split("T")[0];

  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const isFromDateToday = fromDate === today;
  const isToDateSameAsFrom = toDate === fromDate;

  const getMinFromTime = () => {
    if (isFromDateToday) {
      return getCurrentTime();
    }
    return undefined;
  };

  const getMinToTime = () => {
    if (isToDateSameAsFrom && fromTime) {
      const [hours, minutes] = fromTime.split(":");
      const minMinutes = parseInt(minutes) + 1;
      if (minMinutes >= 60) {
        const newHours = (parseInt(hours) + 1) % 24;
        return `${String(newHours).padStart(2, "0")}:00`;
      }
      return `${hours}:${String(minMinutes).padStart(2, "0")}`;
    }
    return undefined;
  };

  return (
    <Container className="min-h-screen py-8 px-4 md:px-8 lg:px-16 mt-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Bikes
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Book Your Bike</h1>
          <p className="text-gray-600 mt-2">Complete the booking details to reserve your ride</p>
        </div>

        {/* Active Booking Warning */}
        {hasActiveBooking && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🚫</span>
              <div>
                <h3 className="text-lg font-bold text-amber-800">You already have an active booking</h3>
                <p className="text-sm text-amber-700 mt-1">
                  You can only book one bike at a time. Please complete or cancel your current ride before making a new booking.
                </p>
                <p className="text-xs text-amber-600 mt-2">
                  💡 You can view your active booking in the "Your Rides" section.
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/your-rides')}
              className="mt-4 px-6 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-all"
            >
              View Your Rides
            </button>
          </div>
        )}

        {/* Out of Stock Warning */}
        {bike.quantity === 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚠️</span>
              <div>
                <h3 className="text-lg font-bold text-red-800">This bike is currently out of stock</h3>
                <p className="text-sm text-red-700 mt-1">
                  Sorry, this bike is not available for booking at the moment. Please check back later or browse other available bikes.
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/bikes')}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all"
            >
              Browse Available Bikes
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bike Details Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Bike Details</h2>
              <div className="flex gap-4">
                <div className="relative w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                  {getSafeImageSrc(bike.bikeImage) ? (
                    <Image
                      src={getSafeImageSrc(bike.bikeImage)}
                      alt={bike.bikeName}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                      <span className="text-4xl opacity-30">🏍️</span>
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{bike.bikeName}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {bike.brand} • {bike.bikeModel}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div className="flex items-center gap-1">
                      <span>⚡</span>
                      <span className="text-gray-700">{bike.engineCapacity}cc</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>⛽</span>
                      <span className="text-gray-700">{bike.fuelType}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>⚙️</span>
                      <span className="text-gray-700">{bike.transmission}</span>
                    </div>
                  </div>
                  {/* Pricing Period Selector */}
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Rental Period</label>
                    <select
                      value={pricingPeriod}
                      onChange={(e) => handlePricingPeriodChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all bg-white"
                    >
                      <option value="day">Per Day - ₹{bike.pricePerDay?.toFixed(2)}</option>
                      {bike.pricePerWeek && (
                        <option value="week">Per Week (7 days) - ₹{bike.pricePerWeek?.toFixed(2)}</option>
                      )}
                      {bike.pricePerMonth && (
                        <option value="month">Per Month (30 days) - ₹{bike.pricePerMonth?.toFixed(2)}</option>
                      )}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Effective rate: <span className="text-red-600 font-semibold">₹{getPriceByPeriod()?.toFixed(2)}/day</span>
                    </p>
                    {pricingPeriod !== "day" && (
                      <p className="text-xs text-blue-600 mt-1 font-medium">
                        ℹ️ End date will be auto-calculated ({pricingPeriod === "week" ? "7 days" : "30 days"})
                      </p>
                    )}
                  </div>

                  {/* Quantity Selector */}
                  <div className="mt-3">
                    <label className="text-xs text-gray-500 mb-1 block">Quantity</label>
                    <input
                      type="number"
                      value={1}
                      disabled
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100 cursor-not-allowed text-gray-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      You can only book one bike at a time
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Period */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Select Booking Period</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        {new Date(`${fromDate}T${fromTime}`).toLocaleString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <span className="text-red-600">🕐</span>
                    To
                    {pricingPeriod !== "day" && (
                      <span className="text-xs text-gray-500 font-normal">(Auto-calculated)</span>
                    )}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={toDate}
                      onChange={handleToDateChange}
                      min={fromDate || today}
                      readOnly={pricingPeriod !== "day"}
                      disabled={pricingPeriod !== "day"}
                      className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all ${
                        pricingPeriod !== "day" ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                      }`}
                    />
                    <input
                      type="time"
                      value={toTime}
                      onChange={handleToTimeChange}
                      min={getMinToTime()}
                      readOnly={pricingPeriod !== "day"}
                      disabled={pricingPeriod !== "day"}
                      className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all ${
                        pricingPeriod !== "day" ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                      }`}
                    />
                    {pricingPeriod !== "day" && fromDate && fromTime && (
                      <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                        <span>ℹ️</span>
                        <span>Automatically set to {pricingPeriod === "week" ? "7 days" : "30 days"} from start date</span>
                      </p>
                    )}
                    {isToDateSameAsFrom && fromTime && pricingPeriod === "day" && (
                      <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                        <span>⚠️</span>
                        <span>Must be after {fromTime}</span>
                      </p>
                    )}
                    {toDate && toTime && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(`${toDate}T${toTime}`).toLocaleString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Coupon Section - Always visible */}
              <div className="mt-4 bg-white border-2 border-gray-200 rounded-xl p-4">
                <div className="border-b border-gray-200 pb-3 mb-3">
                  {!appliedCoupon ? (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Have a coupon code?
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Enter code"
                          disabled={applyingCoupon || days === 0}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm uppercase disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={applyingCoupon || !couponCode.trim() || days === 0}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {applyingCoupon ? "Applying..." : "Apply"}
                        </button>
                      </div>
                      {days === 0 && (
                        <p className="text-xs text-amber-600 flex items-center gap-1">
                          <span>ℹ️</span>
                          <span>Please select booking dates first to apply coupon</span>
                        </p>
                      )}
                      {couponError && days > 0 && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          {couponError}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-semibold text-green-800">
                            Coupon Applied: {appliedCoupon.code}
                          </span>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-red-600 hover:text-red-700 text-xs font-medium"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-green-700">Discount:</span>
                        <span className="text-green-700 font-semibold">-₹{discount.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Price Summary */}
              {days > 0 && (
                <div className="mt-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4">
                  <div className="mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-700 font-medium">
                        Duration: {days} {days === 1 ? "Day" : "Days"}
                      </span>
                      <span className="text-gray-600 text-sm">
                        ₹{getPriceByPeriod()?.toFixed(2)} × {days}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Rental period: {getPeriodLabel()} (₹{getTotalPriceForPeriod()?.toFixed(2)})
                    </p>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-red-300 mb-3">
                    <span className="text-gray-700">Subtotal:</span>
                    <span className="text-gray-900 font-semibold">₹{totalCost.toFixed(2)}</span>
                  </div>
                  
                  {appliedCoupon && discount > 0 && (
                    <div className="flex justify-between items-center pb-2 mb-3">
                      <span className="text-green-700 text-sm">Discount ({appliedCoupon.code}):</span>
                      <span className="text-green-700 font-semibold">-₹{discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-3 border-t border-red-300">
                    <span className="text-lg font-bold text-gray-900">
                      Total {appliedCoupon ? "to Pay" : "Cost"}:
                    </span>
                    <div className="text-right">
                      {appliedCoupon && discount > 0 && (
                        <div className="text-sm text-gray-500 line-through">
                          ₹{totalCost.toFixed(2)}
                        </div>
                      )}
                      <span className="text-2xl font-bold text-red-600">
                        ₹{finalCost.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Address Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-xl font-bold text-gray-900">Address Information</h2>
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                  Required
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Please provide your current and permanent address details
              </p>

              <div className="space-y-4">
                {/* Alternate Mobile Number */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <span className="text-red-600">📱</span>
                    Alternate Mobile Number
                    <span className="text-red-600 ml-1">*</span>
                  </label>
                  <input
                    type="tel"
                    value={alternateMobile}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 10) {
                        setAlternateMobile(value);
                      }
                    }}
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all bg-white"
                  />
                  {alternateMobile && alternateMobile.length !== 10 && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <span>⚠️</span>
                      <span>Please enter a valid 10-digit mobile number</span>
                    </p>
                  )}
                  {alternateMobile && alternateMobile.length === 10 && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <span>✓</span>
                      <span>Valid mobile number</span>
                    </p>
                  )}
                </div>

                {/* Current Address */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <span className="text-red-600">📍</span>
                    Current Address
                  </label>
                  <textarea
                    value={currentAddress}
                    onChange={(e) => setCurrentAddress(e.target.value)}
                    placeholder="Enter your current residential address..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all bg-white resize-none"
                  />
                </div>

                {/* Same as Current Address Checkbox */}
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <input
                    type="checkbox"
                    id="sameAddress"
                    checked={sameAsCurrentAddress}
                    onChange={(e) => {
                      setSameAsCurrentAddress(e.target.checked);
                      if (e.target.checked) {
                        setPermanentAddress(currentAddress);
                      } else {
                        setPermanentAddress("");
                      }
                    }}
                    className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                  />
                  <label htmlFor="sameAddress" className="text-sm text-gray-700 font-medium cursor-pointer">
                    Permanent address is same as current address
                  </label>
                </div>

                {/* Permanent Address */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <span className="text-red-600">🏠</span>
                    Permanent Address
                  </label>
                  <textarea
                    value={permanentAddress}
                    onChange={(e) => {
                      setPermanentAddress(e.target.value);
                      if (sameAsCurrentAddress) {
                        setSameAsCurrentAddress(false);
                      }
                    }}
                    placeholder="Enter your permanent address..."
                    rows={3}
                    disabled={sameAsCurrentAddress}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all resize-none ${
                      sameAsCurrentAddress 
                        ? 'bg-gray-100 cursor-not-allowed text-gray-600' 
                        : 'bg-white'
                    }`}
                  />
                  {sameAsCurrentAddress && (
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <span>ℹ️</span>
                      <span>Permanent address auto-filled from current address</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Document Upload */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-xl font-bold text-gray-900">Document Verification</h2>
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                  Required
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Upload your documents for verification
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Aadhar Card */}
                <div className="space-y-3">
                  <div className={`border-2 rounded-xl p-6 text-center transition-all ${
                    aadharVerified 
                      ? 'border-green-500 bg-green-50' 
                      : aadharCard 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-red-400'
                  }`}>
                    <div className="text-5xl mb-3">
                      {aadharVerified ? "✅" : aadharCard ? "📄" : "🆔"}
                    </div>
                    <div className="font-semibold text-gray-900 mb-1">Aadhar Card</div>
                    
                    {aadharVerified ? (
                      <div className="space-y-2">
                        <div className="text-xs text-green-700 font-medium bg-green-100 py-1 px-3 rounded-full inline-block">
                          ✓ Verified via DigiLocker
                        </div>
                        <button
                          onClick={() => {
                            setAadharVerified(false);
                            setAadharDigiLockerData(null);
                          }}
                          className="text-xs text-red-600 hover:text-red-700 underline"
                        >
                          Use different document
                        </button>
                      </div>
                    ) : aadharCard ? (
                      <div className="space-y-2">
                        <div className="text-xs text-gray-600 mb-2">{aadharCard.name}</div>
                        <button
                          onClick={() => setAadharCard(null)}
                          className="text-xs text-red-600 hover:text-red-700 underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 mb-2">Not uploaded</div>
                    )}
                  </div>

                  {!aadharVerified && !aadharCard && (
                    <div className="space-y-2">
                      {/* Manual Upload */}
                      <input
                        type="file"
                        id="aadhar"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(e, "aadhar")}
                        className="hidden"
                      />
                      <label
                        htmlFor="aadhar"
                        className="w-full py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-red-400 hover:bg-red-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Upload Manually
                      </label>
                    </div>
                  )}
                </div>

                {/* Driving License */}
                <div className="space-y-3">
                  <div className={`border-2 rounded-xl p-6 text-center transition-all ${
                    licenseVerified 
                      ? 'border-green-500 bg-green-50' 
                      : drivingLicense 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-red-400'
                  }`}>
                    <div className="text-5xl mb-3">
                      {licenseVerified ? "✅" : drivingLicense ? "📄" : "🚗"}
                    </div>
                    <div className="font-semibold text-gray-900 mb-1">Driving License</div>
                    
                    {licenseVerified ? (
                      <div className="space-y-2">
                        <div className="text-xs text-green-700 font-medium bg-green-100 py-1 px-3 rounded-full inline-block">
                          ✓ Verified via DigiLocker
                        </div>
                        <button
                          onClick={() => {
                            setLicenseVerified(false);
                            setLicenseDigiLockerData(null);
                          }}
                          className="text-xs text-red-600 hover:text-red-700 underline"
                        >
                          Use different document
                        </button>
                      </div>
                    ) : drivingLicense ? (
                      <div className="space-y-2">
                        <div className="text-xs text-gray-600 mb-2">{drivingLicense.name}</div>
                        <button
                          onClick={() => setDrivingLicense(null)}
                          className="text-xs text-red-600 hover:text-red-700 underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 mb-2">Not uploaded</div>
                    )}
                  </div>

                  {!licenseVerified && !drivingLicense && (
                    <div className="space-y-2">
                      {/* Manual Upload */}
                      <input
                        type="file"
                        id="license"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(e, "license")}
                        className="hidden"
                      />
                      <label
                        htmlFor="license"
                        className="w-full py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-red-400 hover:bg-red-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Upload Manually
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* DigiLocker info - temporarily disabled */}
              {false && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="text-xs text-blue-800">
                      <p className="font-semibold mb-1">Why DigiLocker?</p>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Instant verification (no upload needed)</li>
                        <li>Government-verified documents</li>
                        <li>Secure and encrypted</li>
                        <li>Faster booking process</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Terms & Conditions</h2>
              
              <div className="space-y-4">
                {/* Terms Checkbox */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer flex-1">
                    <span className="font-semibold text-gray-900">I accept the Terms and Conditions</span>
                    <ul className="mt-2 space-y-1 text-xs text-gray-600 list-disc list-inside">
                      <li>Valid driving license is mandatory for bike rental</li>
                      <li>Bikes must be returned at the agreed time and location</li>
                      <li>Fuel charges are separate and borne by the customer</li>
                      <li>Any damage to the bike will be charged as per actual repair cost</li>
                      <li>Traffic violations and fines are customer's responsibility</li>
                      <li>Helmets are mandatory and provided free of charge</li>
                      <li>Bikes cannot be used for commercial purposes</li>
                      <li>The renter must be 18 years or older</li>
                    </ul>
                  </label>
                </div>

                {/* Deposit Terms Checkbox */}
                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <input
                    type="checkbox"
                    id="deposit"
                    checked={acceptedDeposit}
                    onChange={(e) => setAcceptedDeposit(e.target.checked)}
                    className="mt-1 w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label htmlFor="deposit" className="text-sm text-gray-700 cursor-pointer flex-1">
                    <span className="font-semibold text-gray-900">I understand the Deposit Terms</span>
                    <ul className="mt-2 space-y-1 text-xs text-gray-600 list-disc list-inside">
                      <li>A refundable security deposit may be required at the time of pickup</li>
                      <li>Deposit amount varies based on bike model and rental duration</li>
                      <li>Deposit will be refunded within 7 working days after bike return</li>
                      <li>Any damages or violations will be deducted from the deposit</li>
                      <li>Late return charges will be deducted from the deposit</li>
                      <li>Full bike inspection will be done before deposit refund</li>
                    </ul>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Booking Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Bike:</span>
                  <span className="font-semibold text-gray-900">{bike.bikeName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rental Period:</span>
                  <span className="font-semibold text-gray-900">{getPeriodLabel()}</span>
                </div>
                {days > 0 && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-semibold text-gray-900">{days} {days === 1 ? "Day" : "Days"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Rate per day:</span>
                      <span className="font-semibold text-gray-900">₹{getPriceByPeriod()?.toFixed(2)}</span>
                    </div>
                    
                    {appliedCoupon && discount > 0 && (
                      <>
                        <div className="flex justify-between text-sm border-t pt-3">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="font-semibold text-gray-900">₹{totalCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-green-600">Discount ({appliedCoupon.code}):</span>
                          <span className="font-semibold text-green-600">-₹{discount.toFixed(2)}</span>
                        </div>
                      </>
                    )}
                    
                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="font-bold text-gray-900">Total Amount:</span>
                        <div className="text-right">
                          {appliedCoupon && discount > 0 && (
                            <div className="text-sm text-gray-400 line-through mb-1">
                              ₹{totalCost.toFixed(2)}
                            </div>
                          )}
                          <span className="text-2xl font-bold text-red-600">₹{finalCost.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {uploadProgress && (
                <div className="mb-4 text-center">
                  <p className="text-sm font-medium text-red-600 animate-pulse">{uploadProgress}</p>
                </div>
              )}

              <button
                onClick={handleBooking}
                disabled={
                  loading ||
                  hasActiveBooking ||
                  bike.quantity === 0 ||
                  !fromDate ||
                  !fromTime ||
                  !toDate ||
                  !toTime ||
                  !currentAddress.trim() ||
                  !permanentAddress.trim() ||
                  (!aadharCard && !aadharVerified) ||
                  (!drivingLicense && !licenseVerified) ||
                  !acceptedTerms ||
                  !acceptedDeposit
                }
                className={`w-full px-6 py-4 font-semibold rounded-xl transition-all ${
                  loading ||
                  hasActiveBooking ||
                  bike.quantity === 0 ||
                  !fromDate ||
                  !fromTime ||
                  !toDate ||
                  !toTime ||
                  !currentAddress.trim() ||
                  !permanentAddress.trim() ||
                  (!aadharCard && !aadharVerified) ||
                  (!drivingLicense && !licenseVerified) ||
                  !acceptedTerms ||
                  !acceptedDeposit
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
                ) : hasActiveBooking ? (
                  "Active Booking Exists - Cannot Book"
                ) : bike.quantity === 0 ? (
                  "Out of Stock - Cannot Book"
                ) : (
                  "Confirm Booking & Pay"
                )}
              </button>

              <div className="mt-4 text-xs text-gray-500 text-center">
                <p>🔒 Secure payment powered by Razorpay</p>
              </div>
            </div>
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
          router.push("/your-rides");
        }}
      />
    </Container>
  );
}
