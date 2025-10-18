import Container from "@/components/common/Container";
import React from "react";

export default function RefundPolicy() {
  return (
    <Container className="min-h-full w-full py-12 px-4 md:py-16 md:px-8">
      <div className="max-w-3xl mx-auto mt-12 md:mt-20">
        {/* Heading */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl md:text-4xl font-bold mb-4">
            Refund & Cancellation Policy
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Please review our refund and cancellation terms carefully
          </p>
        </div>

        {/* Content */}
        <div className="text-gray-800 leading-relaxed space-y-6 text-sm md:text-base">
          <p>
            All the approved refunds under the refund policy will be credited
            within <span className="font-semibold">5–7 business days</span> in
            the original payment method.
          </p>
          <p>
            Refund timelines may vary depending on your bank or payment
            provider. In some cases, it might take additional working days for
            the refund to reflect in your account.
          </p>
          <p>
            For any cancellations, please contact our support team at{" "}
            <a
              href="mailto:support@revupbikes.com"
              className="text-blue-600 hover:underline"
            >
              support@revupbikes.com
            </a>{" "}
            with your order details.
          </p>
          <p>
            Note: Refunds are only applicable as per the terms and conditions
            agreed at the time of purchase.
          </p>
        </div>
      </div>
    </Container>
  );
}
