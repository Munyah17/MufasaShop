"use client";

import { useProfile } from "@/hooks/useProfile";
import { hasPermission, type Permission } from "@/lib/roles";
import type { Role } from "@/types";

interface RoleGuardProps {
  children: React.ReactNode;
  roles?: Role[];
  permission?: Permission;
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, roles, permission, fallback = null }: RoleGuardProps) {
  const { profile, loading } = useProfile();

  if (loading) return null;
  if (!profile) return <>{fallback}</>;

  if (permission && !hasPermission(profile.role, permission)) return <>{fallback}</>;
  if (roles && !roles.includes(profile.role)) return <>{fallback}</>;

  return <>{children}</>;
}
