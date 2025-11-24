"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { getBikeByPlaceId } from "@/api/bikes";
import Container from "@/components/common/Container";

export default function BikesPage() {
  const params = useParams();
  const router = useRouter();
  const placeId = params.placeId;

  const [bikes, setBikes] = useState([]);
  const [placeName, setPlaceName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchBikes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getBikeByPlaceId(placeId);

        if (response.STS === "200" && response.CONTENT) {
          setBikes(response.CONTENT);
          // Get place name from first bike if available
          if (response.CONTENT.length > 0 && response.CONTENT[0].place) {
            setPlaceName(response.CONTENT[0].place.placeName);
          }
          // Extract unique categories
          const uniqueCategories = [
            ...new Set(response.CONTENT.map((bike) => bike.category)),
          ].filter(Boolean);
          setCategories(uniqueCategories);
        } else {
          setError(response.MSG || "Failed to fetch bikes");
        }
      } catch (err) {
        console.error("Error fetching bikes:", err);
        setError("Failed to load bikes. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (placeId) {
      fetchBikes();
    }
  }, [placeId]);

  // Filter bikes based on search query and category
  const filteredBikes = bikes.filter((bike) => {
    const matchesSearch =
      bike.bikeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bike.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bike.bikeModel?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bike.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "ALL" || bike.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 text-green-800 border-green-200";
      case "RENTED":
        return "bg-red-100 text-red-800 border-red-200";
      case "MAINTENANCE":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <>
      <Container>
        <div className="min-h-screen py-12 mt-32">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </button>
            <h1 className="text-4xl font-bold text-gray-900">
              {placeName ? `Bikes in ${placeName}` : "Available Bikes"}
            </h1>
            <p className="text-gray-600 mt-2">
              Choose from our wide selection of bikes
            </p>
          </div>

          {/* Search and Filter Section */}
          {!loading && !error && bikes.length > 0 && (
            <div className="mb-8 space-y-6">
              {/* Search Bar */}
              <div className="relative max-w-2xl">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search bikes by name, brand, or model..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all outline-none text-gray-700 placeholder-gray-400 shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {/* Category Filters */}
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => setSelectedCategory("ALL")}
                  className={`px-5 py-2.5 rounded-full font-semibold transition-all transform hover:scale-105 ${
                    selectedCategory === "ALL"
                      ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg"
                      : "bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200"
                  }`}
                >
                  All Categories
                  <span className="ml-2 text-xs opacity-80">
                    ({bikes.length})
                  </span>
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-5 py-2.5 rounded-full font-semibold transition-all transform hover:scale-105 capitalize ${
                      selectedCategory === category
                        ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg"
                        : "bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200"
                    }`}
                  >
                    {category}
                    <span className="ml-2 text-xs opacity-80">
                      ({bikes.filter((b) => b.category === category).length})
                    </span>
                  </button>
                ))}
              </div>

              {/* Active Filters Display */}
              {(searchQuery || selectedCategory !== "ALL") && (
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm text-gray-600 font-medium">
                    Active filters:
                  </span>
                  {searchQuery && (
                    <span className="px-4 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-medium flex items-center gap-2">
                      Search: "{searchQuery}"
                      <button
                        onClick={() => setSearchQuery("")}
                        className="hover:text-red-900"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {selectedCategory !== "ALL" && (
                    <span className="px-4 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-medium flex items-center gap-2 capitalize">
                      Category: {selectedCategory}
                      <button
                        onClick={() => setSelectedCategory("ALL")}
                        className="hover:text-red-900"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("ALL");
                    }}
                    className="text-sm text-red-600 hover:text-red-700 font-semibold underline"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* Results Count */}
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{filteredBikes.length}</span> of{" "}
                <span className="font-semibold">{bikes.length}</span> bikes
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse"
                >
                  <div className="w-full h-64 bg-gray-200" />
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-10 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Oops! Something went wrong
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && bikes.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🏍️</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                No Bikes Available
              </h2>
              <p className="text-gray-600 mb-6">
                There are currently no bikes available at this location.
              </p>
              <button
                onClick={() => router.push("/")}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all"
              >
                Browse Other Locations
              </button>
            </div>
          )}

          {/* Bikes Grid */}
          {!loading && !error && bikes.length > 0 && (
            <>
              {filteredBikes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredBikes.map((bike) => (
                <div
                  key={bike.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
                >
                  {/* Bike Image */}
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={bike.bikeImage}
                      alt={bike.bikeName}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          bike.status
                        )}`}
                      >
                        {bike.status}
                      </span>
                    </div>
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-800 backdrop-blur-sm">
                        {bike.category}
                      </span>
                    </div>
                  </div>

                  {/* Bike Details */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {bike.bikeName}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {bike.brand} • {bike.bikeModel}
                    </p>
                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                      {bike.description}
                    </p>

                    {/* Specifications */}
                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">⚡</span>
                        <span className="text-gray-700">
                          {bike.engineCapacity}cc
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">⛽</span>
                        <span className="text-gray-700">{bike.fuelType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">⚙️</span>
                        <span className="text-gray-700">
                          {bike.transmission}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">🔢</span>
                        <span className="text-gray-700 text-xs">
                          {bike.registrationNumber}
                        </span>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="border-t pt-4 mb-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-gray-500">Per Hour</p>
                          <p className="text-lg font-bold text-gray-900">
                            ₹{bike.pricePerHour.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Per Day</p>
                          <p className="text-lg font-bold text-gray-900">
                            ₹{bike.pricePerDay.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => {
                        if (bike.status === "AVAILABLE") {
                          // Store bike data in localStorage for the booking page
                          localStorage.setItem("selectedBike", JSON.stringify(bike));
                          // Navigate to booking page
                          router.push(`/booking/${bike.id}`);
                        }
                      }}
                      disabled={bike.status !== "AVAILABLE"}
                      className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                        bike.status === "AVAILABLE"
                          ? "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 hover:shadow-lg"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {bike.status === "AVAILABLE"
                        ? "Book Now"
                        : bike.status === "RENTED"
                        ? "Currently Rented"
                        : "Under Maintenance"}
                    </button>
                  </div>
                </div>
              ))}
                </div>
              ) : (
                <div className="text-center p-12 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                  <div className="text-gray-400 text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">
                    No bikes found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {searchQuery || selectedCategory !== "ALL"
                      ? "Try adjusting your search or filters to find more bikes."
                      : "No bikes available at the moment."}
                  </p>
                  {(searchQuery || selectedCategory !== "ALL") && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("ALL");
                      }}
                      className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition shadow-lg hover:shadow-xl"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}
            </>
            )}
          </div>
        </Container>
      </>
    );
  }
