"use client";

import { useState } from "react";
import styles from "@/styles/header.module.css";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, isLogin, logout, loading } = useAuth();

  const handleLogout = () => {
    logout();
    setIsOpen(false); // Close mobile menu after logout
  };

  if (loading) {
    return <nav className="flex items-center">Loading...</nav>;
  }

  return (
    <nav className="flex items-center w-full justify-end">
      {/* Desktop Menu */}
      <ul className="hidden md:flex items-center font-semibold gap-6 lg:gap-8">
        <li className={styles.navLink}>
          <Link href="/">Home</Link>
        </li>
        <li className={styles.navLink}>
          <Link href="/about">About Us</Link>
        </li>
        <li className={styles.navLink}>
          <Link href="/contact">Contact</Link>
        </li>
        {!isLogin ? (
          <>
            <li className={styles.navLink}>
              <Link href="/login">Login</Link>
            </li>
            <li className={styles.navLink}>
              <Link href="/register">Register</Link>
            </li>
          </>
        ) : (
          <li className={styles.navLink}>
            <button 
              onClick={handleLogout}
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
            <Link href="/" onClick={() => setIsOpen(false)}>Home</Link>
          </li>
          <li className={styles.navLink}>
            <Link href="/about" onClick={() => setIsOpen(false)}>About Us</Link>
          </li>
          <li className={styles.navLink}>
            <Link href="/contact" onClick={() => setIsOpen(false)}>Contact</Link>
          </li>
          {!isLogin ? (
            <>
              <li className={styles.navLink}>
                <Link href="/login" onClick={() => setIsOpen(false)}>Login</Link>
              </li>
              <li className={styles.navLink}>
                <Link href="/register" onClick={() => setIsOpen(false)}>Register</Link>
              </li>
            </>
          ) : (
            <li className={styles.navLink}>
              <button 
                onClick={handleLogout}
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
    </nav>
  );
}
