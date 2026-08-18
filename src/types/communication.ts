/** 沟通记录数据 */
export interface Communication {
  id: string;
  leadId: string;
  sentAt: string;
  sender: string;
  senderRole: "销售" | "客户";
  content: string;
  type: string;
  channel: string;
}

/** 沟通记录列表查询参数 */
export interface CommunicationQuery {
  leadId?: string;
  senderRole?: "销售" | "客户" | "";
  channel?: string;
  startDate?: string;
  endDate?: string;
}

/** 沟通记录列表 API 响应 */
export interface CommunicationListResponse {
  data: Communication[];
  total: number;
  page: number;
  pageSize: number;
}
