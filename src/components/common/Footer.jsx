import Link from "next/link";
import Container from "./Container";
import styles from "@/styles/footer.module.css";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className={`${styles.footer} text-white`}>
      <Container className="m-[40px]">
        {/* Heading */}
        <div
          className={`${styles.border} p-2 rounded-2xl font-light text-[50px] md:text-[90px] mb-8`}
        >
          Let&apos;s Talk<b>.</b>
          <hr className="text-[#525252]" />
        </div>

        {/* Contact Section */}
        <div
          className={`${styles.border} p-3 rounded-2xl flex flex-col md:flex-row gap-6 md:gap-10 mb-8`}
        >
          <div className="flex items-center gap-2">
            <FaPhoneAlt />
            <span>+91 7020038007</span>
          </div>
          <div className="flex items-center gap-2">
            <FaEnvelope />
            <span>email@revupbikes.com</span>
          </div>
        </div>

        {/* Newsletter + Links Section */}
        <div className="flex flex-col md:flex-row gap-10 p-2 w-full mb-8">
          {/* Company Links */}
          <div className="w-full md:w-[50%]">
            <h6 className="text-[20px] font-semibold">COMPANY LINKS</h6>
            <ul className="space-y-2">
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/privacypolicy">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms-condition">Terms and Conditions</Link>
              </li>
              <li>
                <Link href="/refund-policy">Refund Policy</Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="w-full md:w-[50%]">
            <h6 className="text-[20px] font-semibold">SOCIAL LINKS</h6>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <FaLinkedin /> <Link href="/">LinkedIn</Link>
              </li>
              <li className="flex items-center gap-2">
                <FaFacebook /> <Link href="/">Facebook</Link>
              </li>
              <li className="flex items-center gap-2">
                <FaInstagram /> <Link href="/">Instagram</Link>
              </li>
              <li className="flex items-center gap-2">
                <FaTwitter /> <Link href="/">Twitter</Link>
              </li>
            </ul>
          </div>
        </div>

        <hr className="text-[#525252]" />
        <p className="text-center text-sm mt-4">
          © 2025 RevUp Bikes. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
