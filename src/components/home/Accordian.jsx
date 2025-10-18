"use client";

import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import BikeCarousel from "../bikes/BikeCarousel";

const items = [
  {
    id: 1,
    title: "Scooters",
    content:
      "Find the perfect scooter from down your street or all the way across the country, for whatever your trip demands.",
    type: "Scooter",
  },
  {
    id: 2,
    title: "Motorbikes",
    content:
      "Find the perfect motorbike from down your street or all the way across the country, for whatever your trip demands.",
    type: "Motorbikes",
  },
  {
    id: 3,
    title: "Sports Motorbikes",
    content:
      "Find the perfect motorbike from down your street or all the way across the country, for whatever your trip demands.",
    type: "Sports Motorbikes",
  },
];

export default function Accordian() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordian = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mx-auto bg-[#f3e8e8] rounded-xl w-[70%]">
      {items.length > 0 ? (
        items.map((item, index) => (
          <div key={index} className="border-grey-100">
            <button
              onClick={() => toggleAccordian(index)}
              className="w-full flex justify-between p-4 transition"
            >
              <span className="text-[22px] font-medium">{item.title}</span>
              <FaChevronDown
                className={`transition-transform transform ${
                  openIndex === index ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all ${
                openIndex === index ? "max-h-screen p-[30px]" : "max-h-0"
              }`}
            >
              <p className="mb-8">{item.content}</p>
              <h6 className="font-bold text-[20px]">Rent a {item.type}</h6>
              <BikeCarousel />
            </div>
          </div>
        ))
      ) : (
        <p className="text-grey-500 text-center p-4">No Item Available</p>
      )}
    </div>
  );
}
