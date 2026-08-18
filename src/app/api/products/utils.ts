import fs from "fs";
import path from "path";
import type { Product } from "@/types/product";

const DATA_PATH = path.join(process.cwd(), "data", "products.json");

/** 读取所有商品 */
export function readProducts(): Product[] {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/** 写入所有商品 */
export function writeProducts(products: Product[]): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(products, null, 2), "utf-8");
}

/** 根据 ID 查找商品 */
export function findProduct(id: string): Product | undefined {
  return readProducts().find((p) => p.id === id);
}

/** 更新商品 */
export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const products = readProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;
  products[index] = { ...products[index], ...updates };
  writeProducts(products);
  return products[index];
}

/** 删除商品 */
export function deleteProduct(id: string): boolean {
  const products = readProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return false;
  products.splice(index, 1);
  writeProducts(products);
  return true;
}

/** 生成新商品 ID */
export function generateProductId(products: Product[]): string {
  const maxNum = products.reduce((max, p) => {
    const num = parseInt(p.id.replace("PD-2026-", ""), 10);
    return num > max ? num : max;
  }, 0);
  const next = String(maxNum + 1).padStart(4, "0");
  return `PD-2026-${next}`;
}
