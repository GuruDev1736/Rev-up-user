"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

function DigilockerCallbackContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    const params = new URLSearchParams();

    if (error) {
      console.error("DigiLocker returned an error:", error, errorDescription);
      params.set("error", error);
      if (errorDescription) params.set("error_description", errorDescription);
    } else if (!code) {
      console.error("Missing authorization code. Verification cannot continue.");
      params.set("error", "missing_code");
      params.set("error_description", "Missing authorization code.");
    } else {
      params.set("code", code);
      if (state) params.set("state", state);
    }

    window.location.href = `/digilocker/callback?${params.toString()}`;
  }, [searchParams]);

  return <div>Redirecting...</div>;
}

export default function DigilockerCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DigilockerCallbackContent />
    </Suspense>
  );
}