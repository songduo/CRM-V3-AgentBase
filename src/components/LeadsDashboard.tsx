"use client";

import { useState, useEffect, useCallback } from "react";
import type { Lead, LeadListResponse, Priority, CreateLeadRequest } from "@/types/lead";
import { usePermission } from "@/hooks/usePermission";
import Sidebar from "./Sidebar";
import Drawer from "./Drawer";
import Modal from "./Modal";
import { defaultDateRange } from "@/lib/date";

/* ========== 常量 ========== */
const PRIORITY_CONFIG: Record<Priority, { label: string; bg: string; color: string }> = {
  high: { label: "高", bg: "#FEF2F2", color: "#DC2626" },
  medium: { label: "中", bg: "#FFF7ED", color: "#EA580C" },
  low: { label: "低", bg: "#F0FDF4", color: "#16A34A" },
};

const AVATAR_COLORS = [
  "linear-gradient(135deg, #2563EB, #60A5FA)",
  "linear-gradient(135deg, #7C3AED, #A78BFA)",
  "linear-gradient(135deg, #059669, #34D399)",
  "linear-gradient(135deg, #D97706, #FBBF24)",
  "linear-gradient(135deg, #DC2626, #F87171)",
];

const SOURCE_OPTIONS = ["官网咨询", "百度推广", "展会活动", "朋友圈广告", "转介绍", "行业峰会"];

const ASSIGNEE_OPTIONS = ["李思琪", "陈伟杰", "赵雪梅", "孙雅文", "周晨阳"];

/* ========== 输入框样式 ========== */
const INPUT_STYLE: React.CSSProperties = {
  padding: "7px 10px",
  border: "1px solid #E2E8F0",
  borderRadius: 8,
  fontSize: 13,
  fontFamily: "inherit",
  color: "#1E293B",
  background: "#fff",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const SELECT_STYLE: React.CSSProperties = {
  ...INPUT_STYLE,
  padding: "7px 28px 7px 10px",
  appearance: "none",
  cursor: "pointer",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 8px center",
};

/* ========== 来源标签 ========== */
function SourceTag({ source }: { source: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 500, background: "#F1F5F9", color: "#475569" }}>
      {source}
    </span>
  );
}

/* ========== 优先级徽章 ========== */
function PriorityBadge({ priority }: { priority: Priority }) {
  const pc = PRIORITY_CONFIG[priority];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: pc.bg, color: pc.color }}>
      {pc.label}
    </span>
  );
}

/* ========== 表单行组件 ========== */
function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

/* ========== 主体页面 ========== */
export default function LeadsDashboard() {
  // ---- 权限 ----
  const perm = usePermission("leads");

  // ---- 列表数据 ----
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [loading, setLoading] = useState(false);

  // ---- 筛选 ----
  const [filters, setFilters] = useState({
    ...defaultDateRange(),
    name: "",
    phone: "",
    source: "",
    priority: "",
  });

  // ---- 抽屉 & 弹窗 ----
  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [deleteLead, setDeleteLead] = useState<Lead | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // ---- 编辑表单数据 ----
  const [editForm, setEditForm] = useState({ name: "", phone: "", priority: "" as Priority | "", source: "", assignee: "" });
  const [addForm, setAddForm] = useState<CreateLeadRequest>({ name: "", phone: "", priority: "medium", source: "官网咨询", assignee: "李思琪" });

  // ---- 数据加载 ----
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.endDate) params.set("endDate", filters.endDate);
      if (filters.name) params.set("name", filters.name);
      if (filters.phone) params.set("phone", filters.phone);
      if (filters.source) params.set("source", filters.source);
      if (filters.priority) params.set("priority", filters.priority);
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));

      const res = await fetch(`/api/leads?${params.toString()}`);
      const data: LeadListResponse = await res.json();
      setLeads(data.data);
      setTotal(data.total);
    } catch {
      setLeads([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  // ---- 详情 ----
  const openDetail = async (lead: Lead) => {
    try {
      const res = await fetch(`/api/leads/${lead.id}`);
      const data = await res.json();
      setDetailLead(data);
    } catch {
      setDetailLead(lead);
    }
  };

  // ---- 编辑 ----
  const openEdit = async (lead: Lead) => {
    try {
      const res = await fetch(`/api/leads/${lead.id}`);
      const data: Lead = await res.json();
      setEditLead(data);
      setEditForm({ name: data.name, phone: data.phone, priority: data.priority, source: data.source, assignee: data.assignee });
    } catch {
      setEditLead(lead);
      setEditForm({ name: lead.name, phone: lead.phone, priority: lead.priority, source: lead.source, assignee: lead.assignee });
    }
  };

  const handleEditSubmit = async () => {
    if (!editLead) return;
    if (!editForm.name || !editForm.phone || !editForm.priority || !editForm.source || !editForm.assignee) {
      alert("请填写完整信息");
      return;
    }
    await fetch(`/api/leads/${editLead.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setEditLead(null);
    fetchLeads();
  };

  // ---- 删除 ----
  const handleDeleteConfirm = async () => {
    if (!deleteLead) return;
    await fetch(`/api/leads/${deleteLead.id}`, { method: "DELETE" });
    setDeleteLead(null);
    setPage(1);
    fetchLeads();
  };

  // ---- 新增 ----
  const handleAddSubmit = async () => {
    if (!addForm.name || !addForm.phone || !addForm.priority || !addForm.source || !addForm.assignee) {
      alert("请填写完整信息");
      return;
    }
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addForm),
    });
    setShowAddModal(false);
    setAddForm({ name: "", phone: "", priority: "medium", source: "官网咨询", assignee: "李思琪" });
    setPage(1);
    fetchLeads();
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar activeItem="leads" />
      <main style={{ flex: 1, minWidth: 0, padding: "28px 32px", overflowY: "auto", height: "100vh" }}>
        {/* ====== 页面标题 ====== */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.02em", margin: 0 }}>客户线索管理</h1>
            <p style={{ fontSize: 13, color: "#64748B", marginTop: 4, margin: 0 }}>管理和追踪所有潜在客户线索，跟进商机转化</p>
          </div>
          {perm.canAdd && (
          <button
            onClick={() => setShowAddModal(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: "13.5px", border: "none", cursor: "pointer", fontFamily: "inherit", lineHeight: 1, background: "#2563EB", color: "#fff" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            添加新线索
          </button>
          )}
        </div>

        {/* ====== 筛选栏 ====== */}
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: "14px 20px", marginBottom: 16, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
          {/* 创建时间 */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "12.5px", fontWeight: 500, color: "#64748B", whiteSpace: "nowrap" }}>创建时间</span>
            <input type="date" value={filters.startDate} onChange={(e) => handleFilterChange("startDate", e.target.value)} style={{ padding: "7px 10px", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13, fontFamily: "inherit", color: "#1E293B", background: "#fff", outline: "none", minWidth: 120, width: 130 }} />
            <span style={{ color: "#94A3B8", fontSize: 12 }}>至</span>
            <input type="date" value={filters.endDate} onChange={(e) => handleFilterChange("endDate", e.target.value)} style={{ padding: "7px 10px", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13, fontFamily: "inherit", color: "#1E293B", background: "#fff", outline: "none", minWidth: 120, width: 130 }} />
          </div>
          <div style={{ width: 1, height: 24, background: "#E2E8F0" }} />

          {/* 姓名 */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "12.5px", fontWeight: 500, color: "#64748B", whiteSpace: "nowrap" }}>姓名</span>
            <input type="text" value={filters.name} onChange={(e) => handleFilterChange("name", e.target.value)} placeholder="请输入姓名" style={{ padding: "7px 10px", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13, fontFamily: "inherit", color: "#1E293B", background: "#fff", outline: "none", minWidth: 120, width: 130 }} />
          </div>

          {/* 电话 */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "12.5px", fontWeight: 500, color: "#64748B", whiteSpace: "nowrap" }}>电话</span>
            <input type="text" value={filters.phone} onChange={(e) => handleFilterChange("phone", e.target.value)} placeholder="请输入电话号码" style={{ padding: "7px 10px", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13, fontFamily: "inherit", color: "#1E293B", background: "#fff", outline: "none", minWidth: 120, width: 130 }} />
          </div>

          {/* 客户来源 */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "12.5px", fontWeight: 500, color: "#64748B", whiteSpace: "nowrap" }}>客户来源</span>
            <select value={filters.source} onChange={(e) => handleFilterChange("source", e.target.value)} style={{ ...SELECT_STYLE, minWidth: 100 }}>
              <option value="">全部</option>
              {SOURCE_OPTIONS.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
          </div>

          {/* 优先级 */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "12.5px", fontWeight: 500, color: "#64748B", whiteSpace: "nowrap" }}>优先级</span>
            <select value={filters.priority} onChange={(e) => handleFilterChange("priority", e.target.value)} style={{ ...SELECT_STYLE, minWidth: 95 }}>
              <option value="">全部</option>
              <option value="high">高优先级</option>
              <option value="medium">中优先级</option>
              <option value="low">低优先级</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <button onClick={fetchLeads} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 14px", borderRadius: 8, fontWeight: 600, fontSize: "12.5px", border: "none", cursor: "pointer", fontFamily: "inherit", lineHeight: 1, background: "#2563EB", color: "#fff", margin: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              查询
            </button>
          </div>
        </div>

        {/* ====== 表格 ====== */}
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, overflow: "hidden" }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0", color: "#94A3B8" }}>加载中...</div>
          ) : leads.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0", color: "#94A3B8" }}>暂无符合条件的线索</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                    <th style={{ width: 40, padding: "10px 16px", paddingLeft: 20 }}>
                      <input type="checkbox" id="selectAllHeader" style={{ display: "none" }} />
                      <label htmlFor="selectAllHeader" style={{ width: 16, height: 16, border: "2px solid #CBD5E1", borderRadius: 4, display: "inline-block", cursor: "pointer", position: "relative", margin: 0 }} />
                    </th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontSize: "11.5px", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap", userSelect: "none" }}>线索编号</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontSize: "11.5px", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap", userSelect: "none" }}>创建时间</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontSize: "11.5px", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap", userSelect: "none" }}>姓名</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontSize: "11.5px", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap", userSelect: "none" }}>电话</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontSize: "11.5px", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap", userSelect: "none" }}>优先级</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontSize: "11.5px", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap", userSelect: "none" }}>客户来源</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontSize: "11.5px", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap", userSelect: "none" }}>跟进人</th>
                    <th style={{ padding: "10px 16px", textAlign: "right", paddingRight: 20, fontSize: "11.5px", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap", userSelect: "none" }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, index) => (
                    <tr key={lead.id} style={{ borderBottom: "1px solid #F1F5F9", transition: "all 0.15s ease" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#FAFBFC"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}>
                      <td style={{ padding: "12px 16px", paddingLeft: 20 }}>
                        <input type="checkbox" id={`row-${lead.id}`} style={{ display: "none" }} />
                        <label htmlFor={`row-${lead.id}`} style={{ width: 16, height: 16, border: "2px solid #CBD5E1", borderRadius: 4, display: "inline-block", cursor: "pointer", position: "relative", margin: 0 }} />
                      </td>
                      <td style={{ padding: "12px 16px" }}><span style={{ fontWeight: 600, color: "#2563EB", fontSize: 13 }}>{lead.id}</span></td>
                      <td style={{ padding: "12px 16px", color: "#64748B", fontSize: 13, whiteSpace: "nowrap" }}>{lead.createdAt}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 26, height: 26, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0, background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}>
                            {lead.name[0]}
                          </div>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{lead.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#64748B", fontSize: 13 }}>{lead.phone}</td>
                      <td style={{ padding: "12px 16px" }}><PriorityBadge priority={lead.priority} /></td>
                      <td style={{ padding: "12px 16px" }}><SourceTag source={lead.source} /></td>
                      <td style={{ padding: "12px 16px", color: "#64748B", fontSize: 13 }}>{lead.assignee}</td>
                      <td style={{ padding: "12px 16px", textAlign: "right", paddingRight: 20 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                          {/* 详情 */}
                          {perm.canView && (
                          <button title="查看详情" onClick={() => openDetail(lead)} style={{ width: 30, height: 30, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", borderRadius: 6, cursor: "pointer", color: "#94A3B8" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#EFF6FF"; (e.currentTarget as HTMLElement).style.color = "#2563EB"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.color = "#94A3B8"; }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M22 12c0 3.5-4.5 8-10 8s-10-4.5-10-8 4.5-8 10-8 10 4.5 10 8z" /></svg>
                          </button>
                          )}
                          {/* 修改 */}
                          {perm.canEdit && (
                          <button title="修改线索" onClick={() => openEdit(lead)} style={{ width: 30, height: 30, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", borderRadius: 6, cursor: "pointer", color: "#94A3B8" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#FFF7ED"; (e.currentTarget as HTMLElement).style.color = "#EA580C"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.color = "#94A3B8"; }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                          </button>
                          )}
                          {/* 删除 */}
                          {perm.canDelete && (
                          <button title="删除线索" onClick={() => setDeleteLead(lead)} style={{ width: 30, height: 30, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", borderRadius: 6, cursor: "pointer", color: "#94A3B8" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#FEF2F2"; (e.currentTarget as HTMLElement).style.color = "#DC2626"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.color = "#94A3B8"; }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                          </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 分页 */}
          {total > 0 && (() => {
            const totalPages = Math.ceil(total / pageSize);
            const from = (page - 1) * pageSize + 1;
            const to = Math.min(page * pageSize, total);
            const getPages = () => {
              if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
              if (page <= 3) return [1, 2, 3, -1, totalPages];
              if (page >= totalPages - 2) return [1, -1, totalPages - 2, totalPages - 1, totalPages];
              return [1, -1, page - 1, page, page + 1, -1, totalPages];
            };
            const pages = getPages();
            return (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderTop: "1px solid #E2E8F0" }}>
                <span style={{ fontSize: "12.5px", color: "#64748B" }}>显示 {from}-{to} 条，共 {total} 条</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <button onClick={() => setPage(page - 1)} disabled={page <= 1}
                    style={{ width: 32, height: 32, border: "1px solid #E2E8F0", borderRadius: 8, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: page <= 1 ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 500, color: page <= 1 ? "#CBD5E1" : "#64748B", fontFamily: "inherit", opacity: page <= 1 ? 0.4 : 1 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                  </button>
                  {pages.map((p, i) => p === -1 ? (
                    <span key={`e-${i}`} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#64748B" }}>...</span>
                  ) : (
                    <button key={p} onClick={() => setPage(p)}
                      style={{ width: 32, height: 32, border: p === page ? "1px solid #2563EB" : "1px solid #E2E8F0", borderRadius: 8, background: p === page ? "#2563EB" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 13, fontWeight: 500, color: p === page ? "#fff" : "#64748B", fontFamily: "inherit" }}>{p}</button>
                  ))}
                  <button onClick={() => setPage(page + 1)} disabled={page >= totalPages}
                    style={{ width: 32, height: 32, border: "1px solid #E2E8F0", borderRadius: 8, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: page >= totalPages ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 500, color: page >= totalPages ? "#CBD5E1" : "#64748B", fontFamily: "inherit", opacity: page >= totalPages ? 0.4 : 1 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </main>

      {/* ====== 线索详情抽屉 ====== */}
      <Drawer open={!!detailLead} onClose={() => setDetailLead(null)} title="线索详情">
        {detailLead && (
          <div>
            <DetailRow label="线索编号" value={detailLead.id} />
            <DetailRow label="创建时间" value={detailLead.createdAt} />
            <DetailRow label="姓名" value={detailLead.name} />
            <DetailRow label="电话" value={detailLead.phone} />
            <DetailRow label="优先级" value={PRIORITY_CONFIG[detailLead.priority].label} />
            <DetailRow label="客户来源" value={detailLead.source} />
            <DetailRow label="跟进人" value={detailLead.assignee} />
            <DetailRow label="邮箱" value={detailLead.email || "—"} />
            <DetailRow label="跟进状态" value={detailLead.status || "—"} />
            <DetailRow label="最后跟进日期" value={detailLead.lastFollowUpAt || "—"} />
            <DetailRow label="意向产品" value={detailLead.intentProduct || "—"} />
            <DetailRow label="预算范围" value={detailLead.budgetRange || "—"} />
            <DetailRow label="客户岗位" value={detailLead.customerPosition || "—"} />
            <DetailRow label="试听课收听时长" value={detailLead.trialDuration != null ? `${detailLead.trialDuration} 分钟` : "—"} />
            <DetailRow label="沟通次数" value={detailLead.communicationCount != null ? `${detailLead.communicationCount} 次` : "—"} />
            <DetailRow label="备注" value={detailLead.remark || "—"} />
          </div>
        )}
      </Drawer>

      {/* ====== 线索修改抽屉 ====== */}
      <Drawer open={!!editLead} onClose={() => setEditLead(null)} title="修改线索">
        {editLead && (
          <div>
            <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 20, padding: "8px 12px", background: "#F8FAFC", borderRadius: 8, border: "1px solid #E2E8F0" }}>
              线索编号：{editLead.id} | 创建时间：{editLead.createdAt}
            </div>
            <FormField label="姓名">
              <input type="text" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} style={INPUT_STYLE} placeholder="请输入姓名" />
            </FormField>
            <FormField label="电话">
              <input type="text" value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} style={INPUT_STYLE} placeholder="请输入电话" />
            </FormField>
            <FormField label="优先级">
              <select value={editForm.priority} onChange={(e) => setEditForm((f) => ({ ...f, priority: e.target.value as Priority }))} style={SELECT_STYLE}>
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </FormField>
            <FormField label="客户来源">
              <select value={editForm.source} onChange={(e) => setEditForm((f) => ({ ...f, source: e.target.value }))} style={SELECT_STYLE}>
                {SOURCE_OPTIONS.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
            </FormField>
            <FormField label="跟进人">
              <select value={editForm.assignee} onChange={(e) => setEditForm((f) => ({ ...f, assignee: e.target.value }))} style={SELECT_STYLE}>
                {ASSIGNEE_OPTIONS.map((a) => (<option key={a} value={a}>{a}</option>))}
              </select>
            </FormField>
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button onClick={handleEditSubmit} style={{ flex: 1, padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: "13.5px", border: "none", background: "#2563EB", color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>保存修改</button>
              <button onClick={() => setEditLead(null)} style={{ flex: 1, padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: "13.5px", border: "1px solid #E2E8F0", background: "#fff", color: "#1E293B", cursor: "pointer", fontFamily: "inherit" }}>取消</button>
            </div>
          </div>
        )}
      </Drawer>

      {/* ====== 删除确认弹窗 ====== */}
      <Modal open={!!deleteLead} onClose={() => setDeleteLead(null)} title="删除确认">
        {deleteLead && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: 16, background: "#FEF2F2", borderRadius: 10, border: "1px solid #FECACA" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", color: "#DC2626" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#991B1B" }}>确认删除此线索？</div>
                <div style={{ fontSize: 13, color: "#B91C1C", marginTop: 2 }}>删除后数据将无法恢复。</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleDeleteConfirm} style={{ flex: 1, padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: "13.5px", border: "none", background: "#DC2626", color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>确认删除</button>
              <button onClick={() => setDeleteLead(null)} style={{ flex: 1, padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: "13.5px", border: "1px solid #E2E8F0", background: "#fff", color: "#1E293B", cursor: "pointer", fontFamily: "inherit" }}>取消</button>
            </div>
          </div>
        )}
      </Modal>

      {/* ====== 新增线索弹窗 ====== */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="添加新线索">
        <div>
          <FormField label="姓名">
            <input type="text" value={addForm.name} onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))} style={INPUT_STYLE} placeholder="请输入姓名" />
          </FormField>
          <FormField label="电话">
            <input type="text" value={addForm.phone} onChange={(e) => setAddForm((f) => ({ ...f, phone: e.target.value }))} style={INPUT_STYLE} placeholder="请输入电话" />
          </FormField>
          <FormField label="优先级">
            <select value={addForm.priority} onChange={(e) => setAddForm((f) => ({ ...f, priority: e.target.value as Priority }))} style={SELECT_STYLE}>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </FormField>
          <FormField label="客户来源">
            <select value={addForm.source} onChange={(e) => setAddForm((f) => ({ ...f, source: e.target.value }))} style={SELECT_STYLE}>
              {SOURCE_OPTIONS.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
          </FormField>
          <FormField label="跟进人">
            <select value={addForm.assignee} onChange={(e) => setAddForm((f) => ({ ...f, assignee: e.target.value }))} style={SELECT_STYLE}>
              {ASSIGNEE_OPTIONS.map((a) => (<option key={a} value={a}>{a}</option>))}
            </select>
          </FormField>
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <button onClick={handleAddSubmit} style={{ flex: 1, padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: "13.5px", border: "none", background: "#2563EB", color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>添加</button>
            <button onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: "13.5px", border: "1px solid #E2E8F0", background: "#fff", color: "#1E293B", cursor: "pointer", fontFamily: "inherit" }}>取消</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", padding: "12px 0", borderBottom: "1px solid #F1F5F9" }}>
      <div style={{ width: 100, fontSize: 13, color: "#64748B", flexShrink: 0 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#1E293B" }}>{value}</div>
    </div>
  );
}
