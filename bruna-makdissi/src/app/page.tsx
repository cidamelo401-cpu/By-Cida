import { Hero } from '@/components/Hero';
import { PainPoints } from '@/components/PainPoints';
import { HowItWorks } from '@/components/HowItWorks';
import { AboutBruna } from '@/components/AboutBruna';
import { CTASection } from '@/components/CTASection';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <main>
      <Hero />
      <PainPoints />
      <HowItWorks />
      <AboutBruna />
      <CTASection />
      <Footer />
    </main>
  );
}
