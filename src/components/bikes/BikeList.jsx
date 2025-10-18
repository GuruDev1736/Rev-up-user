"use client";

import Image from "next/image";
import { useState } from "react";
import fallbackImage from "@/app/images/house.jpg";

const bikes = [
  {
    id: 1,
    name: "Hero Vida V1 Plus Electric",
    price: 599,
    location: "Amanora Plaza",
    image: "/images/hero-vida.png",
    stock: false,
  },
  {
    id: 2,
    name: "Honda Dio",
    price: 399,
    location: "Amanora Plaza",
    image: "/images/honda-dio.png",
    stock: true,
  },
  {
    id: 3,
    name: "Bajaj Freedom 125 CNG",
    price: 799,
    location: "Amanora Plaza",
    image: "/images/bajaj-freedom.png",
    stock: true,
  },
  {
    id: 4,
    name: "Honda Hornet",
    price: 799,
    location: "Amanora Plaza",
    image: "/images/honda-hornet.png",
    stock: false,
  },
];

function BikeCard({ bike }) {
  return (
    <div className="relative border rounded-2xl shadow-sm hover:shadow-xl transition transform hover:-translate-y-1 bg-white overflow-hidden">
      {/* Out of Stock Badge */}
      {!bike.stock && (
        <span className="absolute top-3 left-3 bg-gray-900/80 backdrop-blur-md text-white text-xs px-2 py-1 rounded-lg shadow-md">
          Out of Stock
        </span>
      )}

      {/* Image */}
      <div className="w-full h-44 flex items-center justify-center bg-gray-50 overflow-hidden">
        <Image
          src={bike.image || fallbackImage}
          alt={bike.name}
          width={200}
          height={140}
          className="object-contain transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = fallbackImage;
          }}
        />
      </div>

      {/* Content */}
      <div className="p-5 text-center">
        <p className="text-sm text-gray-500">{bike.location}</p>
        <h3 className="text-lg font-semibold text-gray-900 mt-1">
          {bike.name}
        </h3>
        <p className="text-xl font-bold text-gray-800 mt-2">₹{bike.price}.00</p>

        <button
          className={`mt-5 w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
            bike.stock
              ? "bg-gradient-to-r from-gray-900 to-gray-700 text-white hover:from-gray-800 hover:to-gray-600 shadow-md"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
          disabled={!bike.stock}
        >
          {bike.stock ? "Book Now" : "Details"}
        </button>
      </div>
    </div>
  );
}

export default function BikeList() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">
        🚲 Available Bikes
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {bikes.map((bike) => (
          <BikeCard key={bike.id} bike={bike} />
        ))}
      </div>
    </div>
  );
}
