import fs from "fs";
import path from "path";
import type { Order } from "@/types/order";
import type { Lead } from "@/types/lead";
import type { Product } from "@/types/product";

const DATA_PATH = path.join(process.cwd(), "data", "orders.json");
const LEADS_PATH = path.join(process.cwd(), "data", "leads.json");
const PRODUCTS_PATH = path.join(process.cwd(), "data", "products.json");

/** 读取所有订单 */
export function readOrders(): Order[] {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/** 写入所有订单 */
export function writeOrders(orders: Order[]): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(orders, null, 2), "utf-8");
}

/** 读取所有线索 */
export function readLeads(): Lead[] {
  try {
    const raw = fs.readFileSync(LEADS_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/** 读取所有商品 */
export function readProducts(): Product[] {
  try {
    const raw = fs.readFileSync(PRODUCTS_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/** 根据 ID 查找订单 */
export function findOrder(id: string): Order | undefined {
  return readOrders().find((o) => o.id === id);
}

/** 更新订单 */
export function updateOrder(id: string, updates: Partial<Order>): Order | null {
  const orders = readOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return null;
  orders[index] = { ...orders[index], ...updates };
  writeOrders(orders);
  return orders[index];
}

/** 删除订单 */
export function deleteOrder(id: string): boolean {
  const orders = readOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return false;
  orders.splice(index, 1);
  writeOrders(orders);
  return true;
}

/** 生成新订单 ID */
export function generateOrderId(orders: Order[]): string {
  const maxNum = orders.reduce((max, o) => {
    const num = parseInt(o.id.replace("OD-2026-", ""), 10);
    return num > max ? num : max;
  }, 0);
  const next = String(maxNum + 1).padStart(4, "0");
  return `OD-2026-${next}`;
}

/** 生成订单编号 */
export function generateOrderNo(): string {
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const rand = String(Math.floor(Math.random() * 900) + 100);
  return `ORD-${dateStr}${rand}`;
}
