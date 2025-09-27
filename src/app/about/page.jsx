import Container from "@/components/Container";
import Image from "next/image";
import built from "@/app/images/built.webp";
import journey from "@/app/images/5.webp";

export default function About() {
  return (
    <div>
      <header className="w-full bg-[#f3e8e8] min-h-screen">
        <Container className="w-full flex flex-col min-h-screen justify-center font-bold items-center px-4">
          {/* First Row */}
          <div className="mb-8 flex flex-col sm:flex-row mx-auto gap-4 text-center">
            <h2 className="border-1 px-6 sm:px-12 py-10 text-3xl sm:text-5xl md:text-[70px] rounded-full">
              Heralding
            </h2>
            <h2 className="bg-white border-1 px-6 sm:px-12 py-10 text-2xl sm:text-4xl md:text-[60px] rounded-full">
              A New Era
            </h2>
          </div>

          {/* Second Row */}
          <div className="flex flex-col sm:flex-row mx-auto gap-4 text-center">
            <h2 className="border-1 px-6 sm:px-12 py-10 text-2xl sm:text-4xl md:text-[60px] rounded-full">
              Of
            </h2>
            <h2 className="bg-[#ff8686] border-1 px-6 sm:px-12 py-10 text-2xl sm:text-4xl md:text-[60px] text-white rounded-full">
              Shared Mobility
            </h2>
          </div>
        </Container>
      </header>

      {/* Years Of Making */}
      <div className="bg-[#f3e8e8] w-full items-center">
        <div className="flex flex-col max-w-6xl mx-auto md:flex-row justify-center md:pb-[80px] gap-6 md:gap-10 px-4 md:px-8">
          {/* Left Side */}
          <div className="w-full items-center justify-center text-left flex">
            <h3 className="text-3xl sm:text-4xl md:text-6xl lg:text-[70px] font-semibold leading-tight">
              An idea 3 <br /> years in the making.
            </h3>
          </div>

          {/* Right Side */}
          <div className="w-full text-base sm:text-lg md:text-[17px] leading-relaxed space-y-4">
            <p>
              It started as a simple exchange between two college students nine
              years ago — one of them had a vehicle the other wanted to rent to
              travel to a seminar. It ended with both of them attending the
              seminar, sharing common interests and theorising that they needed
              to create a forum/tool to replicate what they had achieved —
              connect other willing hosts with riders.
            </p>
            <p>
              This idea of a vehicle-sharing platform solidified with RevUp in
              2019, when it was only a neat website for vehicle rentals. Over
              the years, they established a working partnership and collaborated
              on various projects with prominent companies and built their own
              SaaS startup, all while nurturing RevUp. In 2022, they decided to
              take a leap and focus single-handedly on setting up RevUp on a
              large scale as per their original vision.
            </p>
          </div>
        </div>
      </div>

      {/* Revup's Journey */}
      <section className="md:py-16">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 px-6 md:px-10">
          {/* Left Side - Heading */}
          <div className="w-full md:w-1/2 text-left">
            <h3 className="text-3xl sm:text-4xl md:text-6xl lg:text-[70px] font-bold leading-tight tracking-tight">
              Revup's <br /> Journey
            </h3>
          </div>

          {/* Right Side - Content */}
          <div className="w-full md:w-1/2 text-base sm:text-lg md:text-[17px] leading-relaxed space-y-5 text-gray-700">
            <p>
              It started as a simple exchange between two college students nine
              years ago — one of them had a vehicle the other wanted to rent to
              travel to a seminar. It ended with both of them attending the
              seminar, sharing common interests, and theorising that they needed
              to create a forum/tool to replicate what they had achieved —
              connect other willing hosts with riders.
            </p>
          </div>
        </div>
      </section>

      {/* built an app */}
      <div className="bg-[#fbfbfb] min-h-[40vh] flex flex-col items-center justify-center text-center py-16 px-4">
        {/* Heading */}
        <h5 className="font-semibold text-2xl sm:text-3xl md:text-4xl mb-8 max-w-3xl">
          So we built an app that does all that and this
        </h5>

        {/* Image */}
        <div className="flex justify-center">
          <Image src={built} alt="App preview" width={900} height={500} />
        </div>
      </div>

      {/*Join Our Journey */}
      <section className="md:py-16">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start gap-10 px-6 md:px-10">
          <div>
            <Image src={journey} width={450} alt="journey" />
          </div>
          <div className="w-full md:w-1/2 text-left py-[10px]">
            <h3 className="text-3xl sm:text-4xl md:text-6xl lg:text-[70px] font-bold leading-tight tracking-tight">
              Join Our <br /> Journey
            </h3>
            <p className="pt-[50px]">
              Let’s get together and create a future where transportation is
              shared, affordable and reduces the carbon footprint.
            </p>
            <div className="flex gap-5 py-5">
              <p className="hover:text-[#f51717]">Partner With Us</p>
              <p className="hover:text-[#f51717]">Work With Us</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
