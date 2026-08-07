"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Cpu,
  Music,
  Briefcase,
  Trophy,
  Palette,
  UtensilsCrossed,
  HeartPulse,
  GraduationCap,
  Users,
  Laugh,
} from "lucide-react";
import { EVENT_CATEGORIES } from "@/lib/constants";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Technology: Cpu,
  Music: Music,
  Business: Briefcase,
  Sports: Trophy,
  Arts: Palette,
  "Food & Drink": UtensilsCrossed,
  "Health & Wellness": HeartPulse,
  Education: GraduationCap,
  Networking: Users,
  Comedy: Laugh,
};

export function CategoriesSection() {
  return (
    <section id="categories" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Browse by category
        </h2>
        <p className="mt-2 text-muted-foreground">
          Ten categories, one search away from the right event.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {EVENT_CATEGORIES.map((category, i) => {
          const Icon = CATEGORY_ICONS[category] ?? Cpu;
          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <Link
                href={`/events?category=${encodeURIComponent(category)}`}
                className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5 text-center transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" />
                </span>
                <span className="text-sm font-medium">{category}</span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}