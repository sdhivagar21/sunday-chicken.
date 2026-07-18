import { MainLayout } from '@/components/layout';
import { HeroBanner, CategorySection, FeaturedProducts, WhyChooseUs, Testimonials } from '@/components/home';

export default function HomePage() {
  return (
    <MainLayout>
      <HeroBanner />
      <CategorySection />
      <FeaturedProducts />
      <WhyChooseUs />
      <Testimonials />
    </MainLayout>
  );
}
