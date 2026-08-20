import Hero from "@/components/home/Hero";
import FeaturedProperties from "@/components/home/FeaturedProperties";
import Stats from "@/components/home/Stats";
import CtaBanner from "@/components/home/CtaBanner";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedProperties />
      <Stats />
      <CtaBanner />
    </>
  );
}
