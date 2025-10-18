import Container from "./Container";
import Logo from "@/app/images/website-logo.png";
import Image from "next/image";
import styles from "@/styles/header.module.css";
import Navbar from "./Navbar";
import Link from "next/link";

export default function Header() {
  return (
    <header
      className={`${styles.header} fixed top-0 left-0 right-0 w-full justify-center items-center z-50 shadow rounded-full`}
    >
      <Container className="flex items-center justify-between w-full py-2 gap-8">
        <div className="flex items-center flex-shrink-0">
          <Link href="/">
            <Image src={Logo} width={100} height={100} alt="logo" priority />
          </Link>
        </div>
        <div className="flex-grow flex justify-end">
          <Navbar />
        </div>
      </Container>
    </header>
  );
}
