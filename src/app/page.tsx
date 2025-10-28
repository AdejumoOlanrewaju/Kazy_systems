import Image from "next/image";
import Hero from "./components/Hero";
import ShopSection from "./components/ShopSection";
import PromoBanner from "./components/PromoBanner";
import RepairServices from "./components/RepairServices";

export default function Home() {
  return (
    <main className="font-sans min-h-screen sm:p-0">
  
      <Hero />
      <ShopSection />
      <PromoBanner />
      <RepairServices />
    </main>
  );
}
