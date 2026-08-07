import {
  BookOpen,
  Boxes,
  CircleDollarSign,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Library,
  PackageSearch,
  PenLine,
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
};

export const erpNav: NavItem[] = [
  { title: "Dashboard", href: "/erp", icon: LayoutDashboard },
  { title: "POS", href: "/erp/pos", icon: ShoppingCart },
  { title: "Orders", href: "/erp/orders", icon: ClipboardList },
  { title: "Catalogue", href: "/erp/catalogue", icon: BookOpen },
  { title: "Authors", href: "/erp/authors", icon: PenLine },
  { title: "Categories", href: "/erp/categories", icon: Library },
  { title: "Inventory", href: "/erp/inventory", icon: Warehouse },
  { title: "Purchasing", href: "/erp/purchasing", icon: Truck },
  { title: "Customers", href: "/erp/customers", icon: Users },
  { title: "Enquiries", href: "/erp/enquiries", icon: PackageSearch },
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
    title: "Content",
    href: "/erp/content",
    icon: FileText,
    roles: ["owner", "manager"],
  },
  { title: "Reports", href: "/erp/reports", icon: Library },
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
];

export function navForRole(role: UserRole) {
  return erpNav.filter(
    (item) => !item.roles || item.roles.includes(role)
  );
}

export function navForRole(role: UserRole) {
  return erpNav.filter(
    (item) => !item.roles || item.roles.includes(role)
  );
}
