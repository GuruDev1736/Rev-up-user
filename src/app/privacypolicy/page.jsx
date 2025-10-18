import Container from "@/components/common/Container";
import React from "react";

export default function Privacy() {
  return (
    <Container className="min-h-screen w-full px-4 md:px-12 lg:px-24 py-16">
      <div className="max-w-5xl mx-auto mt-[10%]">
        {/* Page Heading */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Privacy Policy
          </h1>
        </div>

        {/* Content Section */}
        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-2">
              Introduction
            </h2>
            <p className="text-sm md:text-base">
              This Privacy Policy describes how Revup and its affiliates
              (collectively “Revup, we, our, us”) collect, use, share, protect
              or otherwise process your information/personal data through our
              website{" "}
              <a
                href="https://revupbikes.com"
                className="text-blue-600 hover:underline"
              >
                https://revupbikes.com
              </a>{" "}
              (hereinafter referred to as Platform). Please note that you may be
              able to browse certain sections of the Platform without
              registering with us. ...
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-2">
              Collection
            </h2>
            <p className="text-sm md:text-base">
              We collect your personal data when you use our Platform, services,
              or otherwise interact with us during the course of our
              relationship. Some of the information we may collect includes but
              is not limited to name, date of birth, address, mobile number,
              email ID, and more...
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-2">Usage</h2>
            <p className="text-sm md:text-base">
              We use personal data to provide the services you request. To the
              extent we use your personal data to market to you, we will provide
              you the ability to opt-out of such uses. ...
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-2">Sharing</h2>
            <p className="text-sm md:text-base">
              We may share your personal data internally within our group
              entities, affiliates, and trusted third parties such as logistics
              partners, payment providers, etc. ...
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-2">
              Security Precautions
            </h2>
            <p className="text-sm md:text-base">
              To protect your personal data from unauthorised access or misuse,
              we adopt reasonable security practices and procedures. ...
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-2">
              Data Deletion & Retention
            </h2>
            <p className="text-sm md:text-base">
              You can delete your account anytime through your profile settings.
              We may retain data as required under applicable laws or to prevent
              fraud and abuse. ...
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-2">
              Your Rights
            </h2>
            <p className="text-sm md:text-base">
              You may access, rectify, and update your personal data directly
              through the functionalities provided on the Platform. ...
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-2">Consent</h2>
            <p className="text-sm md:text-base">
              By visiting our Platform or by providing your information, you
              consent to the collection, use, storage, and processing of your
              data in accordance with this Privacy Policy. ...
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-2">
              Changes to this Privacy Policy
            </h2>
            <p className="text-sm md:text-base">
              Please check our Privacy Policy periodically for changes. We may
              update this Privacy Policy to reflect updates in our practices.
              ...
            </p>
          </section>

          {/* Grievance Officer */}
          <section className="bg-gray-50 border rounded-lg p-6">
            <h2 className="text-xl md:text-2xl font-semibold mb-2">
              Grievance Officer
            </h2>
            <p className="text-sm md:text-base">
              RevUp <br />
              CDO <br />
              S. NO. 10, Mahatma Phule Vasahat, Hadapsar gadital, Saswad road,
              Haveli, Pune – 411028 <br />
              <span className="font-semibold">Email:</span>{" "}
              <a
                href="mailto:cdo@revupbikes.com"
                className="text-blue-600 hover:underline"
              >
                cdo@revupbikes.com
              </a>{" "}
              <br />
              <span className="font-semibold">Phone:</span> +91 XXXXX XXXXX{" "}
              <br />
              <span className="font-semibold">Time:</span> Mon – Fri (9:00 AM –
              10:00 PM)
            </p>
          </section>
        </div>
      </div>
    </Container>
  );
}
