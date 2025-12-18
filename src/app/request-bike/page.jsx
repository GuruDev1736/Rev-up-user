"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Container from "@/components/common/Container";
import { getAllBikes } from "@/api/bikes";
import { getAllPlaces } from "@/api/places";
import { createBikeRequest } from "@/api/requestBike";
import { useAuth } from "@/contexts/AuthContext";
import fallbackImage from "@/app/images/house.jpg";

// Image component with error handling
const BikeImage = ({ src, alt, className }) => {
  const [imageSrc, setImageSrc] = useState(fallbackImage);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const validateImageSrc = (source) => {
      if (!source || typeof source !== 'string' || source.trim() === '') {
        return fallbackImage;
      }

      const trimmedSrc = source.trim();

      if (trimmedSrc.startsWith('http://') || 
          trimmedSrc.startsWith('https://') || 
          trimmedSrc.startsWith('/')) {
        return trimmedSrc;
      }

      return fallbackImage;
    };

    setImageSrc(validateImageSrc(src));
    setIsError(false);
  }, [src]);

  const handleError = () => {
    if (!isError) {
      setIsError(true);
      setImageSrc(fallbackImage);
    }
  };

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      className={className}
      onError={handleError}
    />
  );
};

export default function RequestBikePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [bikes, setBikes] = useState([]);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [selectedBike, setSelectedBike] = useState(null);
  const [requestNote, setRequestNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch bikes
        const bikesResponse = await getAllBikes();
        if (bikesResponse && bikesResponse.STS === "200" && bikesResponse.CONTENT) {
          const activeBikes = bikesResponse.CONTENT.filter(bike => bike.place?.isActive === true);
          setBikes(activeBikes);
        } else if (Array.isArray(bikesResponse)) {
          const activeBikes = bikesResponse.filter(bike => bike.place?.isActive === true);
          setBikes(activeBikes);
        }

        // Fetch places
        const placesResponse = await getAllPlaces();
        if (placesResponse && placesResponse.STS === "200" && placesResponse.CONTENT) {
          const activePlaces = placesResponse.CONTENT.filter(place => place.isActive === true);
          setPlaces(activePlaces);
        } else if (Array.isArray(placesResponse)) {
          const activePlaces = placesResponse.filter(place => place.isActive === true);
          setPlaces(activePlaces);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "Failed to load bikes");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter bikes
  const filteredBikes = bikes.filter((bike) => {
    const matchesPlace = selectedPlace === "ALL" || bike.place?.id === parseInt(selectedPlace);
    const matchesSearch = bike.bikeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bike.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPlace && matchesSearch;
  });

  const handleContactClick = (bike) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setSelectedBike(bike);
    setShowRequestDialog(true);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    if (!user?.userId || !selectedBike?.id) {
      alert("Please login to submit a request");
      return;
    }

    setSubmitting(true);
    try {
      await createBikeRequest(user.userId, selectedBike.id, requestNote);
      
      // Success - show success dialog
      setShowRequestDialog(false);
      setRequestNote("");
      setShowSuccessDialog(true);
    } catch (error) {
      alert(error.message || "Failed to submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
    setSelectedBike(null);
  };

  const handleCloseDialog = () => {
    setShowRequestDialog(false);
    setRequestNote("");
    setSelectedBike(null);
  };

  if (loading) {
    return (
      <Container className="min-h-screen py-8 px-4 mt-24">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bikes...</p>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="min-h-screen py-8 px-4 mt-24">
        <div className="text-center p-10 bg-red-50 rounded-2xl border-2 border-red-200 max-w-2xl mx-auto">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-red-800 mb-2">Oops! Something went wrong</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="min-h-screen py-8 px-4 mt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Request a Bike</h1>
          <p className="text-gray-600">Browse all available bikes and request one for your needs</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Bar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Bikes</label>
              <input
                type="text"
                placeholder="Search by name or brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Place Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Location</label>
              <select
                value={selectedPlace}
                onChange={(e) => setSelectedPlace(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none bg-white"
              >
                <option value="ALL">All Locations</option>
                {places.map((place) => (
                  <option key={place.id} value={place.id}>
                    {place.placeName} {place.placeLocation && `- ${place.placeLocation}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredBikes.length}</span> bike{filteredBikes.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Bikes Grid */}
        {filteredBikes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBikes.map((bike) => (
              <div
                key={bike.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <BikeImage
                    src={bike.bikeImage}
                    alt={bike.bikeName}
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {bike.quantity === 0 && (
                    <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Out of Stock
                    </div>
                  )}
                  {bike.quantity > 0 && (
                    <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Available
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{bike.bikeName}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {bike.brand} • {bike.bikeModel}
                  </p>

                  {/* Location */}
                  {bike.place && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                      <span>📍</span>
                      <span>{bike.place.placeName}</span>
                    </div>
                  )}

                  {/* Specs */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500">Engine</div>
                      <div className="text-sm font-semibold text-gray-900">{bike.engineCapacity}cc</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500">Fuel</div>
                      <div className="text-sm font-semibold text-gray-900">{bike.fuelType}</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500">Type</div>
                      <div className="text-sm font-semibold text-gray-900">{bike.transmission}</div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Starting from</p>
                    <p className="text-2xl font-bold text-red-600">₹{bike.pricePerDay}/day</p>
                  </div>

                  {/* Request Button */}
                  <button
                    onClick={() => handleContactClick(bike)}
                    disabled={bike.quantity === 0}
                    className={`w-full py-2.5 rounded-lg font-semibold transition-all shadow-md ${
                      bike.quantity === 0
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 hover:shadow-lg'
                    }`}
                  >
                    {bike.quantity === 0 ? 'Currently Unavailable' : 'Request This Bike'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Bikes Found</h3>
            <p className="text-gray-500">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>

      {/* Request Dialog */}
      {showRequestDialog && selectedBike && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Request Bike</h3>
              <button
                onClick={handleCloseDialog}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Bike Info */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Requesting:</p>
              <p className="font-semibold text-gray-900">{selectedBike.bikeName}</p>
              <p className="text-xs text-gray-500">{selectedBike.place?.placeName}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitRequest}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Request Note <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={requestNote}
                  onChange={(e) => setRequestNote(e.target.value)}
                  required
                  rows={4}
                  placeholder="Please provide details about your request (dates, duration, special requirements, etc.)"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseDialog}
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !requestNote.trim()}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Dialog */}
      {showSuccessDialog && selectedBike && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            {/* Success Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h3>
              <p className="text-gray-600 mb-4">
                Your request for <span className="font-semibold text-gray-900">{selectedBike.bikeName}</span> has been successfully submitted.
              </p>
              <p className="text-sm text-gray-500">
                We will contact you soon to confirm your request and discuss the details.
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={handleCloseSuccessDialog}
              className="w-full py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-md"
            >
              Got it, Thanks!
            </button>
          </div>
        </div>
      )}
    </Container>
  );
}
