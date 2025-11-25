"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getAllBikes } from "@/api/bikes";
import fallbackImage from "@/app/images/house.jpg";

// Image component with error handling
const BikeImage = ({ src, alt, className }) => {
  const [imageSrc, setImageSrc] = useState(fallbackImage);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    // Validate and sanitize image source
    const validateImageSrc = (source) => {
      if (!source || typeof source !== 'string' || source.trim() === '') {
        return fallbackImage;
      }

      const trimmedSrc = source.trim();

      // Check if it's a valid URL format
      // Accept: absolute URLs (http/https), or paths starting with /
      if (trimmedSrc.startsWith('http://') || 
          trimmedSrc.startsWith('https://') || 
          trimmedSrc.startsWith('/')) {
        return trimmedSrc;
      }

      // For relative paths without leading slash (like "img1.jpg"), use fallback
      console.warn('Invalid bike image path:', trimmedSrc);
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
      width={600}
      height={400}
      className={className}
      onError={handleError}
      priority={false}
    />
  );
};

// Bike Card Component
const BikeCard = ({ bike }) => {
  const [pricingPeriod, setPricingPeriod] = useState("day");
  const router = useRouter();

  // Get prices from API response
  const getPriceByPeriod = () => {
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

  const getDailyRate = () => {
    switch (pricingPeriod) {
      case "day":
        return bike.pricePerDay || 0;
      case "week":
        return bike.pricePerWeek ? (bike.pricePerWeek / 7).toFixed(2) : 0;
      case "month":
        return bike.pricePerMonth ? (bike.pricePerMonth / 30).toFixed(2) : 0;
      default:
        return bike.pricePerDay || 0;
    }
  };

  const handleBookNow = () => {
    // Store bike data and selected pricing period in localStorage
    localStorage.setItem("selectedBike", JSON.stringify(bike));
    localStorage.setItem("selectedPricingPeriod", pricingPeriod);
    router.push(`/booking/${bike.id}`);
  };

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
      {/* Bike Image */}
      <div className="relative h-56 overflow-hidden">
        <BikeImage
          src={bike.bikeImage}
          alt={bike.bikeName}
          className="rounded-t-2xl object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-800 backdrop-blur-sm">
            {bike.category}
          </span>
        </div>

        {/* Place Badge */}
        {bike.place && (
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md">
            <p className="text-xs font-medium text-gray-700 flex items-center gap-1">
              <span className="text-sm">📍</span>
              {bike.place.placeName}
            </p>
          </div>
        )}
      </div>

      {/* Bike Details */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-red-600 transition-colors">
          {bike.bikeName}
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          {bike.brand} • {bike.bikeModel}
        </p>
        <p className="text-sm text-gray-700 mb-4 line-clamp-2 leading-relaxed">
          {bike.description}
        </p>

        {/* Specifications */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">⚡</span>
            <span className="text-gray-700">{bike.engineCapacity}cc</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">⛽</span>
            <span className="text-gray-700">{bike.fuelType}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">⚙️</span>
            <span className="text-gray-700">{bike.transmission}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">📦</span>
            <span className={`text-xs font-semibold ${
              bike.quantity > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {bike.quantity || 0} Available
            </span>
          </div>
        </div>

        {/* Pricing with Period Selector */}
        <div className="border-t pt-4">
          <div className="mb-3">
            <label className="text-xs text-gray-500 mb-2 block">Rental Period</label>
            <select
              value={pricingPeriod}
              onChange={(e) => setPricingPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all bg-white"
            >
              <option value="day">Per Day</option>
              {bike.pricePerWeek && <option value="week">Per Week</option>}
              {bike.pricePerMonth && <option value="month">Per Month</option>}
            </select>
          </div>
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-xs text-gray-500">{getPeriodLabel()}</p>
              <p className="text-2xl font-bold text-red-600">
                ₹{getPriceByPeriod()}
              </p>
            </div>
            {pricingPeriod !== "day" && (
              <div className="text-right">
                <p className="text-xs text-gray-500">Daily Rate</p>
                <p className="text-sm text-gray-700 font-semibold">
                  ₹{getDailyRate()}/day
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleBookNow}
            disabled={bike.quantity === 0}
            className={`w-full py-2.5 rounded-xl font-semibold transition-all shadow-md transform ${
              bike.quantity === 0
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 hover:shadow-lg hover:scale-105'
            }`}
          >
            {bike.quantity === 0 ? 'Out of Stock' : 'Book Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function BikesList() {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [categories, setCategories] = useState([]);
  const [itemsToShow, setItemsToShow] = useState(10); // Show 10 items initially

  useEffect(() => {
    const fetchBikes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAllBikes();

        if (response && response.STS === "200" && response.CONTENT) {
          setBikes(response.CONTENT);
          // Extract unique categories
          const uniqueCategories = [
            ...new Set(response.CONTENT.map((bike) => bike.category)),
          ].filter(Boolean);
          setCategories(uniqueCategories);
        } else if (Array.isArray(response)) {
          setBikes(response);
          const uniqueCategories = [
            ...new Set(response.map((bike) => bike.category)),
          ].filter(Boolean);
          setCategories(uniqueCategories);
        } else {
          setBikes([]);
          setError(response?.MSG || "Failed to load bikes");
        }
      } catch (error) {
        console.error("Error fetching bikes:", error);
        setError(error.message || "Failed to load bikes");
      } finally {
        setLoading(false);
      }
    };

    fetchBikes();
  }, []);

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

  // Get bikes to display based on pagination
  const displayedBikes = filteredBikes.slice(0, itemsToShow);
  const hasMore = filteredBikes.length > itemsToShow;

  // Handle load more
  const handleLoadMore = () => {
    setItemsToShow((prev) => prev + 10); // Load 10 more bikes
  };

  // Reset pagination when filters change
  useEffect(() => {
    setItemsToShow(10);
  }, [searchQuery, selectedCategory]);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden bg-white shadow-lg animate-pulse"
            >
              <div className="bg-gradient-to-br from-gray-200 to-gray-300 w-full h-56"></div>
              <div className="p-5">
                <div className="bg-gray-300 h-6 rounded-lg mb-3 w-3/4"></div>
                <div className="bg-gray-200 h-4 rounded mb-2 w-full"></div>
                <div className="bg-gray-200 h-4 rounded mb-4 w-5/6"></div>
                <div className="bg-gray-300 h-12 rounded-xl w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4">
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
    );
  }

  if (!bikes || bikes.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4">
        <div className="text-center p-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
          <div className="text-gray-400 text-6xl mb-4">🏍️</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            No Bikes Available
          </h3>
          <p className="text-gray-500">
            Check back soon for exciting new rides!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      {/* Search and Filter Section */}
      <div className="mb-8 space-y-6">
        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto">
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
        <div className="flex justify-center gap-3 flex-wrap">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-5 py-2.5 rounded-full font-semibold transition-all transform hover:scale-105 ${
              selectedCategory === "ALL"
                ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200"
            }`}
          >
            All Categories
            <span className="ml-2 text-xs opacity-80">({bikes.length})</span>
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
          <div className="flex items-center justify-center gap-3 flex-wrap">
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
        <div className="text-center">
          <p className="text-gray-600 font-medium">
            Showing {displayedBikes.length} of {filteredBikes.length} bikes
            {filteredBikes.length !== bikes.length && (
              <span className="text-gray-500"> (filtered from {bikes.length} total)</span>
            )}
          </p>
        </div>
      </div>

      {/* Bikes Grid */}
      {filteredBikes.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedBikes.map((bike, index) => (
              <BikeCard key={bike.id || index} bike={bike} />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="mt-12 text-center">
              <button
                onClick={handleLoadMore}
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-2xl font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span>Load More Bikes</span>
                <svg
                  className="w-5 h-5 group-hover:translate-y-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                <span className="absolute -top-2 -right-2 bg-white text-red-600 text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                  +{filteredBikes.length - itemsToShow}
                </span>
              </button>
              <p className="text-sm text-gray-500 mt-4">
                {filteredBikes.length - itemsToShow} more bikes available
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center p-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
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
    </div>
  );
}
