import { NextRequest, NextResponse } from "next/server";
import type { Order, OrderQuery, CreateOrderRequest, OrderFormOptions } from "@/types/order";
import { readOrders, writeOrders, generateOrderId, generateOrderNo, readLeads, readProducts } from "./utils";

/**
 * GET /api/orders - 获取订单列表（支持筛选）
 *
 * 查询参数：
 *   startDate    - 开始日期 (YYYY-MM-DD)
 *   endDate      - 结束日期 (YYYY-MM-DD)
 *   orderNo      - 订单编号模糊搜索
 *   customerName - 客户名称模糊搜索
 *   customerPhone- 客户电话模糊搜索
 *   productName  - 商品名称模糊搜索
 *   page         - 页码（默认 1）
 *   pageSize     - 每页条数（默认 5）
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // 如果请求 options，则返回新增表单所需的下拉选项
  if (searchParams.get("options") === "true") {
    const leads = readLeads().map((l) => ({ id: l.id, name: l.name, phone: l.phone }));
    const products = readProducts().map((p) => ({ id: p.id, productNo: p.productNo, name: p.name, price: p.price }));
    const options: OrderFormOptions = { leads, products };
    return NextResponse.json(options);
  }

  const allOrders = readOrders();

  // --- 筛选 ---
  const query: OrderQuery = {
    startDate: searchParams.get("startDate") ?? undefined,
    endDate: searchParams.get("endDate") ?? undefined,
    orderNo: searchParams.get("orderNo") ?? undefined,
    customerName: searchParams.get("customerName") ?? undefined,
    customerPhone: searchParams.get("customerPhone") ?? undefined,
    productName: searchParams.get("productName") ?? undefined,
  };

  let filtered = allOrders;

  if (query.startDate) {
    filtered = filtered.filter((o) => o.createdAt.split(" ")[0] >= query.startDate!);
  }
  if (query.endDate) {
    filtered = filtered.filter((o) => o.createdAt.split(" ")[0] <= query.endDate!);
  }
  if (query.orderNo) {
    const kw = query.orderNo.trim();
    filtered = filtered.filter((o) => o.orderNo.includes(kw));
  }
  if (query.customerName) {
    const kw = query.customerName.trim();
    filtered = filtered.filter((o) => o.customerName.includes(kw));
  }
  if (query.customerPhone) {
    const kw = query.customerPhone.trim();
    filtered = filtered.filter((o) => o.customerPhone.includes(kw));
  }
  if (query.productName) {
    const kw = query.productName.trim();
    filtered = filtered.filter((o) => o.productName.includes(kw));
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
 * POST /api/orders - 新增订单
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderRequest = await request.json();

    if (!body.customerPhone || !body.productId) {
      return NextResponse.json({ error: "请选择客户和商品" }, { status: 400 });
    }

    // 根据客户电话查找线索
    const leads = readLeads();
    const lead = leads.find((l) => l.phone === body.customerPhone);
    if (!lead) {
      return NextResponse.json({ error: "未找到该客户信息" }, { status: 400 });
    }

    // 根据商品 ID 查找商品
    const products = readProducts();
    const product = products.find((p) => p.id === body.productId);
    if (!product) {
      return NextResponse.json({ error: "未找到该商品信息" }, { status: 400 });
    }

    const allOrders = readOrders();

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newOrder: Order = {
      id: generateOrderId(allOrders),
      createdAt: dateStr,
      orderNo: generateOrderNo(),
      customerName: lead.name,
      customerPhone: lead.phone,
      productId: product.id,
      productNo: product.productNo,
      productName: product.name,
      amount: product.price,
    };

    allOrders.unshift(newOrder);
    writeOrders(allOrders);

    return NextResponse.json(newOrder, { status: 201 });
  } catch {
    return NextResponse.json({ error: "请求数据格式错误" }, { status: 400 });
  }
}
