import type { Role } from "@/types";

// ─── Role metadata ────────────────────────────────────────────────────────────

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  admin:       "Admin",
  supervisor:  "Shop Supervisor",
  assistant:   "Shop Assistant",
  investor:    "Investor",
  agent:       "Agent",
  delivery:    "Delivery",
  customer:    "Customer",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  super_admin: "Business and platform owner — full rights, account cannot be deleted",
  admin:       "Top-level business personnel — full management access",
  supervisor:  "Branch manager — runs and manages a specific shop location",
  assistant:   "Shop floor staff — processes sales and assists customers",
  investor:    "Read-only stakeholder — full visibility, zero editing rights",
  agent:       "Distribution partner — sells products in their territory with markup",
  delivery:    "Fulfillment — delivers orders to customers",
  customer:    "End customer — browses, purchases, and tracks orders",
};

export const ROLE_COLORS: Record<Role, string> = {
  super_admin: "bg-gold-500 text-obsidian-900",
  admin:       "bg-purple-600 text-white",
  supervisor:  "bg-blue-600 text-white",
  assistant:   "bg-sky-500 text-white",
  investor:    "bg-emerald-600 text-white",
  agent:       "bg-orange-500 text-white",
  delivery:    "bg-rose-500 text-white",
  customer:    "bg-obsidian-600 text-obsidian-200",
};

// ─── Permission groups ────────────────────────────────────────────────────────
// Based on standard retail/enterprise access control principles.
// Ref: NIST RBAC model, POS industry standards, ERP access hierarchies.

export const STAFF_ROLES: Role[] = ["super_admin", "admin", "supervisor", "assistant", "investor"];
export const MANAGEMENT_ROLES: Role[] = ["super_admin", "admin", "supervisor"];
export const ADMIN_ROLES: Role[] = ["super_admin", "admin"];

export const PERMISSIONS = {
  // ── Dashboard & analytics ────────────────────────────────────────────────
  "dashboard:view":           ["super_admin", "admin", "supervisor", "assistant", "investor", "agent", "delivery"] as Role[],
  "analytics:full":           ["super_admin", "admin", "investor"] as Role[],
  "analytics:branch":         ["super_admin", "admin", "supervisor"] as Role[],
  "analytics:own":            ["agent", "delivery"] as Role[],

  // ── Products ─────────────────────────────────────────────────────────────
  "products:read":            ["super_admin", "admin", "supervisor", "assistant", "investor", "agent"] as Role[],
  "products:create":          ["super_admin", "admin"] as Role[],
  "products:update":          ["super_admin", "admin", "supervisor"] as Role[],
  "products:delete":          ["super_admin", "admin"] as Role[],
  "products:manage_stock":    ["super_admin", "admin", "supervisor", "assistant"] as Role[],

  // ── Categories ───────────────────────────────────────────────────────────
  "categories:create":        ["super_admin", "admin"] as Role[],
  "categories:update":        ["super_admin", "admin"] as Role[],
  "categories:delete":        ["super_admin", "admin"] as Role[],

  // ── Orders (online) ──────────────────────────────────────────────────────
  "orders:read:all":          ["super_admin", "admin", "investor"] as Role[],
  "orders:read:branch":       ["supervisor", "assistant"] as Role[],
  "orders:read:territory":    ["agent"] as Role[],
  "orders:read:assigned":     ["delivery"] as Role[],
  "orders:process":           ["super_admin", "admin", "supervisor", "assistant"] as Role[],
  "orders:cancel":            ["super_admin", "admin", "supervisor"] as Role[],
  "orders:refund":            ["super_admin", "admin"] as Role[],

  // ── POS / Walk-in sales ──────────────────────────────────────────────────
  "pos:create":               ["super_admin", "admin", "supervisor", "assistant"] as Role[],
  "pos:view":                 ["super_admin", "admin", "supervisor", "assistant", "investor"] as Role[],

  // ── Agent sales ──────────────────────────────────────────────────────────
  "agent_sales:create":       ["agent"] as Role[],
  "agent_sales:view:own":     ["agent"] as Role[],
  "agent_sales:view:all":     ["super_admin", "admin", "investor"] as Role[],
  "agent:set_markup":         ["agent", "super_admin", "admin"] as Role[],
  "agent:fulfill_order":      ["agent", "super_admin", "admin"] as Role[],

  // ── Staff management ─────────────────────────────────────────────────────
  "staff:read":               ["super_admin", "admin", "supervisor", "investor"] as Role[],
  "staff:create":             ["super_admin", "admin"] as Role[],
  "staff:update":             ["super_admin", "admin"] as Role[],
  "staff:suspend":            ["super_admin", "admin"] as Role[],
  "staff:delete":             ["super_admin"] as Role[],       // Only super_admin can permanently delete

  // ── Agent management ─────────────────────────────────────────────────────
  "agents:read":              ["super_admin", "admin", "supervisor", "investor"] as Role[],
  "agents:create":            ["super_admin", "admin"] as Role[],
  "agents:update":            ["super_admin", "admin"] as Role[],
  "agents:deactivate":        ["super_admin", "admin"] as Role[],

  // ── Delivery management ──────────────────────────────────────────────────
  "delivery:read:all":        ["super_admin", "admin", "supervisor", "investor"] as Role[],
  "delivery:assign":          ["super_admin", "admin", "supervisor"] as Role[],
  "delivery:update_status":   ["delivery", "super_admin", "admin", "supervisor"] as Role[],
  "delivery:manage_personnel": ["super_admin", "admin"] as Role[],

  // ── Branches ─────────────────────────────────────────────────────────────
  "branches:read":            ["super_admin", "admin", "supervisor", "investor"] as Role[],
  "branches:create":          ["super_admin", "admin"] as Role[],
  "branches:update":          ["super_admin", "admin"] as Role[],
  "branches:delete":          ["super_admin"] as Role[],

  // ── Financial reports ────────────────────────────────────────────────────
  "reports:financial":        ["super_admin", "admin", "investor"] as Role[],
  "reports:branch":           ["super_admin", "admin", "supervisor"] as Role[],
  "reports:export":           ["super_admin", "admin", "investor"] as Role[],

  // ── System ───────────────────────────────────────────────────────────────
  "system:settings":          ["super_admin"] as Role[],
  "system:audit_log":         ["super_admin"] as Role[],
  "system:manage_roles":      ["super_admin"] as Role[],
  "system:delete_super_admin": [] as Role[], // Nobody — super_admin cannot be deleted

  // ── Admin panel access ───────────────────────────────────────────────────
  "admin_panel:access":       ["super_admin", "admin", "supervisor", "assistant", "investor"] as Role[],
  "agent_portal:access":      ["agent"] as Role[],
  "delivery_portal:access":   ["delivery"] as Role[],
} as const;

export type Permission = keyof typeof PERMISSIONS;

// ─── Permission checking ──────────────────────────────────────────────────────

export function hasPermission(role: Role | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  return (PERMISSIONS[permission] as Role[]).includes(role);
}

export function hasAnyPermission(role: Role | null | undefined, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(role: Role | null | undefined, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

export function isStaff(role: Role | null | undefined): boolean {
  return STAFF_ROLES.includes(role as Role);
}

export function isManagement(role: Role | null | undefined): boolean {
  return MANAGEMENT_ROLES.includes(role as Role);
}

export function isAdminOrAbove(role: Role | null | undefined): boolean {
  return ADMIN_ROLES.includes(role as Role);
}

// ─── Portal routing ───────────────────────────────────────────────────────────

export function getDefaultPortal(role: Role | null | undefined): string {
  if (!role) return "/";
  if (hasPermission(role, "admin_panel:access")) return "/admin/dashboard";
  if (hasPermission(role, "agent_portal:access")) return "/agent/dashboard";
  if (hasPermission(role, "delivery_portal:access")) return "/delivery/dashboard";
  return "/";
}

// ─── Admin sidebar nav (shown per role) ───────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  permission?: Permission;
}

export const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard",      href: "/admin/dashboard",  icon: "LayoutDashboard" },
  { label: "Orders",         href: "/admin/orders",     icon: "ShoppingBag",    permission: "orders:read:all" },
  { label: "Products",       href: "/admin/products",   icon: "Package",        permission: "products:read" },
  { label: "Staff",          href: "/admin/staff",      icon: "Users",          permission: "staff:read" },
  { label: "Agents",         href: "/admin/agents",     icon: "MapPin",         permission: "agents:read" },
  { label: "Delivery",       href: "/admin/delivery",   icon: "Truck",          permission: "delivery:read:all" },
  { label: "Branches",       href: "/admin/branches",   icon: "Store",          permission: "branches:read" },
  { label: "Reports",        href: "/admin/reports",    icon: "BarChart3",      permission: "reports:financial" },
  { label: "System",         href: "/admin/system",     icon: "Settings",       permission: "system:settings" },
];
