"use client";
import Link from "next/link";
import { registerUser } from "@/api/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthGuard from "@/components/auth/AuthGuard";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profilePicture, setProfilePic] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Real-time field errors
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[6-9]\d{9}$/;

  const getPasswordStrength = (pwd) => {
    if (!pwd) return null;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { label: "Weak", color: "bg-red-500", width: "w-1/4" };
    if (score === 2) return { label: "Fair", color: "bg-yellow-400", width: "w-2/4" };
    if (score === 3) return { label: "Good", color: "bg-blue-500", width: "w-3/4" };
    return { label: "Strong", color: "bg-green-500", width: "w-full" };
  };

  const handleEmailChange = (val) => {
    setEmail(val);
    if (val && !emailRegex.test(val)) setEmailError("Enter a valid email address");
    else setEmailError("");
  };

  const handlePhoneChange = (val) => {
    const numeric = val.replace(/\D/g, "");
    setPhoneNo(numeric);
    if (numeric && !phoneRegex.test(numeric)) setPhoneError("Enter a valid 10-digit Indian mobile number");
    else setPhoneError("");
  };

  const handlePasswordChange = (val) => {
    setPassword(val);
    if (val && val.length < 8) setPasswordError("Password must be at least 8 characters");
    else setPasswordError("");
    if (confirmPassword && val !== confirmPassword) setConfirmPasswordError("Passwords do not match");
    else if (confirmPassword) setConfirmPasswordError("");
  };

  const handleConfirmPasswordChange = (val) => {
    setConfirmPassword(val);
    if (val && val !== password) setConfirmPasswordError("Passwords do not match");
    else setConfirmPasswordError("");
  };

  const router = useRouter();
  const { login } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await registerUser({
        firstName,
        lastName,
        phoneNumber,
        email,
        password,
        profilePicture,
      });
      
      if (response.STS === "200") {
        // Check if registration response includes a token (auto-login)
        if (response.CONTENT && response.CONTENT.token) {
          const { token, userName, userId, fullName, userRole, userProfilePic, firstName: apiFirstName, lastName: apiLastName, phoneNumber: apiPhone } = response.CONTENT;
          
          const userData = {
            email: userName,
            userId: userId,
            fullName: fullName,
            firstName: apiFirstName || firstName,
            lastName: apiLastName || lastName,
            phoneNumber: apiPhone || phoneNumber,
            role: userRole,
            profilePic: userProfilePic
          };
          
          login(token, userData);
          router.push("/");
        } else {
          // Redirect to login if no token provided
          router.push("/login");
        }
      } else {
        setErrorMsg(response.MSG || "Registration failed. Please try again.");
      }
    } catch (error) {
      setErrorMsg(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!emailRegex.test(email)) {
      setEmailError("Enter a valid email address");
      return;
    }
    if (!phoneRegex.test(phoneNumber)) {
      setPhoneError("Enter a valid 10-digit Indian mobile number");
      return;
    }
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    if (confirmPassword !== password) {
      setConfirmPasswordError("Passwords do not match");
      return;
    }

    handleRegister(e);
  };

  return (
    <AuthGuard requireGuest={true}>
      <div className="min-h-[calc(100vh-90px)] mt-[90px] flex items-center justify-center bg-gray-50 px-4 py-6">
        <div className="bg-white shadow-2xl rounded-3xl w-full max-w-2xl mx-auto my-8 p-6 md:p-10 border-t-4" style={{ borderTopColor: '#f51717' }}>
        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-2" style={{ color: '#f51717' }}>
          Create Account
        </h2>
        <p className="text-center text-gray-600 mb-8 text-sm">
          Join us to start your journey
        </p>

        {/* Form */}
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {/* First Name & Last Name - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName ?? ""}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 transition-colors"
                required
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName ?? ""}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email ?? ""}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="you@example.com"
              className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none transition-colors ${
                emailError ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-red-500"
              }`}
              required
            />
            {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
          </div>

          {/* Mobile */}
          <div>
            <label htmlFor="mobile" className="block text-sm font-semibold text-gray-700 mb-2">
              Mobile Number
            </label>
            <input
              type="tel"
              id="mobile"
              value={phoneNumber ?? ""}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="xxxxxxxxxx"
              autoComplete="off"
              maxLength={10}
              className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none transition-colors ${
                phoneError ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-red-500"
              }`}
              required
            />
            {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password ?? ""}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="••••••••"
                className={`w-full border-2 rounded-xl px-4 py-3 pr-12 focus:outline-none transition-colors ${
                  passwordError ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-red-500"
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
              >
                {showPassword ? (
                  // Eye slash icon (hide password)
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  // Eye icon (show password)
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {password && (() => {
              const strength = getPasswordStrength(password);
              return (
                <div className="mt-2">
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                  </div>
                  <p className={`text-xs mt-1 font-medium ${
                    strength.label === "Weak" ? "text-red-500" :
                    strength.label === "Fair" ? "text-yellow-500" :
                    strength.label === "Good" ? "text-blue-500" : "text-green-500"
                  }`}>Password strength: {strength.label}</p>
                </div>
              );
            })()}
            {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword ?? ""}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                placeholder="••••••••"
                className={`w-full border-2 rounded-xl px-4 py-3 pr-12 focus:outline-none transition-colors ${
                  confirmPasswordError ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-red-500"
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
              >
                {showConfirmPassword ? (
                  // Eye slash icon (hide password)
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  // Eye icon (show password)
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {confirmPasswordError && <p className="text-red-500 text-xs mt-1">{confirmPasswordError}</p>}
            {confirmPassword && !confirmPasswordError && <p className="text-green-500 text-xs mt-1">Passwords match ✓</p>}
          </div>

          {/* Terms */}
          <div className="flex items-start gap-3 text-sm">
            <input 
              type="checkbox" 
              id="terms" 
              className="h-4 w-4 mt-1 accent-red-600 cursor-pointer" 
              required
            />
            <label htmlFor="terms" className="text-gray-600 leading-relaxed">
              I agree to the{" "}
              <a href="/terms-condition" className="font-semibold hover:underline transition-all" style={{ color: '#f51717' }}>
                Terms & Conditions
              </a>
              {" "}and{" "}
              <a href="/privacypolicy" className="font-semibold hover:underline transition-all" style={{ color: '#f51717' }}>
                Privacy Policy
              </a>
            </label>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {errorMsg}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full text-white rounded-xl py-3.5 font-semibold hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
            style={{ backgroundColor: '#f51717' }}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold hover:underline transition-all" style={{ color: '#f51717' }}>
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
    </AuthGuard>
  );
}
