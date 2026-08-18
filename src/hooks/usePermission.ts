"use client";

import { useAuth } from "@/context/AuthContext";

/**
 * 权限工具 Hook
 * 根据当前用户的角色权限，判断页面/功能/数据权限
 */
export function usePermission(pageKey: string) {
  const { role, user } = useAuth();

  // 未登录或无角色 → 无任何权限
  if (!role || !user) {
    return {
      canViewPage: false,
      canView: false,
      canAdd: false,
      canEdit: false,
      canDelete: false,
      dataScope: "仅自己" as const,
    };
  }

  // 查找当前页面的权限配置
  const perm = role.permissions.find((p) => p.pageKey === pageKey);

  if (!perm) {
    return {
      canViewPage: false,
      canView: false,
      canAdd: false,
      canEdit: false,
      canDelete: false,
      dataScope: "仅自己" as const,
    };
  }

  return {
    canViewPage: true, // 有该页面的权限配置即可访问
    canView: perm.functions.includes("查看"),
    canAdd: perm.functions.includes("增加"),
    canEdit: perm.functions.includes("修改"),
    canDelete: perm.functions.includes("删除"),
    dataScope: perm.dataScope,
  };
}

/**
 * 检查当前角色是否有某个页面的访问权限
 */
export function canAccessPage(role: { permissions: { pageKey: string }[] } | null, pageKey: string): boolean {
  if (!role) return false;
  return role.permissions.some((p) => p.pageKey === pageKey);
}
