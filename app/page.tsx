import { FeaturesSection } from "@/components/features"
import { HeroSection } from "../components/Hero"
import { Navbar } from "../components/NavBar"
import { HowItWorksSection } from "@/components/works"
import { PricingSection } from "@/components/price"
import { FAQSection } from "@/components/FAQ"

export default function Page() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection/>
        <HowItWorksSection/>
        <PricingSection/>
        <FAQSection/>
      </main>
    </>
  )
}
