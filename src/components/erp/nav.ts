import {
  BookOpen,
  Boxes,
  CircleDollarSign,
  ClipboardList,
  Image,
  LayoutDashboard,
  Library,
  MoreHorizontal,
  PackageSearch,
  PenLine,
  ScrollText,
  Settings,
  ShoppingCart,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";
import type { UserRole } from "@/types/erp";

export type NavItem = {
  title: string;
  href: string;
  icon: typeof LayoutDashboard;
  roles?: UserRole[];
  /** Short label for bottom tabs */
  shortTitle?: string;
};

export type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

export const erpNavGroups: NavGroup[] = [
  {
    id: "sell",
    label: "Sell",
    items: [
      { title: "Dashboard", shortTitle: "Home", href: "/erp", icon: LayoutDashboard },
      { title: "POS", shortTitle: "POS", href: "/erp/pos", icon: ShoppingCart },
      { title: "Orders", shortTitle: "Orders", href: "/erp/orders", icon: ClipboardList },
      {
        title: "Enquiries",
        href: "/erp/enquiries",
        icon: PackageSearch,
      },
    ],
  },
  {
    id: "catalogue",
    label: "Catalogue",
    items: [
      {
        title: "Catalogue",
        shortTitle: "Books",
        href: "/erp/catalogue",
        icon: BookOpen,
      },
      { title: "Media", href: "/erp/media", icon: Image },
      { title: "Authors", href: "/erp/authors", icon: PenLine },
      { title: "Categories", href: "/erp/categories", icon: Library },
    ],
  },
  {
    id: "ops",
    label: "Ops",
    items: [
      { title: "Inventory", href: "/erp/inventory", icon: Warehouse },
      {
        title: "Purchasing",
        href: "/erp/purchasing",
        icon: Truck,
        roles: ["owner", "manager"],
      },
      { title: "Customers", href: "/erp/customers", icon: Users },
    ],
  },
  {
    id: "insights",
    label: "Insights",
    items: [
      { title: "Reports", href: "/erp/reports", icon: Library },
      {
        title: "Finance",
        href: "/erp/finance",
        icon: CircleDollarSign,
        roles: ["owner", "manager"],
      },
      {
        title: "Publishing",
        href: "/erp/publishing",
        icon: PenLine,
        roles: ["owner", "manager"],
      },
      {
        title: "Audit",
        href: "/erp/audit",
        icon: ScrollText,
        roles: ["owner", "manager"],
      },
    ],
  },
  {
    id: "admin",
    label: "Admin",
    items: [
      {
        title: "Staff",
        href: "/erp/staff",
        icon: Boxes,
        roles: ["owner"],
      },
      {
        title: "Settings",
        href: "/erp/settings",
        icon: Settings,
        roles: ["owner"],
      },
    ],
  },
];

/** Flat list (back-compat). */
export const erpNav: NavItem[] = erpNavGroups.flatMap((g) => g.items);

export function navForRole(role: UserRole): NavItem[] {
  return erpNav.filter((item) => !item.roles || item.roles.includes(role));
}

export function navGroupsForRole(role: UserRole): NavGroup[] {
  return erpNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.roles || item.roles.includes(role)
      ),
    }))
    .filter((group) => group.items.length > 0);
}

/** Mobile bottom tabs (More is handled in UI, not a real route). */
export const erpBottomNav: NavItem[] = [
  { title: "Dashboard", shortTitle: "Home", href: "/erp", icon: LayoutDashboard },
  { title: "POS", shortTitle: "POS", href: "/erp/pos", icon: ShoppingCart },
  { title: "Orders", shortTitle: "Orders", href: "/erp/orders", icon: ClipboardList },
  {
    title: "Catalogue",
    shortTitle: "Books",
    href: "/erp/catalogue",
    icon: BookOpen,
  },
];

export const erpMoreTab = {
  title: "More",
  shortTitle: "More",
  icon: MoreHorizontal,
} as const;

export function isNavActive(pathname: string, href: string) {
  if (href === "/erp") return pathname === "/erp";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function pageTitleForPath(pathname: string): string {
  const match = [...erpNav]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => isNavActive(pathname, item.href));
  return match?.title ?? "Workspace";
}
