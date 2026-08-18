import { NextRequest, NextResponse } from "next/server";
import { findOrder, updateOrder, deleteOrder, readLeads, readProducts } from "../utils";

type Params = Promise<{ id: string }>;

/**
 * GET /api/orders/[id] - 获取单个订单详情
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Params }
) {
  const { id } = await params;
  const order = findOrder(id);
  if (!order) {
    return NextResponse.json({ error: "订单不存在" }, { status: 404 });
  }
  return NextResponse.json(order);
}

/**
 * PUT /api/orders/[id] - 修改订单
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  const { id } = await params;
  try {
    const body = await request.json();

    // 如果修改了客户电话，重新关联客户名称
    if (body.customerPhone) {
      const leads = readLeads();
      const lead = leads.find((l) => l.phone === body.customerPhone);
      if (lead) {
        body.customerName = lead.name;
      }
    }

    // 如果修改了商品 ID，重新关联商品信息
    if (body.productId) {
      const products = readProducts();
      const product = products.find((p) => p.id === body.productId);
      if (product) {
        body.productNo = product.productNo;
        body.productName = product.name;
        body.amount = product.price;
      }
    }

    const updated = updateOrder(id, body);
    if (!updated) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "请求数据格式错误" }, { status: 400 });
  }
}

/**
 * DELETE /api/orders/[id] - 删除订单
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Params }
) {
  const { id } = await params;
  const deleted = deleteOrder(id);
  if (!deleted) {
    return NextResponse.json({ error: "订单不存在" }, { status: 404 });
  }
  return NextResponse.json({ message: "删除成功" });
}
