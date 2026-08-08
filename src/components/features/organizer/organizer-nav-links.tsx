import { LayoutDashboard, CalendarRange, BarChart3 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface OrganizerNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

export const ORGANIZER_NAV_ITEMS: OrganizerNavItem[] = [
  {
    href: "/organizer",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/organizer/events",
    label: "Events",
    icon: CalendarRange,
  },
  {
    href: "/organizer/analytics",
    label: "Analytics",
    icon: BarChart3,
  },
];