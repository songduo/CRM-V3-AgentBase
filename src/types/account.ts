/** 账号数据 */
export interface Account {
  id: string;
  createdAt: string;
  phone: string;
  name: string;
  roleId: string;
  roleName: string;
  password: string;
}

/** 新增账号请求体 */
export interface CreateAccountRequest {
  phone: string;
  name: string;
  roleId: string;
}

/** 修改账号请求体 */
export interface UpdateAccountRequest {
  phone?: string;
  name?: string;
}

/** 账号列表查询参数 */
export interface AccountQuery {
  startDate?: string;
  endDate?: string;
  phone?: string;
  name?: string;
  roleName?: string;
}

/** 账号列表 API 响应 */
export interface AccountListResponse {
  data: Account[];
  total: number;
  page: number;
  pageSize: number;
}
