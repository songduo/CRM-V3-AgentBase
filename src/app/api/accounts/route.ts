import { NextRequest, NextResponse } from "next/server";
import type { Account, AccountQuery, CreateAccountRequest } from "@/types/account";
import { readAccounts, writeAccounts, generateAccountId } from "./utils";
import { readRoles } from "../roles/utils";

/**
 * GET /api/accounts - 获取账号列表（支持筛选）
 *
 * 查询参数：
 *   startDate - 开始日期 (YYYY-MM-DD)
 *   endDate   - 结束日期 (YYYY-MM-DD)
 *   phone     - 手机号模糊搜索
 *   name      - 用户姓名模糊搜索
 *   roleName  - 所属角色模糊搜索
 *   page      - 页码（默认 1）
 *   pageSize  - 每页条数（默认 10）
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // 如果请求 roles，返回角色列表供下拉选择
  if (searchParams.get("roles") === "true") {
    const roles = readRoles().map((r) => ({ id: r.id, name: r.name }));
    return NextResponse.json(roles);
  }

  const allAccounts = readAccounts();

  // --- 筛选 ---
  const query: AccountQuery = {
    startDate: searchParams.get("startDate") ?? undefined,
    endDate: searchParams.get("endDate") ?? undefined,
    phone: searchParams.get("phone") ?? undefined,
    name: searchParams.get("name") ?? undefined,
    roleName: searchParams.get("roleName") ?? undefined,
  };

  let filtered = allAccounts;

  if (query.startDate) {
    filtered = filtered.filter((a) => a.createdAt.split(" ")[0] >= query.startDate!);
  }
  if (query.endDate) {
    filtered = filtered.filter((a) => a.createdAt.split(" ")[0] <= query.endDate!);
  }
  if (query.phone) {
    const kw = query.phone.trim();
    filtered = filtered.filter((a) => a.phone.includes(kw));
  }
  if (query.name) {
    const kw = query.name.trim();
    filtered = filtered.filter((a) => a.name.includes(kw));
  }
  if (query.roleName) {
    const kw = query.roleName.trim();
    filtered = filtered.filter((a) => a.roleName.includes(kw));
  }

  // --- 分页 ---
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.max(1, parseInt(searchParams.get("pageSize") ?? "10", 10));
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  // 返回时隐藏密码
  const safeData = paged.map(({ password, ...rest }) => rest);

  return NextResponse.json({ data: safeData, total, page, pageSize });
}

/**
 * POST /api/accounts - 新增账号
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateAccountRequest = await request.json();

    if (!body.phone || !body.name || !body.roleId) {
      return NextResponse.json({ error: "请填写完整的账号信息" }, { status: 400 });
    }

    // 查重手机号
    const allAccounts = readAccounts();
    if (allAccounts.some((a) => a.phone === body.phone.trim())) {
      return NextResponse.json({ error: "该手机号已被注册" }, { status: 400 });
    }

    // 查找角色名
    const roles = readRoles();
    const role = roles.find((r) => r.id === body.roleId);
    if (!role) {
      return NextResponse.json({ error: "所选角色不存在" }, { status: 400 });
    }

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newAccount: Account = {
      id: generateAccountId(allAccounts),
      createdAt: dateStr,
      phone: body.phone.trim(),
      name: body.name.trim(),
      roleId: body.roleId,
      roleName: role.name,
      password: "123456",
    };

    allAccounts.unshift(newAccount);
    writeAccounts(allAccounts);

    const { password: _, ...safeData } = newAccount;
    return NextResponse.json(safeData, { status: 201 });
  } catch {
    return NextResponse.json({ error: "请求数据格式错误" }, { status: 400 });
  }
}
