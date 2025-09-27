import Container from "@/components/Container";
import React from "react";

export default function Contact() {
  return (
    <div>
      <header className=" bg-[#f3e8e8] w-full min-h-screen border-1 py-16">
        <Container className="border-1 flex min-h-screen items-center gap-5">
          {/* Contact Section */}
          <div className="border-1 w-full">
            <h1 className="font-bold text-[55px]">CONTACT US</h1>
            <p className="text-[15px] mb-10">
              Email us, call, or fill out the form to learn how RevUp can make
              your bike rental experience seamless.
            </p>
            <div className="flex">
              <div className="w-full">
                <h2 className="font-semibold mb-5">Email us</h2>
                <p className="text-[15px]">
                  Stay connected reach us anytime at. info@revupbikes.com
                </p>
              </div>
              <div className="w-full">
                <h2 className="font-semibold mb-5">Opening Hours</h2>
                <p className="text-[15px]">Here for you see our hours!</p>
                <p className="text-[15px]">Mon-Sun: 8 AM - 7 PM</p>
              </div>
              <div className="w-full">
                <h2 className="font-semibold mb-5">Media Inquiries</h2>
                <p className="text-[15px]">
                  For media inquiries call us directly at.
                </p>
                <p className="text-[15px]">+91 7020038007</p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="border-1 w-full">Form</div>
        </Container>
      </header>

      <section className="bg-[#fbfbfb] min-h-screen w-full mx-auto py-16">
        <div className="border-1 py-16">
          <div className="font-bold text-[35px] text-center">
            <h2>Visit Us Today</h2>
          </div>

          <div className="border-1 py-16 justify-center">
            {/* Section 1 */}
            <div className="flex align-center gap-5 justify-center">
              {/* Map Section */}
              <div className="border-1">
                <h2>Map</h2>
              </div>

              {/* Location Details */}
              <div className="border-1 w-[30%]">
                <p>Reach Out Anytime</p>
                <h3 className="text-[30px] font-semibold">
                  Connecting Near and Far
                </h3>
                <h2 className="font-semibold pt-[20px] pb-[20px]">
                  Main Office
                </h2>
                <p>
                  Parking Ground, Nearby Noble Hospital, Magarpatta North
                  Hadapsar, Hadapsar, Pune, Maharashtra 411013.
                </p>
                <h2 className="font-semibold pt-[20px] pb-[20px]">
                  Contact Us
                </h2>
                <p>+91 7020038007</p>
              </div>
            </div>
            <br />
            <br />
            {/* Section 2 */}
            <div className="flex align-center gap-5 justify-center">
              {/* Location Details */}
              <div className="border-1 w-[30%]">
                <p>Reach Out Anytime</p>
                <h3 className="text-[30px] font-semibold">
                  Connecting Near and Far
                </h3>
                <h2 className="font-semibold pt-[20px] pb-[20px]">
                  Main Office
                </h2>
                <p>
                  Parking Ground, Nearby Noble Hospital, Magarpatta North
                  Hadapsar, Hadapsar, Pune, Maharashtra 411013.
                </p>
                <h2 className="font-semibold pt-[20px] pb-[20px]">
                  Contact Us
                </h2>
                <p>+91 7020038007</p>
              </div>

              {/* Map Section */}
              <div className="border-1">
                <h2>Map</h2>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
