import { NextRequest, NextResponse } from "next/server";
import type { Lead, LeadQuery, CreateLeadRequest } from "@/types/lead";
import { readLeads, writeLeads, generateLeadId } from "./utils";

/**
 * GET /api/leads - 获取线索列表（支持筛选）
 *
 * 查询参数：
 *   startDate - 开始日期 (YYYY-MM-DD)
 *   endDate   - 结束日期 (YYYY-MM-DD)
 *   name      - 姓名模糊搜索
 *   phone     - 电话模糊搜索
 *   source    - 客户来源
 *   priority  - 优先级筛选 (high / medium / low)
 *   page      - 页码（默认 1）
 *   pageSize  - 每页条数（默认 5）
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const allLeads = readLeads();

  // --- 筛选 ---
  const query: LeadQuery = {
    startDate: searchParams.get("startDate") ?? undefined,
    endDate: searchParams.get("endDate") ?? undefined,
    name: searchParams.get("name") ?? undefined,
    phone: searchParams.get("phone") ?? undefined,
    source: searchParams.get("source") ?? undefined,
    priority: (searchParams.get("priority") as LeadQuery["priority"]) ?? "",
  };

  let filtered = allLeads;

  if (query.startDate) {
    filtered = filtered.filter((l) => l.createdAt.split(" ")[0] >= query.startDate!);
  }
  if (query.endDate) {
    filtered = filtered.filter((l) => l.createdAt.split(" ")[0] <= query.endDate!);
  }
  if (query.name) {
    const kw = query.name.trim();
    filtered = filtered.filter((l) => l.name.includes(kw));
  }
  if (query.phone) {
    const kw = query.phone.trim();
    filtered = filtered.filter((l) => l.phone.includes(kw));
  }
  if (query.source) {
    filtered = filtered.filter((l) => l.source === query.source);
  }
  if (query.priority) {
    filtered = filtered.filter((l) => l.priority === query.priority);
  }

  // --- 分页 ---
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.max(1, parseInt(searchParams.get("pageSize") ?? "5", 10));
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  return NextResponse.json({ data: paged, total, page, pageSize });
}

/**
 * POST /api/leads - 新增线索
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateLeadRequest = await request.json();

    // 校验必填字段
    if (!body.name || !body.phone || !body.priority || !body.source || !body.assignee) {
      return NextResponse.json({ error: "请填写完整线索信息" }, { status: 400 });
    }

    const allLeads = readLeads();

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newLead: Lead = {
      id: generateLeadId(allLeads),
      createdAt: dateStr,
      name: body.name.trim(),
      phone: body.phone.trim(),
      priority: body.priority,
      source: body.source,
      assignee: body.assignee,
    };

    allLeads.unshift(newLead);
    writeLeads(allLeads);

    return NextResponse.json(newLead, { status: 201 });
  } catch {
    return NextResponse.json({ error: "请求数据格式错误" }, { status: 400 });
  }
}
