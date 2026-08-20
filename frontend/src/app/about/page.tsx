import type { Metadata } from "next";
import ComingSoon from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "About | Aurelia Estates" };

export default function AboutPage() {
  return (
    <ComingSoon
      eyebrow="Our Story"
      title="About Aurelia Estates"
      description="A dedicated About page is on the way. In the meantime, explore our current portfolio of exceptional homes."
    />
  );
}
