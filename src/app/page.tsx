import Image from "next/image";
import Hero from "./components/Hero";
import ShopSection from "./components/ShopSection";
import PromoBanner from "./components/PromoBanner";
import RepairServices from "./components/RepairServices";
import LocalBusinessSchema from "./components/LocalBusinessSchema";

export default function Home() {
  return (
    <>
      <LocalBusinessSchema/>
      <main className="font-sans min-h-screen sm:p-0">

        <Hero />
        <ShopSection />
        <PromoBanner />
        <RepairServices />
      </main>
    </>
  );
}
