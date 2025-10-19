"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import styles from "@/styles/header.module.css";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
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
          <li className={styles.navLink}>
            <Link 
              href="/your-rides"
              className={isActive("/your-rides") ? "!text-red-600 !font-bold" : ""}
            >
              Your Rides
            </Link>
          </li>
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
          <Link
            href="/"
            className={`${styles.button} px-5 py-2 rounded-3xl block text-center whitespace-nowrap`}
          >
            Get The App
          </Link>
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
            <li className={styles.navLink}>
              <Link 
                href="/your-rides" 
                onClick={() => setIsOpen(false)}
                className={isActive("/your-rides") ? "!text-red-600 !font-bold" : ""}
              >
                Your Rides
              </Link>
            </li>
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
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className={`${styles.button} px-4 py-2 rounded-3xl block text-center`}
            >
              Get The App
            </Link>
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
    </nav>
  );
}
