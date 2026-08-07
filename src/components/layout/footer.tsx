import Link from "next/link";
import { Ticket } from "lucide-react";

const FOOTER_LINKS = {
  Product: [
    { href: "/events", label: "Browse events" },
    { href: "/register", label: "Create an event" },
  ],
  Company: [
    { href: "/#faq", label: "FAQ" },
    { href: "/#how-it-works", label: "How it works" },
  ],
  Legal: [
    { href: "/terms", label: "Terms" },
    { href: "/privacy", label: "Privacy" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Ticket className="size-4" />
              </span>
              <span className="text-lg">Eventify</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Find events worth going to, or launch your own in minutes. Ticketing, seating, and check-in — handled.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-sm font-semibold">{heading}</h3>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Eventify. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}