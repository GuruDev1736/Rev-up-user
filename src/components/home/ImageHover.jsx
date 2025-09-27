"use client";

import { useState } from "react";
import Image from "next/image";
import img1 from "@/app/images/1.webp";
import img2 from "@/app/images/2.webp";
import img3 from "@/app/images/3.webp";
import img4 from "@/app/images/4.webp";

export default function TextHover() {
  const [activeId, setActiveId] = useState(1); // default active (first)
  const [hoveredId, setHoveredId] = useState(null);

  const steps = [
    { id: 1, title: "Sign Up", img: img1 },
    { id: 2, title: "Search", img: img2 },
    { id: 3, title: "Prebook", img: img3 },
    { id: 4, title: "Travel", img: img4 },
  ];

  // pick either hovered or active
  const currentId = hoveredId ?? activeId;

  return (
    <div className="flex flex-row w-full">
      {/* Text List */}

      <div className="p-6 w-[40%]">
        <ul className="font-semibold text-left">
          {/* Title Section */}
          <div className="mb-12 text-left max-w-4xl mx-auto">
            <h2 className="font-semibold text-3xl sm:text-4xl md:text-[35px] mb-6 leading-snug">
              Simplified ride-finding
            </h2>
          </div>
          {steps.map((step) => (
            <li
              key={step.id}
              className={`text-[15px] mb-8 cursor-pointer transition-colors duration-300 ${
                currentId === step.id ? "text-[#000]" : "text-[#979797]"
              }`}
              onMouseEnter={() => setHoveredId(step.id)}    
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => setActiveId(step.id)}
            >
              {step.id < 10 ? `0${step.id}` : step.id}.
              <span className="text-[45px] ml-2">{step.title}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Image Section */}
      <div className=" grid place-items-center flex-1">
        <div className="flex gap-[0.5rem] p-[0.5rem] w-full max-w-6xl">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`group relative flex-1 h-[70vh] cursor-pointer overflow-hidden rounded-2xl shadow-lg transition-all duration-500 ${
                currentId === step.id ? "flex-[2]" : "flex-1"
              }`}
              onMouseEnter={() => setHoveredId(step.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => setActiveId(step.id)}
            >
              <Image
                src={step.img}
                alt={step.title}
                width={500}
                height={500}
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  currentId === step.id ? "scale-110" : "scale-100"
                }`}
              />
              {/* Overlay Text */}
              <div
                className={`absolute inset-0 bg-black/40 transition-opacity duration-500 flex items-center justify-center ${
                  currentId === step.id ? "opacity-100" : "opacity-0"
                }`}
              >
                <p className="text-white text-2xl font-bold">{step.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
