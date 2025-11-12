"use client";

import { useState, useEffect, useRef } from "react";
import { getAllBanners } from "@/api/banners";
import Image from "next/image";

export default function BannersSection() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const response = await getAllBanners();
        
        if (response.STS === "200" && response.CONTENT && response.CONTENT.length > 0) {
          setBanners(response.CONTENT);
        } else {
          // Set dummy banners if no banners returned from API
          setDummyBanners();
        }
      } catch (err) {
        console.error("Error fetching banners:", err);
        // Set dummy banners on error
        setDummyBanners();
      } finally {
        setLoading(false);
      }
    };

    const setDummyBanners = () => {
      const dummyData = [
        {
          id: 1,
          bannerTitle: "Experience Freedom on Two Wheels",
          bannerDescription: "Rent premium bikes at unbeatable prices. Your adventure starts here!",
          bannerImage: null,
          navigationLink: null,
        },
        {
          id: 2,
          bannerTitle: "Explore Your City, Your Way",
          bannerDescription: "Flexible rentals for daily commutes or weekend getaways. Book now!",
          bannerImage: null,
          navigationLink: null,
        },
        {
          id: 3,
          bannerTitle: "Join Thousands of Happy Riders",
          bannerDescription: "Trusted by riders across the city. Safe, convenient, and affordable.",
          bannerImage: null,
          navigationLink: null,
        },
      ];
      setBanners(dummyData);
    };

    fetchBanners();
  }, []);

  // Auto-slide effect - every 30 seconds
  useEffect(() => {
    if (!isAutoPlaying || banners.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === banners.length - 1 ? 0 : prevIndex + 1
      );
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [banners.length, isAutoPlaying]);

  // Scroll to current index
  useEffect(() => {
    // No need for scroll logic as we're using CSS transform now
  }, [currentIndex, banners.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of manual interaction
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? banners.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  };

  const goToNext = () => {
    const newIndex = currentIndex === banners.length - 1 ? 0 : currentIndex + 1;
    goToSlide(newIndex);
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex justify-center items-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <div className="w-full relative px-4 md:px-6 lg:px-8">
      {/* Slider Container */}
      <div 
        ref={scrollContainerRef}
        className="w-full overflow-hidden rounded-2xl md:rounded-3xl shadow-2xl"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className="banner-card flex-shrink-0 w-full"
            >
              {banner.navigationLink ? (
                <div 
                  onClick={() => {
                    const url = banner.navigationLink.startsWith('http') 
                      ? banner.navigationLink 
                      : `https://${banner.navigationLink}`;
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }}
                  className="block cursor-pointer"
                >
                  <BannerCard banner={banner} />
                </div>
              ) : (
                <div className="block">
                  <BannerCard banner={banner} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-6 md:left-10 lg:left-12 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 md:p-4 shadow-xl hover:shadow-2xl transition-all duration-300 z-10 group hover:scale-110"
            aria-label="Previous banner"
          >
            <svg 
              className="w-5 h-5 md:w-6 md:h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-6 md:right-10 lg:right-12 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 md:p-4 shadow-xl hover:shadow-2xl transition-all duration-300 z-10 group hover:scale-110"
            aria-label="Next banner"
          >
            <svg 
              className="w-5 h-5 md:w-6 md:h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex justify-center gap-2 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full shadow-lg ${
                index === currentIndex 
                  ? 'bg-white w-8 h-3 shadow-xl' 
                  : 'bg-white/60 hover:bg-white/80 w-3 h-3'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BannerCard({ banner }) {
  const [imageError, setImageError] = useState(false);
  
  // Check if the URL is valid
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const hasValidImage = banner.bannerImage && isValidUrl(banner.bannerImage);

  return (
    <div className="relative group">
      {/* Banner Image */}
      <div className="relative h-[400px] sm:h-[450px] md:h-[500px] lg:h-[600px] w-full overflow-hidden">
        {hasValidImage && !imageError ? (
          <Image
            src={banner.bannerImage}
            alt={banner.bannerTitle || "Banner"}
            fill
            className="object-cover"
            priority
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#f51717] via-red-600 to-red-800 flex flex-col items-center justify-center">
            <div className="text-white text-8xl md:text-9xl opacity-30 mb-6">
              🏍️
            </div>
            <span className="text-white text-2xl md:text-4xl font-bold opacity-40">
              RevUp Bikes
            </span>
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 lg:p-16 text-white max-w-7xl mx-auto">
          {banner.bannerTitle && (
            <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 drop-shadow-lg">
              {banner.bannerTitle}
            </h3>
          )}
          {banner.bannerDescription && (
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-100 max-w-3xl drop-shadow-md">
              {banner.bannerDescription}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
