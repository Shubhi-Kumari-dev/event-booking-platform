import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { requireCurrentUser } from "@/lib/session";
import { OrganizerSidebar } from "@/components/features/organizer/organizer-sidebar";
import { OrganizerTopbar } from "@/components/features/organizer/organizer-topbar";

export default async function OrganizerLayout({ children }: { children: ReactNode }) {
  const user = await requireCurrentUser();

  if (user.role !== "ORGANIZER") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      <OrganizerSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <OrganizerTopbar user={user} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}