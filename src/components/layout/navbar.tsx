"use client";

import Link from "next/link";
import { useState } from "react";
import { Ticket, Menu, LayoutDashboard, LogOut, User } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const NAV_LINKS = [
  { href: "/events", label: "Browse events" },
  { href: "/#categories", label: "Categories" },
  { href: "/#how-it-works", label: "How it works" },
];

function initials(name?: string | null) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Navbar() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  const dashboardHref = session?.user?.role === "ORGANIZER" ? "/organizer" : "/dashboard";

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Ticket className="size-4" />
          </span>
          <span className="text-lg">Eventify</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              render={<Link href={link.href} />}
              nativeButton={false}
              className="text-sm text-muted-foreground"
            >
              {link.label}
            </Button>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />

          {status === "loading" ? null : session?.user ? (
            <>
              {session.user.role === "ORGANIZER" && (
                <Button
                  variant="ghost"
                  size="sm"
                  render={<Link href="/organizer/events/new" />}
                  nativeButton={false}
                >
                  Create event
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="ghost" size="icon" className="rounded-full" />}
                >
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                      {initials(session.user.name)}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem render={<Link href={dashboardHref} className="cursor-pointer" />}>
                    <LayoutDashboard className="mr-2 size-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/profile" className="cursor-pointer" />}>
                    <User className="mr-2 size-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-danger focus:text-danger"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="mr-2 size-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" render={<Link href="/login" />} nativeButton={false}>
                Sign in
              </Button>
              <Button size="sm" render={<Link href="/register" />} nativeButton={false}>
                Get started
              </Button>
            </>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={<Button variant="ghost" size="icon" className="md:hidden" />}
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Ticket className="size-4 text-primary" />
                Eventify
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex flex-col gap-1 px-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  {link.label}
                </Link>
              ))}
              <div className="my-3 border-t border-border" />
              {session?.user ? (
                <>
                  <Link
                    href={dashboardHref}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="rounded-md px-3 py-2 text-left text-sm font-medium text-danger hover:bg-muted"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
                  >
                    Get started
                  </Link>
                </>
              )}
              <div className="mt-2 flex items-center justify-between px-3">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}