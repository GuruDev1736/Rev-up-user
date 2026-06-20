"use client"

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function DigilockerCallbackPage() {
    const searchParams = useSearchParams();
    const [code, setCode] = useState(searchParams.get("code"));
    const [state, setState] = useState(searchParams.get("state"));
    const [error, setError] = useState(searchParams.get("error"));
    const [errorDescription, setErrorDescription] = useState(searchParams.get("error_description"));

    useEffect(() => {
        if (error) {
            console.error("DigiLocker returned an error:", error, errorDescription);
            window.location.href = "/digilocker/callback?error=" + encodeURIComponent(error) + "&error_description=" + encodeURIComponent(errorDescription);
            return;
        } else if (!code) {
            console.error("Missing authorization code. Verification cannot continue.");
            window.location.href = "/digilocker/callback?error=missing_code&error_description=Missing authorization code.";
            return;
        } else {
            window.location.href = "/digilocker/callback?code=" + encodeURIComponent(code) + "&state=" + encodeURIComponent(state);
        }
    }, [code, state, error, errorDescription]);

}