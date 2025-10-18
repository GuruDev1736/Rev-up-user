"use client";
import Container from "@/components/common/Container";
import React, { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    // Simulate form submission
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitMessage("Thank you! Your message has been sent successfully.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      setSubmitMessage("Sorry, there was an error sending your message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-20">
      <header className="bg-[#f3e8e8] w-full min-h-screen py-16">
        <Container className="flex flex-col lg:flex-row min-h-screen items-center gap-10">
          {/* Contact Info Section */}
          <div className="w-full lg:w-1/2">
            <h1 className="font-bold text-3xl md:text-4xl lg:text-5xl mb-6">CONTACT US</h1>
            <p className="text-gray-600 mb-10 text-sm md:text-base">
              Email us, call, or fill out the form to learn how RevUp can make
              your bike rental experience seamless.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center mb-3">
                  <svg className="w-6 h-6 text-black mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.95L21 8M3 8v10h18V8" />
                  </svg>
                  <h2 className="font-semibold text-lg">Email Us</h2>
                </div>
                <p className="text-gray-600 text-sm">
                  Stay connected, reach us anytime at:
                </p>
                <p className="text-black font-medium">info@revupbikes.com</p>
              </div>
              
              <div>
                <div className="flex items-center mb-3">
                  <svg className="w-6 h-6 text-black mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h2 className="font-semibold text-lg">Opening Hours</h2>
                </div>
                <p className="text-gray-600 text-sm mb-1">Here for you - see our hours!</p>
                <p className="text-black font-medium">Mon-Sun: 8 AM - 7 PM</p>
              </div>
              
              <div>
                <div className="flex items-center mb-3">
                  <svg className="w-6 h-6 text-black mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <h2 className="font-semibold text-lg">Phone Support</h2>
                </div>
                <p className="text-gray-600 text-sm">
                  Call us directly for immediate assistance:
                </p>
                <p className="text-black font-medium">+91 7020038007</p>
              </div>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="booking">Bike Booking</option>
                    <option value="support">Technical Support</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-vertical"
                    placeholder="Tell us how we can help you..."
                  ></textarea>
                </div>
                
                {submitMessage && (
                  <div className={`p-4 rounded-lg text-center ${
                    submitMessage.includes('error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {submitMessage}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending Message...
                    </span>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </div>
          </div>
        </Container>
      </header>

      <section className="bg-[#fbfbfb] w-full py-16">
        <Container>
          <div className="text-center mb-16">
            <h2 className="font-bold text-3xl md:text-4xl mb-4">Visit Us Today</h2>
            <p className="text-gray-600 text-lg">Find us at our main office location</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Location Details */}
            <div className="order-2 lg:order-1">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="mb-6">
                  <p className="text-gray-500 text-sm uppercase tracking-wide mb-2">Reach Out Anytime</p>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
                    Connecting Near and Far
                  </h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center mb-3">
                      <svg className="w-6 h-6 text-black mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <h4 className="font-semibold text-lg">Main Office</h4>
                    </div>
                    <p className="text-gray-600 leading-relaxed ml-9">
                      Parking Ground, Nearby Noble Hospital,<br />
                      Magarpatta North Hadapsar, Hadapsar,<br />
                      Pune, Maharashtra 411013
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center mb-3">
                      <svg className="w-6 h-6 text-black mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <h4 className="font-semibold text-lg">Contact Number</h4>
                    </div>
                    <p className="text-gray-600 ml-9">+91 7020038007</p>
                  </div>

                  <div>
                    <div className="flex items-center mb-3">
                      <svg className="w-6 h-6 text-black mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.95L21 8M3 8v10h18V8" />
                      </svg>
                      <h4 className="font-semibold text-lg">Email Address</h4>
                    </div>
                    <p className="text-gray-600 ml-9">info@revupbikes.com</p>
                  </div>

                  <div>
                    <div className="flex items-center mb-3">
                      <svg className="w-6 h-6 text-black mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h4 className="font-semibold text-lg">Business Hours</h4>
                    </div>
                    <p className="text-gray-600 ml-9">Monday - Sunday: 8:00 AM - 7:00 PM</p>
                  </div>
                </div>

                <div className="mt-8">
                  <a
                    href="https://maps.google.com/?q=Parking+Ground+Nearby+Noble+Hospital+Magarpatta+North+Hadapsar+Pune+Maharashtra+411013"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition duration-300"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                    </svg>
                    Get Directions
                  </a>
                </div>
              </div>
            </div>

            {/* Map Section */}
            <div className="order-1 lg:order-2">
              <div className="bg-white rounded-2xl shadow-lg p-4 h-[500px]">
                <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3783.2615257138486!2d73.93060637513074!3d18.50792696848689!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c3b6b2b5b8a1%3A0x8e1c8f2b5b7b8b9b!2sHadapsar%2C%20Pune%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1696752800000!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-lg"
                    title="RevUp Bikes Location"
                  ></iframe>
                  
                  {/* Fallback for when maps don't load */}
                  <div className="absolute inset-0 bg-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-500" style={{ zIndex: -1 }}>
                    <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-center">
                      Interactive Map<br />
                      <span className="text-sm">Hadapsar, Pune, Maharashtra</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Contact Information */}
          <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Why Choose RevUp?</h3>
              <p className="text-gray-600">Experience the best bike rental service in Pune</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-black rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-lg mb-2">Quick Response</h4>
                <p className="text-gray-600 text-sm">We respond to all inquiries within 2 hours during business hours</p>
              </div>
              
              <div className="text-center">
                <div className="bg-black rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-lg mb-2">Reliable Service</h4>
                <p className="text-gray-600 text-sm">Trusted by thousands of customers across Pune</p>
              </div>
              
              <div className="text-center">
                <div className="bg-black rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 11-9.75 9.75 9.75 9.75 0 019.75-9.75z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-lg mb-2">24/7 Support</h4>
                <p className="text-gray-600 text-sm">Round-the-clock assistance for all your bike rental needs</p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
