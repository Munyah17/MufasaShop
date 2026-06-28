"use client";

import { hasPermission, type Permission } from "@/lib/roles";
import type { Profile, Role } from "@/types";

interface RoleGuardProps {
  children: React.ReactNode;
  profile: Profile | null;
  roles?: Role[];
  permission?: Permission;
  fallback?: React.ReactNode;
}

/**
 * Client component that conditionally renders children based on role/permission.
 * Profile must be passed as a prop from a server component parent — this
 * component never queries the database directly.
 */
export function RoleGuard({ children, profile, roles, permission, fallback = null }: RoleGuardProps) {
  if (!profile) return <>{fallback}</>;
  if (permission && !hasPermission(profile.role, permission)) return <>{fallback}</>;
  if (roles && !roles.includes(profile.role)) return <>{fallback}</>;
  return <>{children}</>;
}
