"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { createBooking, checkActiveBooking } from "@/api/bookings";
import { getBikeById } from "@/api/bikes";
import { applyCoupon, submitCouponUsage } from "@/api/coupons";
import { initiateRazorpayPayment } from "@/lib/razorpay";
import { createRazorpayOrder } from "@/api/razorpay";
import { useAuth } from "@/contexts/AuthContext";
import { getDigilockerAuthUrl, getDigilockerStatus, getDigilockerDocuments } from "@/api/digilocker";
import { getUserById } from "@/api/user";
import Container from "@/components/common/Container";
import InvoiceModal from "@/components/bikes/InvoiceModal";
import { getBilledDuration } from "@/lib/bookingPricing";

const DAY_HOURS = 24;
const WEEK_HOURS = 7 * DAY_HOURS;
const MONTH_HOURS = 30 * DAY_HOURS;
const MAX_HOURLY_THRESHOLD = 3;
const MAX_DAILY_THRESHOLD = 5;
const MAX_WEEKLY_THRESHOLD = 4;

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

const PaymentTermsModal = ({ isOpen, onClose, onAccept }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Payment Terms & Conditions</h2>
            <p className="mt-2 text-sm text-gray-600">
              Please review and accept these terms to continue to the payment gateway.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 text-sm text-gray-700">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Important Payment Conditions</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>ID physical deposit must be submitted at pickup.</li>
              <li>Bike physical damage and tire punctures are your responsibility.</li>
              <li>Bike challan and traffic fines are your responsibility.</li>
              <li>If your details mismatch, the ride may be canceled.</li>
              <li>Bank and payment gateway taxes will be deducted.</li>
            </ul>
          </div>
          <p className="text-sm text-gray-500">
            After accepting, you will be redirected to the payment gateway to complete your booking.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={onAccept}
            className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 transition"
          >
            Accept & Continue to Payment
          </button>
        </div>
      </div>
    </div>
  );
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
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [bookingResult, setBookingResult] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedDeposit, setAcceptedDeposit] = useState(false);
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
  const [digilockerStatus, setDigilockerStatus] = useState(null);
  const [digilockerLoading, setDigilockerLoading] = useState(true);
  const [digilockerError, setDigilockerError] = useState(null);
  const [digilockerAuthLoading, setDigilockerAuthLoading] = useState(false);
  const [digilockerDocuments, setDigilockerDocuments] = useState([]);
  const [digilockerDocumentsLoading, setDigilockerDocumentsLoading] = useState(false);
  const [digilockerDocumentsError, setDigilockerDocumentsError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userProfileLoading, setUserProfileLoading] = useState(true);
  const [userProfileError, setUserProfileError] = useState(null);
  const [showPaymentTerms, setShowPaymentTerms] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(null);

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
        setDigilockerStatus(response.CONTENT);
      } catch (error) {
        console.error("Error fetching DigiLocker status:", error);
        setDigilockerError(error?.message || "Failed to fetch DigiLocker status.");
      } finally {
        setDigilockerLoading(false);
      }
    };

    fetchDigilockerStatus();
  }, [user]);

  useEffect(() => {
    const fetchDigilockerDocuments = async () => {
      if (!user?.userId) {
        setDigilockerDocuments([]);
        setDigilockerDocumentsLoading(false);
        return;
      }

      try {
        setDigilockerDocumentsError(null);
        setDigilockerDocumentsLoading(true);
        const response = await getDigilockerDocuments(user.userId);

        if (response?.CONTENT?.items && Array.isArray(response.CONTENT.items)) {
          setDigilockerDocuments(response.CONTENT.items);
        } else {
          setDigilockerDocuments([]);
        }
      } catch (error) {
        console.error("Error fetching DigiLocker documents:", error);
        setDigilockerDocumentsError(error?.message || "Failed to fetch DigiLocker documents.");
      } finally {
        setDigilockerDocumentsLoading(false);
      }
    };

    if (user?.userId) {
      fetchDigilockerDocuments();
    }
  }, [user]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.userId) {
        setUserProfile(null);
        setUserProfileLoading(false);
        return;
      }

      try {
        setUserProfileError(null);
        setUserProfileLoading(true);
        const response = await getUserById(user.userId);

        if (response?.STS === "200" && response?.CONTENT) {
          setUserProfile(response.CONTENT);
        } else {
          setUserProfile(null);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUserProfileError(error?.message || "Failed to fetch user profile.");
      } finally {
        setUserProfileLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleVerifyWithDigilocker = async () => {
    try {
      setDigilockerError(null);
      setDigilockerAuthLoading(true);
      const response = await getDigilockerAuthUrl(user.userId);
      const authUrl = response?.CONTENT?.authUrl;
      if (!authUrl) {
        throw new Error("Digilocker authorization URL is unavailable.");
      }
      window.location.href = authUrl;
    } catch (error) {
      console.error("Error starting DigiLocker verification:", error);
      setDigilockerError(error?.message || "Unable to open DigiLocker authorization.");
      setDigilockerAuthLoading(false);
    }
  };

  const isDigilockerVerified = digilockerStatus?.verified || digilockerStatus?.status === "VERIFIED";
  const isAadhaarUploaded = Boolean(userProfile?.aadharUploaded);

  const getDocumentByType = (type) => digilockerDocuments.find((doc) => doc.type === type);
  const drivingLicenseDocument = getDocumentByType("DRIVING_LICENSE");
  const hasRequiredDocuments = Boolean(drivingLicenseDocument?.documentUrl);
  const canProceedWithBooking = isDigilockerVerified && isAadhaarUploaded && hasRequiredDocuments;

  useEffect(() => {
    if (isDigilockerVerified) {
      setDigilockerError(null);
    }
  }, [isDigilockerVerified]);

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
    let selectedDate = e.target.value;
    const minDate = getMinToDate();

    if (pricingPeriod !== "day" && selectedDate < minDate) {
      selectedDate = minDate;
    }

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

  const getDailyRate = () => {
    if (!bike) return 0;
    return bike.pricePerDay || 0;
  };

  const getHourlyRate = () => {
    if (!bike) return 0;
    return bike.pricePerHour || 0;
  };

  const getWeeklyRate = () => {
    if (!bike) return 0;
    return bike.pricePerWeek || 0;
  };

  const getMonthlyRate = () => {
    if (!bike) return 0;
    return bike.pricePerMonth || 0;
  };

  const getCurrentPriceForPeriod = () => {
    switch (pricingPeriod) {
      case "week":
        return getWeeklyRate();
      case "month":
        return getMonthlyRate();
      default:
        return getDailyRate();
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
    const totalHours = diffTime / (1000 * 60 * 60);

    let subtotal = 0;

    const hourlyRate = getHourlyRate();
    const dailyRate = getDailyRate();
    const weeklyRate = getWeeklyRate();
    const monthlyRate = getMonthlyRate();

    switch (pricingPeriod) {

      case "day": {
        const fullDays = Math.floor(totalHours / DAY_HOURS);

        // A daily booking must be at least 3 hours and is charged as one full day.
        if (totalHours < MAX_HOURLY_THRESHOLD) {
          subtotal = 0;
          break;
        }

        const remainingHours = totalHours % DAY_HOURS;

        if (remainingHours === 0) {
          subtotal = fullDays * dailyRate;
        } else if (remainingHours < MAX_HOURLY_THRESHOLD) {
          subtotal =
            (fullDays * dailyRate) +
            (Math.ceil(remainingHours) * hourlyRate);
        } else {
          subtotal = (fullDays + 1) * dailyRate;
        }

        break;
      }

      case "week": {
        const fullWeeks = Math.floor(totalHours / WEEK_HOURS);

        if (fullWeeks < 1) {
          subtotal = 0;
          break;
        }

        let remainingHours = totalHours % WEEK_HOURS;

        const extraDays = Math.floor(remainingHours / DAY_HOURS);
        remainingHours = remainingHours % DAY_HOURS;

        // 4+ days => new week
        if (extraDays >= MAX_DAILY_THRESHOLD) {
          subtotal = (fullWeeks + 1) * weeklyRate;
          break;
        }

        subtotal =
          (fullWeeks * weeklyRate) +
          (extraDays * dailyRate);

        // Hour handling
        if (remainingHours > 0) {
          if (remainingHours < MAX_HOURLY_THRESHOLD) {
            subtotal += Math.ceil(remainingHours) * hourlyRate;
          } else {
            subtotal += dailyRate;
          }
        }

        break;
      }

      case "month": {
        const fullMonths = Math.floor(totalHours / MONTH_HOURS);

        if (fullMonths < 1) {
          subtotal = 0;
          break;
        }

        let remainingHours = totalHours % MONTH_HOURS;

        const extraWeeks = Math.floor(remainingHours / WEEK_HOURS);
        remainingHours = remainingHours % WEEK_HOURS;

        // 3+ weeks => new month
        if (extraWeeks >= MAX_WEEKLY_THRESHOLD) {
          subtotal = (fullMonths + 1) * monthlyRate;
          break;
        }

        const extraDays = Math.floor(remainingHours / DAY_HOURS);
        remainingHours = remainingHours % DAY_HOURS;

        subtotal =
          (fullMonths * monthlyRate) +
          (extraWeeks * weeklyRate);

        // 4+ days => new week
        if (extraDays >= MAX_DAILY_THRESHOLD) {
          subtotal += weeklyRate;
          break; // ignore hours
        }

        subtotal += extraDays * dailyRate;

        // Hour handling
        if (remainingHours > 0) {
          if (remainingHours < MAX_HOURLY_THRESHOLD) {
            subtotal += Math.ceil(remainingHours) * hourlyRate;
          } else {
            subtotal += dailyRate;
          }
        }

        break;
      }

      default:
        subtotal = dailyRate;
    }

    let discount = 0;

    if (appliedCoupon && appliedCoupon.discount) {
      discount = (subtotal * appliedCoupon.discount) / 100;
    }

    const finalCost = Math.max(0, subtotal - discount);

    return {
      days: totalHours >= MAX_HOURLY_THRESHOLD ? Math.max(1, Math.floor(totalHours / DAY_HOURS)) : 0,
      totalCost: subtotal,
      discount: discount,
      finalCost: finalCost,
      fromDateTime: formatForAPI(fromDate, fromTime),
      toDateTime: formatForAPI(toDate, toTime),
    };
  };

  const { days, totalCost, discount, finalCost, fromDateTime, toDateTime } = calculateBooking();
  const billedDuration = getBilledDuration(fromDateTime, toDateTime, pricingPeriod);

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
      const response = await applyCoupon(couponCode, user.userId);
      
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

  // Reset booking form to initial state
  const resetBookingForm = () => {
    setFromDate("");
    setFromTime("");
    setToDate("");
    setToTime("");
    setAcceptedTerms(false);
    setAcceptedDeposit(false);
    setCurrentAddress("");
    setPermanentAddress("");
    setSameAsCurrentAddress(false);
    setAlternateMobile("");
    setCouponCode("");
    setAppliedCoupon(null);
    setCouponError("");
  };

  const handleBooking = async () => {
    if (!fromDate || !fromTime || !toDate || !toTime) {
      alert("Please select booking dates and times");
      return;
    }

    if (!isDigilockerVerified) {
      alert("You must verify via DigiLocker before booking a bike.");
      return;
    }

    if (!isAadhaarUploaded) {
      alert("Please upload your Aadhaar in your profile before booking a bike.");
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

    if (!drivingLicenseDocument?.documentUrl) {
      alert("Please complete DigiLocker verification and ensure your Driving License is available.");
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
    const totalHours = (to - from) / (1000 * 60 * 60);

    if (from < now) {
      alert("'From' date and time cannot be in the past");
      return;
    }

    if (from >= to) {
      alert("'To' date and time must be after 'From' date and time");
      return;
    }

    if (pricingPeriod === "day" && totalHours < MAX_HOURLY_THRESHOLD) {
      alert("Daily bookings require a minimum rental duration of 3 hours.");
      return;
    }

    setLoading(true);
    setUploadProgress("Uploading documents...");

    try {
      const startDateTime = formatForAPI(fromDate, fromTime);
      const endDateTime = formatForAPI(toDate, toTime);

      const { finalCost } = calculateBooking();
      const shouldCreateOrder = process.env.NODE_ENV === "production";
      let razorpayOrderId;

      if (shouldCreateOrder) {
        setUploadProgress("Creating payment order...");

        const orderResponse = await createRazorpayOrder({
          bikeId: bike.id,
          userId: user.userId,
          amount: Math.round(finalCost).toString(),
          receipt: "None"
        });

        if (!orderResponse.success) {
          throw new Error("Failed to create payment order");
        }

        razorpayOrderId = orderResponse.orderId;
      }

      const bookingData = {
        userId: user.userId,
        bikeId: bike.id,
        startDateTime: startDateTime,
        endDateTime: endDateTime,
        totalAmount: finalCost,
        aadharcardUrl: null,
        drivingLicenseUrl: drivingLicenseDocument?.documentUrl,
        presentAddress: currentAddress,
        permanentAddress: permanentAddress,
        alternateContactNumber: alternateMobile,
        rentalPeriodType: pricingPeriod.toUpperCase(), // DAY, WEEK, or MONTH
        quantity: 1, // User can only book one bike at a time
        couponCode: appliedCoupon?.code || null,
      };

      setPendingPayment({
        amount: finalCost,
        description: `Bike Rental: ${bike.bikeName}${appliedCoupon ? ` (Coupon: ${appliedCoupon.code})` : ''}`,
        orderId: razorpayOrderId,
        prefill: {
          name: user.fullName || user.email,
          email: user.email,
          contact: user.phoneNumber || "",
        },
        bookingData,
      });

      setUploadProgress("Please accept the payment terms to continue");
      setLoading(false);
      setShowPaymentTerms(true);
    } catch (error) {
      console.error("Booking error:", error);
      resetBookingForm();
      alert(`Error: ${error.message}\n\nPlease try again.`);
      setLoading(false);
      setUploadProgress("");
    }
  };

  const handleConfirmPayment = async () => {
    if (!pendingPayment) {
      return;
    }

    setShowPaymentTerms(false);
    setLoading(true);
    setUploadProgress("Processing payment...");

    try {
      await initiateRazorpayPayment({
        amount: pendingPayment.amount,
        description: pendingPayment.description,
        orderId: pendingPayment.orderId,
        prefill: pendingPayment.prefill,
        onSuccess: async (paymentResponse) => {
          setLoading(true);
          setUploadProgress("Creating booking...");

          try {
            const bookingData = {
              ...pendingPayment.bookingData,
              paymentId: paymentResponse.razorpay_payment_id,
            };

            console.log("Creating booking with data:", bookingData);

            const bookingResponse = await createBooking(bookingData);

            if (bookingResponse.success && bookingResponse.booking) {
              if (appliedCoupon?.code) {
                try {
                  await submitCouponUsage(appliedCoupon.code, user.userId);
                  console.log("Coupon usage recorded successfully");
                } catch (error) {
                  console.error("Failed to record coupon usage:", error);
                }
              }

              setBookingResult(bookingResponse.booking);
              setShowInvoice(true);
              resetBookingForm();
              setPendingPayment(null);
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
      console.error("Payment initiation error:", error);
      alert("Unable to open payment gateway. Please try again.");
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

  const getMinToDate = () => {
    if (!fromDate) {
      return today;
    }

    const minDate = new Date(fromDate);
    if (pricingPeriod === "week") {
      minDate.setDate(minDate.getDate() + 7);
    } else if (pricingPeriod === "month") {
      minDate.setDate(minDate.getDate() + 30);
    }
    return minDate.toISOString().split("T")[0];
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
    <>
      <PaymentTermsModal
        isOpen={showPaymentTerms}
        onClose={() => setShowPaymentTerms(false)}
        onAccept={handleConfirmPayment}
      />
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

        {/* DigiLocker Verification Status */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">DigiLocker Verification</h2>
              {digilockerLoading ? (
                <p className="text-sm text-gray-600 mt-2">Checking your DigiLocker verification status...</p>
              ) : digilockerError ? (
                <p className="text-sm text-red-600 mt-2">{digilockerError}</p>
              ) : isDigilockerVerified ? (
                <p className="text-sm text-green-700 mt-2">You are verified via DigiLocker{digilockerStatus?.verifiedAt ? ` on ${new Date(digilockerStatus.verifiedAt).toLocaleString()}` : ''}.</p>
              ) : (
                <p className="text-sm text-gray-600 mt-2">You need DigiLocker verification before booking a bike.</p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${isDigilockerVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {digilockerLoading ? 'Checking' : isDigilockerVerified ? 'VERIFIED' : 'NOT VERIFIED'}
              </span>
              {!isDigilockerVerified && (
                <button
                  onClick={handleVerifyWithDigilocker}
                  disabled={digilockerLoading || digilockerAuthLoading}
                  className="px-5 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {digilockerAuthLoading ? 'Opening DigiLocker...' : 'Verify via DigiLocker'}
                </button>
              )}
            </div>
            {!isDigilockerVerified && (
              <div className="mt-4 rounded-xl bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800">
                Aadhar and driving license on DigiLocker are required.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Aadhaar Upload</h2>
              {userProfileLoading ? (
                <p className="text-sm text-gray-600 mt-2">Checking your Aadhaar status...</p>
              ) : userProfileError ? (
                <p className="text-sm text-red-600 mt-2">{userProfileError}</p>
              ) : isAadhaarUploaded ? (
                <p className="text-sm text-green-700 mt-2">Your Aadhaar has been uploaded and is available for booking.</p>
              ) : (
                <p className="text-sm text-gray-600 mt-2">Upload your Aadhaar from your profile before you can book a bike.</p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${isAadhaarUploaded ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {userProfileLoading ? 'Checking' : isAadhaarUploaded ? 'UPLOADED' : 'PENDING'}
              </span>
              <button
                onClick={() => router.push('/profile')}
                className="px-5 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition"
              >
                Go to Profile
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Driving License</h2>
              <p className="text-sm text-gray-600 mt-1">Loaded from DigiLocker for this booking.</p>
            </div>
            <div className="text-sm text-gray-600">
              {digilockerDocumentsLoading ? "Loading document..." : hasRequiredDocuments ? "Available" : "Not available"}
            </div>
          </div>

          {digilockerDocumentsError ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p className="text-sm text-red-700">{digilockerDocumentsError}</p>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">Driving License</p>
                  <p className="text-sm text-gray-600 mt-1 truncate">{drivingLicenseDocument?.name || "Not available"}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${drivingLicenseDocument?.documentUrl ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {drivingLicenseDocument?.documentUrl ? "Available" : "Missing"}
                </span>
              </div>
              {drivingLicenseDocument?.documentUrl ? (
                <a
                  href={drivingLicenseDocument.documentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
                >
                  Open document
                </a>
              ) : (
                <p className="mt-4 text-sm text-gray-500">This document was not returned by DigiLocker.</p>
              )}
            </div>
          )}
        </div>

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
                      Effective rate: <span className="text-red-600 font-semibold">₹{getCurrentPriceForPeriod()?.toFixed(2)}/day</span>
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
                      <span className="text-xs text-gray-500 font-normal">(Initial end date auto-calculated)</span>
                    )}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={toDate}
                      onChange={handleToDateChange}
                      min={getMinToDate()}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all bg-white"
                    />
                    <input
                      type="time"
                      value={toTime}
                      onChange={handleToTimeChange}
                      min={getMinToTime()}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all bg-white"
                    />
                    {pricingPeriod !== "day" && fromDate && fromTime && (
                      <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                        <span>ℹ️</span>
                        <span>Initial end date is set to {pricingPeriod === "week" ? "7 days" : "30 days"}, you can extend it further within the same package.</span>
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
                        Billed as: {billedDuration}
                      </span>
                      <span className="text-gray-600 text-sm">
                        {getPeriodLabel()} billing units
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
                      <span className="text-gray-600">Billed as:</span>
                      <span className="font-semibold text-gray-900">{billedDuration}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Rate per day:</span>
                      <span className="font-semibold text-gray-900">₹{getCurrentPriceForPeriod()?.toFixed(2)}</span>
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
                  totalCost <= 0 ||
                  !currentAddress.trim() ||
                  !permanentAddress.trim() ||
                  !isDigilockerVerified ||
                  !hasRequiredDocuments ||
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
                  totalCost <= 0 ||
                  !currentAddress.trim() ||
                  !permanentAddress.trim() ||
                  !isDigilockerVerified ||
                  !hasRequiredDocuments ||
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
    </>
  );
}
