import Link from "next/link";
import { User, Mail, Shield, Calendar, Ticket, PlusCircle, LayoutDashboard, LogOut } from "lucide-react";
import { requireCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

function initials(name?: string | null) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function ProfilePage() {
  const user = await requireCurrentUser();

  const [bookingCount, eventCount, dbUser] = await Promise.all([
    db.booking.count({ where: { userId: user.id } }),
    user.role === "ORGANIZER"
      ? db.event.count({ where: { organizerId: user.id, deletedAt: null } })
      : Promise.resolve(0),
    db.user.findUnique({
      where: { id: user.id },
      select: { createdAt: true },
    }),
  ]);

  const isOrganizer = user.role === "ORGANIZER" || user.role === "ADMIN";

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 border-b border-border pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight">Account Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal details, credentials, and platform role.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Avatar & Role Card */}
        <div className="space-y-6 md:col-span-1">
          <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
            <Avatar className="mx-auto size-20 text-2xl font-bold">
              <AvatarFallback className="bg-primary/10 text-primary">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>

            <h2 className="mt-4 font-bold text-lg">{user.name ?? "User"}</h2>
            <p className="text-xs text-muted-foreground">{user.email}</p>

            <div className="mt-3">
              <Badge
                variant={isOrganizer ? "default" : "secondary"}
                className="px-3 py-0.5 text-xs font-semibold uppercase tracking-wider"
              >
                {user.role}
              </Badge>
            </div>

            <div className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">
              Member since{" "}
              {dbUser?.createdAt
                ? new Date(dbUser.createdAt).toLocaleDateString("en-IN", {
                    month: "short",
                    year: "numeric",
                  })
                : "2026"}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Activity Summary
            </h3>
            <div className="flex items-center justify-between border-b border-border/60 pb-2 text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Ticket className="size-4" /> Bookings Made
              </span>
              <span className="font-bold">{bookingCount}</span>
            </div>
            {isOrganizer && (
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="size-4" /> Events Created
                </span>
                <span className="font-bold">{eventCount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Account Info & Actions */}
        <div className="space-y-6 md:col-span-2">
          {/* Details Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
            <h2 className="font-bold text-lg border-b border-border/60 pb-3">User Information</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <User className="size-3.5" /> Full Name
                </div>
                <p className="mt-1 font-semibold text-sm">{user.name ?? "Not provided"}</p>
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <Mail className="size-3.5" /> Email Address
                </div>
                <p className="mt-1 font-semibold text-sm truncate">{user.email}</p>
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <Shield className="size-3.5" /> Platform Access Role
                </div>
                <p className="mt-1 font-semibold text-sm">{user.role}</p>
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <Calendar className="size-3.5" /> Account ID
                </div>
                <p className="mt-1 font-mono text-xs text-muted-foreground truncate">{user.id}</p>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-lg border-b border-border/60 pb-3">Platform Shortcuts</h2>

            <div className="grid gap-3 sm:grid-cols-2">
              {isOrganizer ? (
                <>
                  <Button
                    variant="outline"
                    className="justify-start gap-2 h-auto py-3 text-left"
                    render={<Link href="/organizer" />}
                    nativeButton={false}
                  >
                    <LayoutDashboard className="size-4 text-primary" />
                    <div>
                      <div className="font-semibold text-sm">Organizer Dashboard</div>
                      <div className="text-xs text-muted-foreground">
                        Overview of sales & check-ins
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start gap-2 h-auto py-3 text-left"
                    render={<Link href="/organizer/events/new" />}
                    nativeButton={false}
                  >
                    <PlusCircle className="size-4 text-emerald-500" />
                    <div>
                      <div className="font-semibold text-sm">Create New Event</div>
                      <div className="text-xs text-muted-foreground">Publish tickets & dates</div>
                    </div>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="justify-start gap-2 h-auto py-3 text-left"
                    render={<Link href="/dashboard" />}
                    nativeButton={false}
                  >
                    <Ticket className="size-4 text-primary" />
                    <div>
                      <div className="font-semibold text-sm">My Bookings</div>
                      <div className="text-xs text-muted-foreground">
                        View QR tickets & order history
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start gap-2 h-auto py-3 text-left"
                    render={<Link href="/events" />}
                    nativeButton={false}
                  >
                    <Calendar className="size-4 text-emerald-500" />
                    <div>
                      <div className="font-semibold text-sm">Discover Events</div>
                      <div className="text-xs text-muted-foreground">Find concerts, summits & more</div>
                    </div>
                  </Button>
                </>
              )}
            </div>

            {/* Role Explanation Note */}
            {!isOrganizer && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Want to organize events? </span>
                To host events and access organizer tools, register or log in with an Organizer account
                (e.g. demo account <code className="font-mono text-primary">organizer@demo.com</code>).
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
