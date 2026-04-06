import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { Footer } from "@/components/landing/Footer";
...

/**
 * Note: Components using 'react-router-dom' hooks like 'useNavigate' 
 * will need to be updated to use 'next/navigation' for the full migration.
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <main>
        {/* We'll need to update these components to be Next.js compatible */}
        <HeroSection />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
}
