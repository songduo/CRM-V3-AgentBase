import { NextRequest, NextResponse } from "next/server";
import { findLead, updateLead, deleteLead } from "../utils";

type Params = Promise<{ id: string }>;

/**
 * GET /api/leads/[id] - 获取单个线索详情
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Params }
) {
  const { id } = await params;
  const lead = findLead(id);
  if (!lead) {
    return NextResponse.json({ error: "线索不存在" }, { status: 404 });
  }
  return NextResponse.json(lead);
}

/**
 * PUT /api/leads/[id] - 修改线索
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const updated = updateLead(id, body);
    if (!updated) {
      return NextResponse.json({ error: "线索不存在" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "请求数据格式错误" }, { status: 400 });
  }
}

/**
 * DELETE /api/leads/[id] - 删除线索
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Params }
) {
  const { id } = await params;
  const deleted = deleteLead(id);
  if (!deleted) {
    return NextResponse.json({ error: "线索不存在" }, { status: 404 });
  }
  return NextResponse.json({ message: "删除成功" });
}
