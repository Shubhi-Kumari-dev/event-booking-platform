"use client";

import { motion } from "framer-motion";
import { Search, Ticket, QrCode } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "Find your event",
    description: "Browse by category, city, or search for exactly what you're looking for.",
  },
  {
    icon: Ticket,
    title: "Book instantly",
    description: "Pick your tickets and confirm — seats are locked the moment you book, no overselling.",
  },
  {
    icon: QrCode,
    title: "Check in with QR",
    description: "Your ticket becomes a QR code. Show it at the door and you're in.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">How it works</h2>
        <p className="mt-2 text-muted-foreground">Three steps from browsing to showing up.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="relative flex flex-col items-center text-center"
          >
            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15">
              <step.icon className="size-6 text-primary" />
            </div>
            <span className="mb-1 font-mono text-xs font-medium text-muted-foreground">
              STEP {i + 1}
            </span>
            <h3 className="mb-2 font-semibold">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>

            {i < STEPS.length - 1 && (
              <div className="absolute top-7 left-[calc(50%+3.5rem)] hidden h-px w-[calc(100%-3.5rem)] bg-border sm:block" />
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}