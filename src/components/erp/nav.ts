import {
  BookOpen,
  Boxes,
  CircleDollarSign,
  ClipboardList,
  FilePenLine,
  HandHelping,
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
  { title: "Counter", href: "/erp/counter", icon: ShoppingCart },
  { title: "Sales", href: "/erp/orders", icon: ClipboardList },
  {
    title: "Content",
    href: "/erp/content",
    icon: FilePenLine,
    roles: ["owner", "manager"],
  },
  { title: "Products", href: "/erp/catalogue", icon: BookOpen },
  { title: "Authors", href: "/erp/authors", icon: PenLine },
  { title: "Categories", href: "/erp/categories", icon: Library },
  { title: "Inventory", href: "/erp/inventory", icon: Warehouse },
  { title: "Purchasing", href: "/erp/purchasing", icon: Truck },
  { title: "Customers", href: "/erp/customers", icon: Users },
  { title: "Enquiries", href: "/erp/enquiries", icon: PackageSearch },
  { title: "Holds", href: "/erp/holds", icon: HandHelping },
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

export const OFFICE_DOCK: NavItem[] = [
  { title: "Home", href: "/erp", icon: LayoutDashboard },
  { title: "Counter", href: "/erp/counter", icon: ShoppingCart },
  { title: "Products", href: "/erp/catalogue", icon: BookOpen },
  { title: "Sales", href: "/erp/orders", icon: ClipboardList },
];

export function navForRole(role: UserRole) {
  return erpNav.filter(
    (item) => !item.roles || item.roles.includes(role)
  );
}
