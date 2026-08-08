"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Home, LogOut, PlusCircle, Ticket } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ORGANIZER_NAV_ITEMS } from "@/components/features/organizer/organizer-nav-links";

function isItemActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function OrganizerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border/60 bg-background md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-border/60 px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Ticket className="size-4" />
          </span>
          <span className="text-lg">Eventify</span>
        </Link>
      </div>

      <div className="px-6 pt-4">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          Organizer
        </span>
      </div>

      <div className="px-4 pt-4">
        <Button
          className="w-full justify-start gap-2"
          size="sm"
          render={<Link href="/organizer/events/new" />}
          nativeButton={false}
        >
          <PlusCircle className="size-4" />
          Create event
        </Button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-4 py-4">
        {ORGANIZER_NAV_ITEMS.map((item) => {
          const active = isItemActive(pathname, item.href, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-1 border-t border-border/60 px-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Home className="size-4" />
          Back to Eventify
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-medium text-danger hover:bg-muted"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}