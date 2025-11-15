import HeroSection from '@/components/HeroSection';
import ContentSection from '@/components/ContentSection';

export default function Home() {
  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory">
      <HeroSection />
      <ContentSection />
    </div>
  );
}
