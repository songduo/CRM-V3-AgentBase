/** 线索优先级 */
export type Priority = "high" | "medium" | "low";

/** 线索数据 */
export interface Lead {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  priority: Priority;
  source: string;
  assignee: string;
  /** 邮箱 */
  email?: string;
  /** 跟进状态 */
  status?: string;
  /** 最后跟进日期 */
  lastFollowUpAt?: string;
  /** 意向产品 */
  intentProduct?: string;
  /** 预算范围 */
  budgetRange?: string;
  /** 备注 */
  remark?: string;
  /** 客户岗位 */
  customerPosition?: string;
  /** 试听课收听时长（分钟） */
  trialDuration?: number;
  /** 与客户沟通次数 */
  communicationCount?: number;
}

/** 新增线索请求体 */
export interface CreateLeadRequest {
  name: string;
  phone: string;
  priority: Priority;
  source: string;
  assignee: string;
}

/** 线索列表查询参数 */
export interface LeadQuery {
  startDate?: string;
  endDate?: string;
  name?: string;
  phone?: string;
  source?: string;
  priority?: Priority | "";
}

/** 线索列表 API 响应 */
export interface LeadListResponse {
  data: Lead[];
  total: number;
  page: number;
  pageSize: number;
}
