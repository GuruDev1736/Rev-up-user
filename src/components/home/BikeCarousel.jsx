"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import Image from "next/image";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const bikes = [
  {
    id: 1,
    image: "",
    name: "TVS NTORQ 125",
    location: "Magarpatta",
    price: "450",
  },
  {
    id: 2,
    image: "",
    name: "Honda Dio",
    location: "Hadapasar",
    price: "399",
  },
  {
    id: 3,
    image: "",
    name: "Hero Vida V1 Plus Electric",
    location: "Magarpatta",
    price: "459",
  },
  {
    id: 4,
    image: "",
    name: "TVS Jupitar",
    location: "Hadapasar",
    price: "459",
  },
  {
    id: 5,
    image: "",
    name: "Activa 6G",
    location: "Magarpatta",
    price: "459",
  },
  {
    id: 6,
    image: "",
    name: "Activa 6G",
    location: "Hadapasar",
    price: "399",
  },
];

export default function BikeCarousel() {
  return (
    <div className="bg-[#f7ecec] py-10 h-[400px]">{/* set height for vertical swiper */}
      <Swiper
        direction="horizontal"
        modules={[Navigation, Pagination]}
        spaceBetween={30} // space between cards
        navigation
        pagination={{ clickable: true }}
        loop={true}
        slidesPerView={3} // how many cards to show at a time
        breakpoints={{
          0: { slidesPerView: 1 }, // Mobile
          640: { slidesPerView: 2 }, // Tablet
          1024: { slidesPerView: 3 }, // Desktop
        }}
        className="px-5 sm:px-10 h-full"
      >
        {bikes.map((bike) => (
          <SwiperSlide key={bike.id}>
            <div className="bg-white rounded-2xl shadow p-5 flex flex-col items-center h-[250px]">
              <div className="w-full h-32 flex items-center justify-center">
                <Image
                  src={bike.image || "/placeholder.png"}
                  alt={bike.name}
                  width={200}
                  height={150}
                  className="rounded-lg object-contain"
                />
              </div>
              <h3 className="text-lg font-bold mt-4">{bike.name}</h3>
              <p className="text-gray-500 text-sm">{bike.location}</p>
              <p className="text-red-600 font-bold mt-2">
                ₹{bike.price}
                <span className="text-gray-500 font-normal">/ day</span>
              </p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
