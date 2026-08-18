/** 商品数据 */
export interface Product {
  id: string;
  createdAt: string;
  productNo: string;
  name: string;
  price: number;
}

/** 新增商品请求体 */
export interface CreateProductRequest {
  productNo: string;
  name: string;
  price: number;
}

/** 商品列表查询参数 */
export interface ProductQuery {
  startDate?: string;
  endDate?: string;
  productNo?: string;
  name?: string;
}

/** 商品列表 API 响应 */
export interface ProductListResponse {
  data: Product[];
  total: number;
  page: number;
  pageSize: number;
}
