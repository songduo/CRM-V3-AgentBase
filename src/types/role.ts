/** 权限项：一个页面的权限配置 */
export interface PermissionItem {
  pageKey: string;
  pageLabel: string;
  functions: string[];
  dataScope: "全部" | "仅自己";
}

/** 角色数据 */
export interface Role {
  id: string;
  createdAt: string;
  name: string;
  permissions: PermissionItem[];
}

/** 新增角色请求体 */
export interface CreateRoleRequest {
  name: string;
}

/** 角色列表查询参数 */
export interface RoleQuery {
  name?: string;
}

/** 角色列表 API 响应 */
export interface RoleListResponse {
  data: Role[];
  total: number;
  page: number;
  pageSize: number;
}

/** 可用页面列表 */
export const AVAILABLE_PAGES = [
  { key: "dashboard", label: "数据仪表盘" },
  { key: "leads", label: "线索管理" },
  { key: "products", label: "商品管理" },
  { key: "orders", label: "订单管理" },
  { key: "roles", label: "角色与权限" },
  { key: "accounts", label: "账号管理" },
  { key: "communications", label: "沟通记录" },
] as const;

/** 可用功能权限 */
export const AVAILABLE_FUNCTIONS = ["查看", "修改", "增加", "删除"] as const;

/** 可用数据范围 */
export const DATA_SCOPES = ["全部", "仅自己"] as const;
