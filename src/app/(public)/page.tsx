import { Hero } from "@/components/features/landing/hero";
import { StatsSection } from "@/components/features/landing/stats-section";
import { CategoriesSection } from "@/components/features/landing/categories-section";
import { FeaturedEvents } from "@/components/features/landing/featured-events";
import { HowItWorks } from "@/components/features/landing/how-it-works";
import { FaqSection } from "@/components/features/landing/faq-section";
import { getEvents } from "@/services/events";

export default async function HomePage() {
  let totalEvents = 0;
  let citiesCovered = 0;

  try {
    const result = await getEvents({ limit: 1 });

    totalEvents = result.meta.total;

    citiesCovered = new Set(
      (await getEvents({ limit: 50 })).items.map((e) => e.city)
    ).size;
  } catch {
    totalEvents = 0;
    citiesCovered = 0;
  }

  return (
    <>
      <Hero />

      <StatsSection
        totalEvents={totalEvents}
        citiesCovered={citiesCovered}
      />

      <div id="categories">
        <CategoriesSection />
      </div>

      <FeaturedEvents />

      <HowItWorks />

      <FaqSection />
    </>
  );
}