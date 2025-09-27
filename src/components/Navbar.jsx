"use client";

import { useState } from "react";
import styles from "@/styles/header.module.css";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="flex items-center">
      {/* Desktop Menu */}
      <ul className="hidden md:flex items-center font-semibold gap-5">
        <li className={styles.navLink}>
          <Link href="/about">About Us</Link>
        </li>
        <li className={styles.navLink}>
          <Link href="/contact">Contact</Link>
        </li>
        <li className={styles.navLink}>
          <Link href="/login">Login</Link>
        </li>
        <li className={styles.navLink}>
          <Link href="/register">Register</Link>
        </li>
        <li>
          <Link
            href="/"
            className={`${styles.button} px-4 py-2 rounded-3xl block text-center`}
          >
            Get The App
          </Link>
        </li>
      </ul>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-2xl ml-4 text-black"
        onClick={() => setIsOpen(!isOpen)}
      >
        ☰
      </button>

      {/* Mobile Dropdown */}
      {isOpen && (
        <ul className="absolute top-20 left-0 right-5 bg-white shadow-lg rounded-lg flex flex-col gap-4 p-5 font-semibold md:hidden w-full">
          <li className={styles.navLink}>
            <Link href="/about">About Us</Link>
          </li>
          <li className={styles.navLink}>
            <Link href="/contact">Contact</Link>
          </li>
          <li className={styles.navLink}>
            <Link href="/login">Login</Link>
          </li>
          <li className={styles.navLink}>
            <Link href="/register">Register</Link>
          </li>
          <li>
            <Link
              href="/"
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
