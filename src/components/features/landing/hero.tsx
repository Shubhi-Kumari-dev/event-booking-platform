"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    router.push(`/events${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] opacity-60"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, var(--color-primary) 0%, transparent 70%)",
          opacity: 0.08,
        }}
      />

      <div className="mx-auto max-w-4xl px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-28 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground"
        >
          <Sparkles className="size-3.5 text-accent" />
          Ticketing with real-time seat locking
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
        >
          Find events worth
          <br />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            showing up for
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-5 max-w-xl text-balance text-lg text-muted-foreground"
        >
          Browse and book tickets in seconds, or launch your own event with seat
          management and QR check-in built in.
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          onSubmit={handleSearch}
          className="mx-auto mt-8 flex max-w-lg items-center gap-2 rounded-full border border-border bg-card p-1.5 shadow-sm"
        >
          <Search className="ml-3 size-4 shrink-0 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events, venues, or cities"
            className="border-0 shadow-none focus-visible:ring-0"
          />
          <Button type="submit" className="rounded-full px-5">
            Search
          </Button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground"
        >
          <Button
            variant="link"
            className="h-auto p-0 text-sm"
            render={<a href="/events" />}
            nativeButton={false}
          >
            Browse all events instead →
          </Button>
        </motion.div>
      </div>
    </section>
  );
}