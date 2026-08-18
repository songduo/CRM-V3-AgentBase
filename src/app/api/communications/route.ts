import { NextRequest, NextResponse } from "next/server";
import type { Communication, CommunicationQuery } from "@/types/communication";
import { readCommunications } from "./utils";

/**
 * GET /api/communications - 获取沟通记录列表（支持筛选）
 *
 * 查询参数：
 *   leadId     - 按线索 ID 筛选
 *   senderRole - 发送人角色 (销售 / 客户)
 *   channel    - 沟通渠道
 *   startDate  - 开始日期 (YYYY-MM-DD)
 *   endDate    - 结束日期 (YYYY-MM-DD)
 *   page       - 页码（默认 1）
 *   pageSize   - 每页条数（默认 10）
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const all = readCommunications();

  const query: CommunicationQuery = {
    leadId: searchParams.get("leadId") ?? undefined,
    senderRole: (searchParams.get("senderRole") as CommunicationQuery["senderRole"]) ?? "",
    channel: searchParams.get("channel") ?? undefined,
    startDate: searchParams.get("startDate") ?? undefined,
    endDate: searchParams.get("endDate") ?? undefined,
  };

  let filtered = all;

  if (query.leadId) {
    filtered = filtered.filter((c) => c.leadId === query.leadId);
  }
  if (query.senderRole) {
    filtered = filtered.filter((c) => c.senderRole === query.senderRole);
  }
  if (query.channel) {
    const kw = query.channel.trim();
    filtered = filtered.filter((c) => c.channel === kw);
  }
  if (query.startDate) {
    filtered = filtered.filter((c) => c.sentAt.split(" ")[0] >= query.startDate!);
  }
  if (query.endDate) {
    filtered = filtered.filter((c) => c.sentAt.split(" ")[0] <= query.endDate!);
  }

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.max(1, parseInt(searchParams.get("pageSize") ?? "10", 10));
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  return NextResponse.json({ data: paged, total, page, pageSize });
}
