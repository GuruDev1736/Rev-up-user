import Container from "./Container";
import Logo from "@/app/images/website-logo.png";
import Image from "next/image";
import styles from "@/styles/header.module.css";
import Navbar from "./Navbar";
import Link from "next/link";

export default function Header() {
  return (
    <header
      className={`${styles.header} absolute w-full justify-center items-center z-50 shadow rounded-full`}
    >
      <Container className="flex items-center justify-between w-full py-2">
        <div className="flex items-center">
          <Link href="/">
            <Image src={Logo} width={100} height={100} alt="logo" />
          </Link>
        </div>
        <Navbar />
      </Container>
    </header>
  );
}
