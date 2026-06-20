"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { postDigilockerCallback } from "@/api/digilocker";
import { useAuth } from "@/contexts/AuthContext";

export default function DigilockerCallbackClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [statusText, setStatusText] = useState("Verifying your DigiLocker response...");
  const [errorText, setErrorText] = useState(null);
  const [errorDescriptionText, setErrorDescriptionText] = useState(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (error) {
      setStatusText("DigiLocker returned an error.");
      setErrorText(error);
      setErrorDescriptionText(errorDescription);
      setCompleted(true);
      setTimeout(() => router.replace("/profile"), 2500);
      return;
    }

    if (!code) {
      setStatusText("Missing authorization code. Verification cannot continue.");
      setErrorText("Missing code parameter.");
      setErrorDescriptionText("");
      setCompleted(true);
      setTimeout(() => router.replace("/profile"), 2500);
      return;
    }

    const sendCallback = async () => {
      try {
        setStatusText("Submitting verification details...");
        const response = await postDigilockerCallback(user.userId, { code, state });
        if (!response?.CONTENT?.verified) {
          throw new Error(response?.CONTENT.message || "DigiLocker verification failed.");
        }
        setStatusText("Verification complete. Redirecting shortly...");
        setCompleted(true);
        setTimeout(() => router.replace("/profile"), 2000);
      } catch (error) {
        console.error("DigiLocker callback failed:", error);
        setStatusText("Verification failed.");
        setErrorText(error.message || "Unable to complete DigiLocker verification.");
        setCompleted(true);
      }
    };

    if (user?.userId) {
      sendCallback();
    }
  }, [searchParams, router, user]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-gray-200 p-10 text-center">
        <div className="mb-6">
          <div className="mx-auto h-20 w-20 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-3xl">
            ⚡
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">DigiLocker Verification</h1>
        <p className="text-sm text-gray-600 mb-6">{statusText}</p>
        {errorText && (
          <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-left text-sm text-red-700">
            <strong className="font-semibold">Error:</strong> {errorText}
            {errorDescriptionText ? <p className="mt-2 text-xs text-red-600">{errorDescriptionText}</p> : null}
          </div>
        )}
        {completed ? (
          <button
            onClick={() => router.push("/profile")}
            className="px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
          >
            Return to Profile
          </button>
        ) : (
          <div className="flex justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-500 border-t-transparent"></div>
          </div>
        )}
      </div>
    </div>
  );
}