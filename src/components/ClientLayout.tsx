"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const PUBLIC_PATHS = ["/login"];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const isPublic = PUBLIC_PATHS.includes(pathname);

    if (!isAuthenticated && !isPublic) {
      router.push("/login");
    }

    if (isAuthenticated && isPublic) {
      router.push("/leads");
    }
  }, [isAuthenticated, loading, pathname, router]);

  // 加载中不渲染（防止闪烁）
  if (loading) return null;

  // 未登录且不是公开页面 → 不渲染
  if (!isAuthenticated && !PUBLIC_PATHS.includes(pathname)) return null;

  // 已登录且在公开页面 → 不渲染
  if (isAuthenticated && PUBLIC_PATHS.includes(pathname)) return null;

  return <>{children}</>;
}
