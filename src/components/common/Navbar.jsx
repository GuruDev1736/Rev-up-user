"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import styles from "@/styles/header.module.css";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showAppDownloadDialog, setShowAppDownloadDialog] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, isLogin, logout, loading } = useAuth();

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutDialog(false);
    setIsOpen(false); // Close mobile menu after logout
  };

  const handleCancelLogout = () => {
    setShowLogoutDialog(false);
  };

  const handleDownloadAndroid = () => {
    // Replace with your actual APK file URL
    const apkUrl = "/path-to-your-app.apk"; // Update this with your actual APK file path
    const link = document.createElement('a');
    link.href = apkUrl;
    link.download = 'RevUpBikes.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowAppDownloadDialog(false);
  };

  const handleDownloadIOS = () => {
    // Replace with your actual iOS app URL (App Store link or IPA file)
    const iosUrl = "https://apps.apple.com/app/your-app-id"; // Update this with your actual iOS app link
    window.open(iosUrl, '_blank');
    setShowAppDownloadDialog(false);
  };

  const isActive = (path) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  if (loading) {
    return <nav className="flex items-center">Loading...</nav>;
  }

  return (
    <nav className="flex items-center w-full justify-end">
      {/* Desktop Menu */}
      <ul className="hidden md:flex items-center font-semibold gap-6 lg:gap-8">
        <li className={styles.navLink}>
          <Link 
            href="/"
            className={isActive("/") ? "!text-red-600 !font-bold" : ""}
          >
            Home
          </Link>
        </li>
        <li className={styles.navLink}>
          <Link 
            href="/about"
            className={isActive("/about") ? "!text-red-600 !font-bold" : ""}
          >
            About Us
          </Link>
        </li>
        <li className={styles.navLink}>
          <Link 
            href="/contact"
            className={isActive("/contact") ? "!text-red-600 !font-bold" : ""}
          >
            Contact
          </Link>
        </li>
        {isLogin && (
          <>
            <li className={styles.navLink}>
              <Link 
                href="/profile"
                className={isActive("/profile") ? "!text-red-600 !font-bold" : ""}
              >
                Profile
              </Link>
            </li>
            <li className={styles.navLink}>
              <Link 
                href="/your-rides"
                className={isActive("/your-rides") ? "!text-red-600 !font-bold" : ""}
              >
                Your Rides
              </Link>
            </li>
          </>
        )}
        {!isLogin ? (
          <>
            <li className={styles.navLink}>
              <Link 
                href="/login"
                className={isActive("/login") ? "!text-red-600 !font-bold" : ""}
              >
                Login
              </Link>
            </li>
            <li className={styles.navLink}>
              <Link 
                href="/register"
                className={isActive("/register") ? "!text-red-600 !font-bold" : ""}
              >
                Register
              </Link>
            </li>
          </>
        ) : (
          <li className={styles.navLink}>
            <button 
              onClick={handleLogoutClick}
              className="hover:text-gray-600 transition-colors"
            >
              Logout
            </button>
          </li>
        )}
        <li>
          <button
            onClick={() => setShowAppDownloadDialog(true)}
            className={`${styles.button} px-5 py-2 rounded-3xl block text-center whitespace-nowrap cursor-pointer`}
          >
            Get The App
          </button>
        </li>
      </ul>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-2xl ml-auto text-black z-50"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {/* Mobile Dropdown */}
      {isOpen && (
        <ul className="absolute top-full mt-4 left-0 right-0 bg-white shadow-lg rounded-lg flex flex-col gap-4 p-5 font-semibold md:hidden mx-4">
          <li className={styles.navLink}>
            <Link 
              href="/" 
              onClick={() => setIsOpen(false)}
              className={isActive("/") ? "!text-red-600 !font-bold" : ""}
            >
              Home
            </Link>
          </li>
          <li className={styles.navLink}>
            <Link 
              href="/about" 
              onClick={() => setIsOpen(false)}
              className={isActive("/about") ? "!text-red-600 !font-bold" : ""}
            >
              About Us
            </Link>
          </li>
          <li className={styles.navLink}>
            <Link 
              href="/contact" 
              onClick={() => setIsOpen(false)}
              className={isActive("/contact") ? "!text-red-600 !font-bold" : ""}
            >
              Contact
            </Link>
          </li>
          {isLogin && (
            <>
              <li className={styles.navLink}>
                <Link 
                  href="/profile" 
                  onClick={() => setIsOpen(false)}
                  className={isActive("/profile") ? "!text-red-600 !font-bold" : ""}
                >
                  Profile
                </Link>
              </li>
              <li className={styles.navLink}>
                <Link 
                  href="/your-rides" 
                  onClick={() => setIsOpen(false)}
                  className={isActive("/your-rides") ? "!text-red-600 !font-bold" : ""}
                >
                  Your Rides
                </Link>
              </li>
            </>
          )}
          {!isLogin ? (
            <>
              <li className={styles.navLink}>
                <Link 
                  href="/login" 
                  onClick={() => setIsOpen(false)}
                  className={isActive("/login") ? "!text-red-600 !font-bold" : ""}
                >
                  Login
                </Link>
              </li>
              <li className={styles.navLink}>
                <Link 
                  href="/register" 
                  onClick={() => setIsOpen(false)}
                  className={isActive("/register") ? "!text-red-600 !font-bold" : ""}
                >
                  Register
                </Link>
              </li>
            </>
          ) : (
            <li className={styles.navLink}>
              <button 
                onClick={handleLogoutClick}
                className="hover:text-gray-600 transition-colors w-full text-left"
              >
                Logout
              </button>
            </li>
          )}
          <li>
            <button
              onClick={() => {
                setShowAppDownloadDialog(true);
                setIsOpen(false);
              }}
              className={`${styles.button} px-4 py-2 rounded-3xl block text-center w-full cursor-pointer`}
            >
              Get The App
            </button>
          </li>
        </ul>
      )}

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Confirm Logout
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to logout?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelLogout}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* App Download Dialog */}
      {showAppDownloadDialog && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-3xl p-8 max-w-md mx-4 shadow-2xl border-t-4" style={{ borderTopColor: '#f51717' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold" style={{ color: '#f51717' }}>
                Download Our App
              </h3>
              <button
                onClick={() => setShowAppDownloadDialog(false)}
                className="text-gray-400 hover:text-gray-600 text-3xl font-light transition-colors"
              >
                ×
              </button>
            </div>
            
            <p className="text-gray-600 mb-6 text-center">
              Choose your platform to download the RevUp Bikes app
            </p>

            <div className="flex flex-col gap-4">
              {/* Android Download Button */}
              <button
                onClick={handleDownloadAndroid}
                className="flex items-center justify-center gap-3 w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-4 px-6 font-semibold transition-all shadow-lg"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4483-.9993.9993-.9993c.5511 0 .9993.4483.9993.9993.0001.5511-.4482.9997-.9993.9997zm-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4483.9993.9993 0 .5511-.4483.9997-.9993.9997zm11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.2439 13.8533 7.8508 12 7.8508s-3.5902.3931-5.1367 1.0989L4.841 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3435-4.1021-2.6892-7.5743-6.1185-9.4396z"/>
                </svg>
                Download for Android
              </button>

              {/* iOS Download Button */}
              <button
                onClick={handleDownloadIOS}
                className="flex items-center justify-center gap-3 w-full bg-black hover:bg-gray-800 text-white rounded-xl py-4 px-6 font-semibold transition-all shadow-lg"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Download for iOS
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
