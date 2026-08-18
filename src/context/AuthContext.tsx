"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { PermissionItem } from "@/types/role";

export interface AuthUser {
  id: string;
  createdAt: string;
  phone: string;
  name: string;
  roleId: string;
  roleName: string;
}

export interface AuthRole {
  id: string;
  name: string;
  permissions: PermissionItem[];
}

interface AuthState {
  user: AuthUser | null;
  role: AuthRole | null;
  token: string | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<string | null>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const STORAGE_KEY = "crm_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<AuthRole | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 页面加载时恢复登录状态，并同步最新角色权限
  useEffect(() => {
    (async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed.user);
          setRole(parsed.role);
          setToken(parsed.token);

          // 同步最新角色权限（管理员可能已修改权限，刷新页面后应生效）
          try {
            const rolesRes = await fetch("/api/roles", { cache: "no-store" });
            if (rolesRes.ok) {
              const rolesData = await rolesRes.json();
              const roles = Array.isArray(rolesData) ? rolesData : rolesData?.data ?? [];
              const latest = roles.find((r: { id: string }) => r.id === parsed.user?.roleId);
              if (latest) {
                setRole(latest);
                localStorage.setItem(
                  STORAGE_KEY,
                  JSON.stringify({ user: parsed.user, role: latest, token: parsed.token })
                );
              }
            }
          } catch {
            // 同步失败时保留缓存角色，不影响使用
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (phone: string, password: string): Promise<string | null> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        return err.error || "登录失败";
      }

      const data = await res.json();
      setUser(data.user);
      setRole(data.role);
      setToken(data.token);

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ user: data.user, role: data.role, token: data.token })
      );

      return null; // 无错误
    } catch {
      return "网络错误，请稍后重试";
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setRole(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
