import Container from "../Container";
import Image from "next/image";
import image from "@/app/images/house.jpg";
import banner from "@/app/images/homepage-banner.avif";
import Accordian from "./Accordian";
import TextHover from "./ImageHover";
import GirlImage from "@/app/images/girl.webp";
import GroupImage from "@/app/images/Group.webp";
import chevron from "@/app/images/chevron.webp";
import app from "@/app/images/app-1.webp";
import { IoLogoGooglePlaystore } from "react-icons/io5";
import { FaApple } from "react-icons/fa";

// Reusable Card Component
const LocationCard = ({ title, img, alt }) => (
  <div className="rounded-2xl p-6 bg-white text-gray-900 shadow-xl hover:shadow-2xl transition duration-300">
    <Image
      src={img}
      alt={alt}
      width={600}
      height={400}
      className="rounded-xl object-cover w-full h-auto"
    />
    <h2 className="text-2xl font-semibold mt-4">{title}</h2>
    <button
      aria-label={`Book a ride for ${title}`}
      className="mt-4 bg-black text-white rounded-full px-5 py-2 hover:bg-gray-800 transition duration-300"
    >
      Book Now
    </button>
  </div>
);

const TestimonialCard = ({ name, description }) => (
  <div className="rounded-2xl px-6 py-12 bg-[#f3e8e8] text-gray-800 duration-300">
    <h2 className="text-xl mt-4 text-[#000000] ">{name}</h2>
    <p className="text-[15px] text-[#686868]">{description}</p>
  </div>
);

export default function HeroSection() {
  return (
    <div>
      {/* Hero Section Starts */}
      <header className="relative w-full min-h-screen flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 -z-10">
          <Image
            src={banner}
            alt="Hero Background"
            fill
            priority
            className="object-cover"
          />
          {/* Dark Overlay for readability */}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Foreground Content */}
        <Container className="relative w-full">
          <div className="mb-8 text-left">
            <h1 className="font-bold text-3xl md:text-3xl lg:text-4xl text-white drop-shadow-lg">
              Your Journey, Your Ride
            </h1>
          </div>

          {/* Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl max-h-2">
            <LocationCard
              title="Amanora Plaza"
              img={image}
              alt="Amanora Plaza"
            />
            <LocationCard title="Magarpatta" img={image} alt="Magarpatta" />
          </div>
        </Container>
      </header>

      {/* Hero Section Ends */}

      <div className="bg-[#fbfbfb] min-h-[70vh] w-full flex flex-col justify-center px-4 py-16">
        <div className="text-center mb-8">
          <h2 className="font-semibold text-3xl sm:text-4xl text-[45px]">
            Find your ride
          </h2>
          <p>
            Explore the types of vehicles on our shared mobility marketplace.
          </p>
        </div>

        {/* Accordian Section */}
        <div className="flex items-center justify-center max-w-screen">
          <Accordian className="w-full max-w-md sm:max-w-lg md:max-w-2xl" />
        </div>
      </div>

      {/* Image Hover Section */}
      <div className="bg-[#fbfbfb] min-h-[70vh] w-full flex flex-col justify-center px-4 py-16">
        {/* Hovering Section */}
        <div className="w-full flex flex-col sm:flex-row gap-6 justify-center items-center">
          <div className="w-full sm:w-11/12 lg:w-5/6 flex justify-center">
            <TextHover />
          </div>
        </div>
      </div>

      {/* Idle Vehicle Section */}
      <div className="bg-[#ffff] min-h-[80vh] w-full flex flex-col justify-center items-center px-4 py-16">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-10 justify-center">
          {/* Left: Image */}
          <div className="w-full lg:w-1/2 flex justify-center">
            <Image
              src={GirlImage}
              alt="idle-vehicle"
              width={500}
              height={500}
              className="rounded-xl shadow-md"
            />
          </div>

          {/* Right: Text Content */}
          <div className="w-full lg:w-1/2 px-[40px] flex flex-col gap-4 text-left">
            <h3 className="font-semibold text-3xl sm:text-4xl md:text-[65px] leading-snug">
              Have an idle vehicle?
            </h3>
            <p className="text-gray-600 font-extralight text-lg sm:text-xl md:text-[18px]">
              With just 5 simple steps, list your two-wheeler on Revup and
              become a verified host in your city. Connect with riders, share
              your ride, and start earning effortlessly.
            </p>
            <button className="mt-4 w-fit border-1  text-black font-medium rounded-full px-6 py-2 transition hover:bg-[#f51717] hover:text-white">
              List Your Vehicle
            </button>
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <section className="bg-[#fbfbfb] w-full flex justify-center px-4 py-16">
        <div className="w-full max-w-7xl border-2 rounded-xl p-8 md:p-16 flex flex-col md:flex-row items-center gap-10">
          {/* Left: Heading */}
          <div className="flex-1 text-left">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-semibold leading-snug mb-6">
              Relationships <br /> made out of trust.
            </h2>
            <p className="text-gray-600 mb-4">
              Revup has layers of security checks to ensure only the right
              riders and hosts join our community. We vet all our riders so you
              don’t have to.
            </p>
            <p className="text-gray-600 mb-6">
              Sit back and earn by renting out your idle vehicle to verified
              riders.
            </p>

            <button className="mt-4 w-fit border-1 text-black font-medium rounded-full px-6 py-2 transition hover:bg-[#f51717] hover:text-white">
              Learn More
            </button>
          </div>

          {/* Right: Image */}
          <div className="flex-1 flex justify-center">
            <Image
              src={GroupImage}
              alt="Relationships made out of trust"
              width={400}
              height={400}
              className="w-full max-w-sm object-contain"
            />
          </div>
        </div>
      </section>

      {/* Mobility reinvented section */}
      <section className="bg-[#f3e8e8] w-full flex justify-center px-4 py-16">
        <div className="w-full max-w-7xl p-6 md:p-12 flex flex-col md:flex-row items-start md:items-center gap-10 md:gap-20 lg:gap-32">
          {/* Left content */}
          <div className="flex-1 text-left">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-semibold leading-snug mb-6">
              Mobility <br />
              reinvented.
            </h2>
            <div className="flex gap-2">
              <Image src={chevron} alt="chevron" />
              <Image src={chevron} alt="chevron" />
              <Image src={chevron} alt="chevron" />
            </div>
          </div>

          {/* Right content */}
          <div className="flex-1">
            <p className="text-[#000] mb-6 text-lg sm:text-xl">
              Here’s something for everyone. Wish to rent a bike for your coming
              trip? We got you covered!
            </p>
            <p className="text-[#000] mb-6 text-lg sm:text-xl font-light">
              Whether you are getting ready for your next adventure or just
              wanting to ride into the sunset. Revup is here with the ideal
              vehicle for you. Ride hassle-free and make core memories.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#fff] justify-center px-4 py-16 mx-auto">
        <div className=" mx-auto max-w-6xl">
          {/* Heading */}
          <div className="w-full max-w-7xl px-6 md:px-0 flex flex-col md:flex-row items-start md:items-start gap-10 md:gap-20 lg:gap-32">
            <div className="flex-1 text-left">
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-semibold leading-snug mb-6">
                Real People
                <br />
                Real Talk
              </h2>
            </div>
          </div>

          {/* Testimonials */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <TestimonialCard
              name="Vikram Singh"
              description="Renting a scooter from Revup was a game-changer for my commute. Affordable, hassle-free, and super convenient! I never worry about traffic anymore. Thanks, Revup!"
            />
            <TestimonialCard
              name="Sachin Thomas"
              description="Road trips are my passion, and Revup made it even better. Rented a bike last weekend, and it was in top-notch condition. The freedom to explore, all thanks to Revup!"
            />
            <TestimonialCard
              name="Dixita Das"
              description="As a student, budget-friendly options matter. Renting a scooter from Revup saved me money and time. Now, I can focus on my studies without worrying about my commute!"
            />
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}

      <section className=" justify-center items-center px-6 py-16 max-auto">
        <div className="bg-[#ff0000] flex flex-col md:flex-row justify-between items-center mx-auto max-w-6xl rounded-3xl px-6 md:px-[60px] gap-6">
          {/* Left Side */}
          <div className="text-left text-white">
            <h2 className="text-sm md:text-[15px]">DOWNLOAD APP</h2>
            <h2 className="font-bold text-2xl md:text-[35px]">Coming Soon</h2>

            <div className="flex flex-col sm:flex-row justify-start gap-3 mt-4">
              <div className="flex items-center flex-row bg-black rounded-full px-6 py-3 gap-2">
                <button>App Store</button>
                <IoLogoGooglePlaystore className="text-[15px]" />
              </div>
              <div className="flex items-center flex-row rounded-full px-6 py-3 bg-black gap-2">
                <button>Play Store</button>
                <FaApple />
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="borer-1 flex justify-center md:justify-end">
            <Image
              src={app}
              alt="download"
              width={250}
              height={100}
              className="object-contain"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
