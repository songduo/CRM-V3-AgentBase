import { NextRequest, NextResponse } from "next/server";
import type { Product, ProductQuery, CreateProductRequest } from "@/types/product";
import { readProducts, writeProducts, generateProductId } from "./utils";

/**
 * GET /api/products - 获取商品列表（支持筛选）
 *
 * 查询参数：
 *   startDate  - 开始日期 (YYYY-MM-DD)
 *   endDate    - 结束日期 (YYYY-MM-DD)
 *   productNo  - 商品编号模糊搜索
 *   name       - 商品名称模糊搜索
 *   page       - 页码（默认 1）
 *   pageSize   - 每页条数（默认 5）
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const allProducts = readProducts();

  // --- 筛选 ---
  const query: ProductQuery = {
    startDate: searchParams.get("startDate") ?? undefined,
    endDate: searchParams.get("endDate") ?? undefined,
    productNo: searchParams.get("productNo") ?? undefined,
    name: searchParams.get("name") ?? undefined,
  };

  let filtered = allProducts;

  if (query.startDate) {
    filtered = filtered.filter((p) => p.createdAt.split(" ")[0] >= query.startDate!);
  }
  if (query.endDate) {
    filtered = filtered.filter((p) => p.createdAt.split(" ")[0] <= query.endDate!);
  }
  if (query.productNo) {
    const kw = query.productNo.trim();
    filtered = filtered.filter((p) => p.productNo.includes(kw) || p.id.includes(kw));
  }
  if (query.name) {
    const kw = query.name.trim();
    filtered = filtered.filter((p) => p.name.includes(kw));
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
 * POST /api/products - 新增商品
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateProductRequest = await request.json();

    // 校验必填字段
    if (!body.productNo || !body.name || body.price == null) {
      return NextResponse.json({ error: "请填写完整商品信息" }, { status: 400 });
    }

    const allProducts = readProducts();

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newProduct: Product = {
      id: generateProductId(allProducts),
      createdAt: dateStr,
      productNo: body.productNo.trim(),
      name: body.name.trim(),
      price: body.price,
    };

    allProducts.unshift(newProduct);
    writeProducts(allProducts);

    return NextResponse.json(newProduct, { status: 201 });
  } catch {
    return NextResponse.json({ error: "请求数据格式错误" }, { status: 400 });
  }
}
