import { NextRequest, NextResponse } from "next/server";
import type { Role, RoleQuery, CreateRoleRequest } from "@/types/role";
import { readRoles, writeRoles, generateRoleId } from "./utils";

/**
 * GET /api/roles - 获取角色列表（支持筛选）
 *
 * 查询参数：
 *   name     - 角色名模糊搜索
 *   page     - 页码（默认 1）
 *   pageSize - 每页条数（默认 10）
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const allRoles = readRoles();

  // --- 筛选 ---
  const query: RoleQuery = {
    name: searchParams.get("name") ?? undefined,
  };

  let filtered = allRoles;

  if (query.name) {
    const kw = query.name.trim();
    filtered = filtered.filter((r) => r.name.includes(kw));
  }

  // --- 分页 ---
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.max(1, parseInt(searchParams.get("pageSize") ?? "10", 10));
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  return NextResponse.json({ data: paged, total, page, pageSize });
}

/**
 * POST /api/roles - 新增角色
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateRoleRequest = await request.json();

    if (!body.name) {
      return NextResponse.json({ error: "请输入角色名称" }, { status: 400 });
    }

    const allRoles = readRoles();

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newRole: Role = {
      id: generateRoleId(allRoles),
      createdAt: dateStr,
      name: body.name.trim(),
      permissions: [],
    };

    allRoles.unshift(newRole);
    writeRoles(allRoles);

    return NextResponse.json(newRole, { status: 201 });
  } catch {
    return NextResponse.json({ error: "请求数据格式错误" }, { status: 400 });
  }
}
