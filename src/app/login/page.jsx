"use client";
import { useState } from "react";
import { useRouter } from "next/navigation"; // ✅ import router
import { loginUser, sendForgotPasswordOTP, verifyForgotPasswordOTP, resetPassword } from "@/api/auth";
import { useAuth } from "@/contexts/AuthContext";
import AuthGuard from "@/components/auth/AuthGuard";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Forgot Password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState(null);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(null);

  const router = useRouter(); // ✅ initialize router
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await loginUser({ email, password });
      
      // Check if login was successful
      if (response.STS === "200" && response.CONTENT) {
        const { token, userName, userId, fullName, userRole, userProfilePic, firstName, lastName, phoneNumber } = response.CONTENT;
        
        // Store token and user data
        if (token) {
          const userData = {
            email: userName,
            userId: userId,
            fullName: fullName,
            firstName: firstName || fullName?.split(' ')[0] || '',
            lastName: lastName || fullName?.split(' ').slice(1).join(' ') || '',
            phoneNumber: phoneNumber || '',
            role: userRole,
            profilePic: userProfilePic
          };
          
          login(token, userData);
          router.push("/");
        }
      } else {
        setErrorMsg(response.MSG || "Invalid credentials, please try again.");
      }
    } catch (error) {
      setErrorMsg(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password - Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    setForgotPasswordError(null);
    setForgotPasswordSuccess(null);

    try {
      const response = await sendForgotPasswordOTP(forgotEmail);
      
      if (response.STS === "200") {
        setForgotPasswordSuccess("OTP sent to your email successfully!");
        setForgotPasswordStep(2);
      } else {
        setForgotPasswordError(response.MSG || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      setForgotPasswordError(error.message || "Something went wrong");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  // Forgot Password - Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    setForgotPasswordError(null);
    setForgotPasswordSuccess(null);

    try {
      const response = await verifyForgotPasswordOTP(forgotEmail, otp);
      
      if (response.STS === "200") {
        setForgotPasswordSuccess("OTP verified successfully!");
        setForgotPasswordStep(3);
      } else {
        setForgotPasswordError(response.MSG || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      setForgotPasswordError(error.message || "Something went wrong");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  // Forgot Password - Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    setForgotPasswordError(null);
    setForgotPasswordSuccess(null);

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setForgotPasswordError("Passwords do not match");
      setForgotPasswordLoading(false);
      return;
    }

    // Validate password strength
    if (newPassword.length < 6) {
      setForgotPasswordError("Password must be at least 6 characters long");
      setForgotPasswordLoading(false);
      return;
    }

    try {
      const response = await resetPassword(forgotEmail, otp, newPassword);
      
      if (response.STS === "200") {
        setForgotPasswordSuccess("Password reset successful! Redirecting to login...");
        setTimeout(() => {
          setShowForgotPassword(false);
          setForgotPasswordStep(1);
          setForgotEmail("");
          setOtp("");
          setNewPassword("");
          setConfirmPassword("");
          setForgotPasswordSuccess(null);
        }, 2000);
      } else {
        setForgotPasswordError(response.MSG || "Failed to reset password. Please try again.");
      }
    } catch (error) {
      setForgotPasswordError(error.message || "Something went wrong");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotPasswordStep(1);
    setForgotEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setForgotPasswordError(null);
    setForgotPasswordSuccess(null);
  };

  return (
    <AuthGuard requireGuest={true}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
        <div className="bg-white shadow-2xl rounded-3xl w-full max-w-md p-8 md:p-10 border-t-4" style={{ borderTopColor: '#f51717' }}>
          {/* Heading */}
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-2" style={{ color: '#f51717' }}>
            Welcome Back
          </h2>
          <p className="text-center text-gray-600 mb-8 text-sm">
            Login to access your account
          </p>

        {/* Form */}
        <form className="flex flex-col gap-5" onSubmit={handleLogin}>
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 transition-colors"
              required
            />
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-red-500 transition-colors"
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
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {errorMsg}
            </div>
          )}

          {/* Forgot Password Link */}
          <div className="text-right -mt-2">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm font-medium hover:underline transition-all"
              style={{ color: '#f51717' }}
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full text-white rounded-xl py-3.5 font-semibold hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
            style={{ backgroundColor: '#f51717' }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Register Link */}
          <p className="text-center text-sm text-gray-600 mt-2">
            Don't have an account?{' '}
            <a href="/register" className="font-semibold hover:underline transition-all" style={{ color: '#f51717' }}>
              Sign Up
            </a>
          </p>
        </form>
      </div>
    </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-[100] px-4">
          <div className="bg-white rounded-3xl p-8 md:p-10 max-w-md w-full shadow-2xl border-t-4" style={{ borderTopColor: '#f51717' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl md:text-3xl font-bold" style={{ color: '#f51717' }}>
                {forgotPasswordStep === 1 && "Forgot Password"}
                {forgotPasswordStep === 2 && "Verify OTP"}
                {forgotPasswordStep === 3 && "Reset Password"}
              </h3>
              <button
                onClick={handleCloseForgotPassword}
                className="text-gray-400 hover:text-gray-600 text-3xl font-light transition-colors"
              >
                ×
              </button>
            </div>

            {/* Step 1: Enter Email */}
            {forgotPasswordStep === 1 && (
              <form onSubmit={handleSendOTP} className="flex flex-col gap-5">
                <div className="bg-red-50 border-l-4 p-4 rounded-r-lg" style={{ borderLeftColor: '#f51717' }}>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Enter your registered email address and we'll send you a verification code to reset your password.
                  </p>
                </div>
                <div>
                  <label htmlFor="forgotEmail" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="forgotEmail"
                    placeholder="you@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 transition-colors"
                    style={{ focusBorderColor: '#f51717' }}
                    required
                  />
                </div>

                {forgotPasswordError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {forgotPasswordError}
                  </div>
                )}
                {forgotPasswordSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                    {forgotPasswordSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={forgotPasswordLoading}
                  className="w-full text-white rounded-xl py-3.5 font-semibold hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
                  style={{ backgroundColor: '#f51717' }}
                >
                  {forgotPasswordLoading ? "Sending OTP..." : "Send Verification Code"}
                </button>
              </form>
            )}

            {/* Step 2: Verify OTP */}
            {forgotPasswordStep === 2 && (
              <form onSubmit={handleVerifyOTP} className="flex flex-col gap-5">
                <div className="bg-red-50 border-l-4 p-4 rounded-r-lg" style={{ borderLeftColor: '#f51717' }}>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    We've sent a 4-digit verification code to
                  </p>
                  <p className="font-semibold text-gray-900 mt-1">{forgotEmail}</p>
                </div>
                <div>
                  <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    id="otp"
                    placeholder="0000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    maxLength={4}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:border-red-500 text-center text-3xl font-bold tracking-[0.5em] transition-colors"
                    required
                  />
                </div>

                {forgotPasswordError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {forgotPasswordError}
                  </div>
                )}
                {forgotPasswordSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                    {forgotPasswordSuccess}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setForgotPasswordStep(1)}
                    className="flex-1 border-2 border-gray-300 text-gray-700 rounded-xl py-3 font-semibold hover:bg-gray-50 transition"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={forgotPasswordLoading}
                    className="flex-1 text-white rounded-xl py-3 font-semibold hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
                    style={{ backgroundColor: '#f51717' }}
                  >
                    {forgotPasswordLoading ? "Verifying..." : "Verify Code"}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSendOTP}
                  className="text-sm font-medium hover:underline text-center transition-all"
                  style={{ color: '#f51717' }}
                >
                  Didn't receive the code? Resend
                </button>
              </form>
            )}

            {/* Step 3: Reset Password */}
            {forgotPasswordStep === 3 && (
              <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
                <div className="bg-red-50 border-l-4 p-4 rounded-r-lg" style={{ borderLeftColor: '#f51717' }}>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Create a strong password with at least 6 characters.
                  </p>
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 transition-colors"
                    required
                  />
                </div>

                {forgotPasswordError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {forgotPasswordError}
                  </div>
                )}
                {forgotPasswordSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {forgotPasswordSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={forgotPasswordLoading}
                  className="w-full text-white rounded-xl py-3.5 font-semibold hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
                  style={{ backgroundColor: '#f51717' }}
                >
                  {forgotPasswordLoading ? "Resetting Password..." : "Reset Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </AuthGuard>
  );
}
