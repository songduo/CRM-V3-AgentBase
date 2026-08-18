import { NextRequest, NextResponse } from "next/server";
import { findAccount, updateAccount, deleteAccount } from "../utils";

type Params = Promise<{ id: string }>;

/**
 * GET /api/accounts/[id] - 获取单个账号详情
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Params }
) {
  const { id } = await params;
  const account = findAccount(id);
  if (!account) {
    return NextResponse.json({ error: "账号不存在" }, { status: 404 });
  }
  const { password: _, ...safeData } = account;
  return NextResponse.json(safeData);
}

/**
 * PUT /api/accounts/[id] - 修改账号
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const updated = updateAccount(id, body);
    if (!updated) {
      return NextResponse.json({ error: "账号不存在" }, { status: 404 });
    }
    const { password: _, ...safeData } = updated;
    return NextResponse.json(safeData);
  } catch {
    return NextResponse.json({ error: "请求数据格式错误" }, { status: 400 });
  }
}

/**
 * DELETE /api/accounts/[id] - 删除账号
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Params }
) {
  const { id } = await params;
  const deleted = deleteAccount(id);
  if (!deleted) {
    return NextResponse.json({ error: "账号不存在" }, { status: 404 });
  }
  return NextResponse.json({ message: "删除成功" });
}
