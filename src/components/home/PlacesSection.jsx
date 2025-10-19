"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getAllPlaces } from "@/api/places";
import { useAuth } from "@/contexts/AuthContext";
import fallbackImage from "@/app/images/house.jpg";

// Image component with error handling
const PlaceImage = ({ src, alt, className }) => {
  const [imageSrc, setImageSrc] = useState(src || fallbackImage);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setImageSrc(src || fallbackImage);
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

// Reusable Place Card Component
const PlaceCard = ({ place, isAuthenticated }) => (
  <div className="group relative rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
    {/* Image Container */}
    <div className="relative h-56 overflow-hidden">
      <PlaceImage
        src={place.placeImage}
        alt={place.placeName || "Place"}
        className="rounded-t-2xl object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
      
      {/* Location Badge */}
      {place.placeLocation && (
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md">
          <p className="text-xs font-medium text-gray-700 flex items-center gap-1">
            <span className="text-sm">📍</span>
            {place.placeLocation}
          </p>
        </div>
      )}
    </div>

    {/* Content Container */}
    <div className="p-5">
      {/* Title */}
      <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-red-600 transition-colors">
        {place.placeName || "Unknown Place"}
      </h2>
      
      {/* Description */}
      {place.placeDescription && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
          {place.placeDescription}
        </p>
      )}

      {/* Action Button - Only show if user is authenticated */}
      {isAuthenticated && (
        <Link href={`/bikes/${place.id}`} className="block">
          <button
            aria-label={`Explore bikes at ${place.placeName}`}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl px-5 py-3 hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
          >
            <span>Explore Bikes</span>
            <svg 
              className="w-5 h-5 group-hover:translate-x-1 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </Link>
      )}
      
      {/* Login Prompt for non-authenticated users */}
      {!isAuthenticated && (
        <div className="text-center">
          <Link href="/login">
            <button
              className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-xl px-5 py-3 hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Login to Explore
            </button>
          </Link>
        </div>
      )}
    </div>
  </div>
);

export default function PlacesSection() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAllPlaces();
        
        // Handle the API response structure: { STS, MSG, CONTENT }
        if (response && response.STS === "200" && response.CONTENT) {
          setPlaces(response.CONTENT);
        } else if (response && Array.isArray(response.CONTENT)) {
          setPlaces(response.CONTENT);
        } else if (Array.isArray(response)) {
          // Fallback for direct array response
          setPlaces(response);
        } else {
          setPlaces([]);
          setError(response?.MSG || "Failed to load places");
        }
      } catch (error) {
        console.error("Error fetching places:", error);
        setError(error.message || "Failed to load places");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl">
        {/* Loading skeleton */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl overflow-hidden bg-white shadow-lg animate-pulse">
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
    );
  }

  if (error) {
    return (
      <div className="text-center p-10 bg-red-50 rounded-2xl border-2 border-red-200 max-w-2xl mx-auto">
        <div className="text-red-600 text-5xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-red-800 mb-2">Oops! Something went wrong</h3>
        <p className="text-red-600 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition shadow-lg hover:shadow-xl"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!places || places.length === 0) {
    return (
      <div className="text-center p-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 max-w-2xl mx-auto">
        <div className="text-gray-400 text-6xl mb-4">📍</div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">No Places Available</h3>
        <p className="text-gray-500">Check back soon for exciting new locations!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl">
      {places.map((place, index) => (
        <PlaceCard key={place.id || index} place={place} isAuthenticated={isAuthenticated} />
      ))}
    </div>
  );
}