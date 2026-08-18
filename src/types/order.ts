import type { Lead } from "@/types/lead";
import type { Product } from "@/types/product";

/** 订单数据 */
export interface Order {
  id: string;
  createdAt: string;
  orderNo: string;
  customerName: string;
  customerPhone: string;
  productId: string;
  productNo: string;
  productName: string;
  amount: number;
}

/** 新增订单请求体 */
export interface CreateOrderRequest {
  customerPhone: string;
  productId: string;
}

/** 订单列表查询参数 */
export interface OrderQuery {
  startDate?: string;
  endDate?: string;
  orderNo?: string;
  customerName?: string;
  customerPhone?: string;
  productName?: string;
}

/** 订单列表 API 响应 */
export interface OrderListResponse {
  data: Order[];
  total: number;
  page: number;
  pageSize: number;
}

/** 新增页面所需的下拉选项数据 */
export interface OrderFormOptions {
  leads: Pick<Lead, "id" | "name" | "phone">[];
  products: Pick<Product, "id" | "productNo" | "name" | "price">[];
}
