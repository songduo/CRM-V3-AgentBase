import fs from "fs";
import path from "path";
import type { Role } from "@/types/role";

const DATA_PATH = path.join(process.cwd(), "data", "roles.json");

/** 读取所有角色 */
export function readRoles(): Role[] {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/** 写入所有角色 */
export function writeRoles(roles: Role[]): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(roles, null, 2), "utf-8");
}

/** 根据 ID 查找角色 */
export function findRole(id: string): Role | undefined {
  return readRoles().find((r) => r.id === id);
}

/** 更新角色 */
export function updateRole(id: string, updates: Partial<Role>): Role | null {
  const roles = readRoles();
  const index = roles.findIndex((r) => r.id === id);
  if (index === -1) return null;
  roles[index] = { ...roles[index], ...updates };
  writeRoles(roles);
  return roles[index];
}

/** 删除角色 */
export function deleteRole(id: string): boolean {
  const roles = readRoles();
  const index = roles.findIndex((r) => r.id === id);
  if (index === -1) return false;
  roles.splice(index, 1);
  writeRoles(roles);
  return true;
}

/** 生成新角色 ID */
export function generateRoleId(roles: Role[]): string {
  const maxNum = roles.reduce((max, r) => {
    const num = parseInt(r.id.replace("ROLE-2026-", ""), 10);
    return num > max ? num : max;
  }, 0);
  const next = String(maxNum + 1).padStart(4, "0");
  return `ROLE-2026-${next}`;
}
