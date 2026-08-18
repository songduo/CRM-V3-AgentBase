"use client";

import { useState, useEffect, useCallback } from "react";
import type { Account, AccountListResponse, CreateAccountRequest } from "@/types/account";
import { usePermission } from "@/hooks/usePermission";
import Sidebar from "./Sidebar";
import Drawer from "./Drawer";
import Modal from "./Modal";

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

/* ========== 表单行组件 ========== */
function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

/* ========== 详情行组件 ========== */
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", padding: "12px 0", borderBottom: "1px solid #F1F5F9" }}>
      <div style={{ width: 100, fontSize: 13, color: "#64748B", flexShrink: 0 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#1E293B" }}>{value}</div>
    </div>
  );
}

/* ========== 角色标签 ========== */
function RoleTag({ name }: { name: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600, background: "#EFF6FF", color: "#2563EB" }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      {name}
    </span>
  );
}

/* ========== 主体页面 ========== */
export default function AccountsDashboard() {
  // ---- 权限 ----
  const perm = usePermission("accounts");

  // ---- 列表数据 ----
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  // ---- 角色选项 ----
  const [roleOptions, setRoleOptions] = useState<{ id: string; name: string }[]>([]);

  // ---- 筛选 ----
  const [filters, setFilters] = useState({
    startDate: "2026-06-01",
    endDate: "2026-06-12",
    phone: "",
    name: "",
    roleName: "",
  });

  // ---- 抽屉 & 弹窗 ----
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [resetAccount, setResetAccount] = useState<Account | null>(null);
  const [deleteAccount, setDeleteAccount] = useState<Account | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // ---- 编辑表单数据 ----
  const [editForm, setEditForm] = useState({ phone: "", name: "" });
  const [addForm, setAddForm] = useState<CreateAccountRequest & { roleName: string }>({ phone: "", name: "", roleId: "", roleName: "" });

  // ---- 加载角色选项 ----
  const fetchRoleOptions = useCallback(async () => {
    try {
      const res = await fetch("/api/accounts?roles=true");
      const data = await res.json();
      setRoleOptions(data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => { fetchRoleOptions(); }, [fetchRoleOptions]);

  // ---- 数据加载 ----
  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.endDate) params.set("endDate", filters.endDate);
      if (filters.phone) params.set("phone", filters.phone);
      if (filters.name) params.set("name", filters.name);
      if (filters.roleName) params.set("roleName", filters.roleName);
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));

      const res = await fetch(`/api/accounts?${params.toString()}`);
      const data: AccountListResponse = await res.json();
      setAccounts(data.data);
      setTotal(data.total);
    } catch {
      setAccounts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize]);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  // ---- 打开新增弹窗 ----
  const openAdd = () => {
    fetchRoleOptions();
    setAddForm({ phone: "", name: "", roleId: "", roleName: "" });
    setShowAddModal(true);
  };

  // ---- 修改 ----
  const openEdit = async (account: Account) => {
    try {
      const res = await fetch(`/api/accounts/${account.id}`);
      const data = await res.json();
      setEditAccount(data);
      setEditForm({ phone: data.phone, name: data.name });
    } catch {
      setEditAccount(account);
      setEditForm({ phone: account.phone, name: account.name });
    }
  };

  const handleEditSubmit = async () => {
    if (!editAccount) return;
    if (!editForm.phone || !editForm.name) {
      alert("请填写完整信息");
      return;
    }
    await fetch(`/api/accounts/${editAccount.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setEditAccount(null);
    fetchAccounts();
  };

  // ---- 重置密码 ----
  const handleResetConfirm = async () => {
    if (!resetAccount) return;
    await fetch(`/api/accounts/${resetAccount.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "123456" }),
    });
    setResetAccount(null);
  };

  // ---- 删除 ----
  const handleDeleteConfirm = async () => {
    if (!deleteAccount) return;
    await fetch(`/api/accounts/${deleteAccount.id}`, { method: "DELETE" });
    setDeleteAccount(null);
    setPage(1);
    fetchAccounts();
  };

  // ---- 新增 ----
  const handleAddSubmit = async () => {
    if (!addForm.phone || !addForm.name || !addForm.roleId) {
      alert("请填写完整信息");
      return;
    }
    const res = await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: addForm.phone, name: addForm.name, roleId: addForm.roleId } as CreateAccountRequest),
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "添加失败");
      return;
    }
    setShowAddModal(false);
    setPage(1);
    fetchAccounts();
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar activeItem="accounts" />
      <main style={{ flex: 1, minWidth: 0, padding: "28px 32px", overflowY: "auto", height: "100vh" }}>
        {/* ====== 页面标题 ====== */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.02em", margin: 0 }}>账号管理</h1>
            <p style={{ fontSize: 13, color: "#64748B", marginTop: 4, margin: 0 }}>管理系统用户账号及角色分配</p>
          </div>
          {perm.canAdd && (
          <button
            onClick={openAdd}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: "13.5px", border: "none", cursor: "pointer", fontFamily: "inherit", lineHeight: 1, background: "#2563EB", color: "#fff" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            新增账号
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

          {/* 手机号 */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "12.5px", fontWeight: 500, color: "#64748B", whiteSpace: "nowrap" }}>手机号</span>
            <input type="text" value={filters.phone} onChange={(e) => handleFilterChange("phone", e.target.value)} placeholder="请输入手机号" style={{ padding: "7px 10px", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13, fontFamily: "inherit", color: "#1E293B", background: "#fff", outline: "none", minWidth: 120, width: 130 }} />
          </div>

          {/* 用户姓名 */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "12.5px", fontWeight: 500, color: "#64748B", whiteSpace: "nowrap" }}>用户姓名</span>
            <input type="text" value={filters.name} onChange={(e) => handleFilterChange("name", e.target.value)} placeholder="请输入用户姓名" style={{ padding: "7px 10px", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13, fontFamily: "inherit", color: "#1E293B", background: "#fff", outline: "none", minWidth: 120, width: 130 }} />
          </div>

          {/* 所属角色 */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "12.5px", fontWeight: 500, color: "#64748B", whiteSpace: "nowrap" }}>所属角色</span>
            <input type="text" value={filters.roleName} onChange={(e) => handleFilterChange("roleName", e.target.value)} placeholder="请输入角色名称" style={{ padding: "7px 10px", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13, fontFamily: "inherit", color: "#1E293B", background: "#fff", outline: "none", minWidth: 120, width: 130 }} />
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <button onClick={fetchAccounts} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 14px", borderRadius: 8, fontWeight: 600, fontSize: "12.5px", border: "none", cursor: "pointer", fontFamily: "inherit", lineHeight: 1, background: "#2563EB", color: "#fff", margin: 0 }}>
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
          ) : accounts.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0", color: "#94A3B8" }}>暂无符合条件的账号</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                    <th style={{ width: 40, padding: "10px 16px", paddingLeft: 20 }}>
                      <input type="checkbox" id="selectAllHeader" style={{ display: "none" }} />
                      <label htmlFor="selectAllHeader" style={{ width: 16, height: 16, border: "2px solid #CBD5E1", borderRadius: 4, display: "inline-block", cursor: "pointer", position: "relative", margin: 0 }} />
                    </th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontSize: "11.5px", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap", userSelect: "none" }}>创建时间</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontSize: "11.5px", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap", userSelect: "none" }}>手机号</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontSize: "11.5px", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap", userSelect: "none" }}>用户姓名</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontSize: "11.5px", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap", userSelect: "none" }}>所属角色</th>
                    <th style={{ padding: "10px 16px", textAlign: "right", paddingRight: 20, fontSize: "11.5px", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap", userSelect: "none" }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account) => (
                    <tr key={account.id} style={{ borderBottom: "1px solid #F1F5F9", transition: "all 0.15s ease" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#FAFBFC"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}>
                      <td style={{ padding: "12px 16px", paddingLeft: 20 }}>
                        <input type="checkbox" id={`row-${account.id}`} style={{ display: "none" }} />
                        <label htmlFor={`row-${account.id}`} style={{ width: 16, height: 16, border: "2px solid #CBD5E1", borderRadius: 4, display: "inline-block", cursor: "pointer", position: "relative", margin: 0 }} />
                      </td>
                      <td style={{ padding: "12px 16px", color: "#64748B", fontSize: 13, whiteSpace: "nowrap" }}>{account.createdAt}</td>
                      <td style={{ padding: "12px 16px", fontWeight: 600, fontSize: 13, color: "#1E293B" }}>{account.phone}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 26, height: 26, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0, background: account.roleName === "管理员" ? "#F59E0B" : "#7C3AED" }}>
                            {account.name[0]}
                          </div>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{account.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}><RoleTag name={account.roleName} /></td>
                      <td style={{ padding: "12px 16px", textAlign: "right", paddingRight: 20 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                          {/* 修改 */}
                          {perm.canEdit && (
                          <button title="修改" onClick={() => openEdit(account)} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 10px", border: "1px solid #E2E8F0", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 500, color: "#1E293B", fontFamily: "inherit" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#FFF7ED"; (e.currentTarget as HTMLElement).style.borderColor = "#EA580C"; (e.currentTarget as HTMLElement).style.color = "#EA580C"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0"; (e.currentTarget as HTMLElement).style.color = "#1E293B"; }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                            修改
                          </button>
                          )}
                          {/* 重置密码 */}
                          {perm.canEdit && (
                          <button title="重置密码" onClick={() => setResetAccount(account)} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 10px", border: "1px solid #E2E8F0", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 500, color: "#1E293B", fontFamily: "inherit" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#EFF6FF"; (e.currentTarget as HTMLElement).style.borderColor = "#2563EB"; (e.currentTarget as HTMLElement).style.color = "#2563EB"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0"; (e.currentTarget as HTMLElement).style.color = "#1E293B"; }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            重置密码
                          </button>
                          )}
                          {/* 删除 */}
                          {perm.canDelete && (
                          <button title="删除" onClick={() => setDeleteAccount(account)} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 10px", border: "1px solid #E2E8F0", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 500, color: "#1E293B", fontFamily: "inherit" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#FEF2F2"; (e.currentTarget as HTMLElement).style.borderColor = "#DC2626"; (e.currentTarget as HTMLElement).style.color = "#DC2626"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0"; (e.currentTarget as HTMLElement).style.color = "#1E293B"; }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                            删除
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

      {/* ====== 修改抽屉 ====== */}
      <Drawer open={!!editAccount} onClose={() => setEditAccount(null)} title="修改账号">
        {editAccount && (
          <div>
            <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 20, padding: "8px 12px", background: "#F8FAFC", borderRadius: 8, border: "1px solid #E2E8F0" }}>
              创建时间：{editAccount.createdAt} | 所属角色：{editAccount.roleName}
            </div>
            <FormField label="手机号">
              <input type="text" value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} style={INPUT_STYLE} placeholder="请输入手机号" />
            </FormField>
            <FormField label="用户姓名">
              <input type="text" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} style={INPUT_STYLE} placeholder="请输入用户姓名" />
            </FormField>
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button onClick={handleEditSubmit} style={{ flex: 1, padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: "13.5px", border: "none", background: "#2563EB", color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>保存修改</button>
              <button onClick={() => setEditAccount(null)} style={{ flex: 1, padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: "13.5px", border: "1px solid #E2E8F0", background: "#fff", color: "#1E293B", cursor: "pointer", fontFamily: "inherit" }}>取消</button>
            </div>
          </div>
        )}
      </Drawer>

      {/* ====== 重置密码确认弹窗 ====== */}
      <Modal open={!!resetAccount} onClose={() => setResetAccount(null)} title="密码重置确认">
        {resetAccount && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: 16, background: "#FFF7ED", borderRadius: 10, border: "1px solid #FED7AA" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#FFF7ED", display: "flex", alignItems: "center", justifyContent: "center", color: "#EA580C" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#9A3412" }}>确认重置密码？</div>
                <div style={{ fontSize: 13, color: "#C2410C", marginTop: 2 }}>
                  账号「{resetAccount.phone} ({resetAccount.name})」的密码将重置为 <strong>123456</strong>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleResetConfirm} style={{ flex: 1, padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: "13.5px", border: "none", background: "#D97706", color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>确认重置</button>
              <button onClick={() => setResetAccount(null)} style={{ flex: 1, padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: "13.5px", border: "1px solid #E2E8F0", background: "#fff", color: "#1E293B", cursor: "pointer", fontFamily: "inherit" }}>取消</button>
            </div>
          </div>
        )}
      </Modal>

      {/* ====== 删除确认弹窗 ====== */}
      <Modal open={!!deleteAccount} onClose={() => setDeleteAccount(null)} title="删除确认">
        {deleteAccount && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: 16, background: "#FEF2F2", borderRadius: 10, border: "1px solid #FECACA" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", color: "#DC2626" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#991B1B" }}>确认删除账号「{deleteAccount.name}」？</div>
                <div style={{ fontSize: 13, color: "#B91C1C", marginTop: 2 }}>删除后数据将无法恢复。</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleDeleteConfirm} style={{ flex: 1, padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: "13.5px", border: "none", background: "#DC2626", color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>确认删除</button>
              <button onClick={() => setDeleteAccount(null)} style={{ flex: 1, padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: "13.5px", border: "1px solid #E2E8F0", background: "#fff", color: "#1E293B", cursor: "pointer", fontFamily: "inherit" }}>取消</button>
            </div>
          </div>
        )}
      </Modal>

      {/* ====== 新增账号弹窗 ====== */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="新增账号">
        <div>
          <FormField label="手机号">
            <input type="text" value={addForm.phone} onChange={(e) => setAddForm((f) => ({ ...f, phone: e.target.value }))} style={INPUT_STYLE} placeholder="请输入手机号" />
          </FormField>
          <FormField label="用户姓名">
            <input type="text" value={addForm.name} onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))} style={INPUT_STYLE} placeholder="请输入用户姓名" />
          </FormField>
          <FormField label="所属角色">
            <select value={addForm.roleId} onChange={(e) => {
              const role = roleOptions.find((r) => r.id === e.target.value);
              setAddForm((f) => ({ ...f, roleId: e.target.value, roleName: role?.name ?? "" }));
            }} style={SELECT_STYLE}>
              <option value="">请选择角色</option>
              {roleOptions.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </FormField>
          <div style={{ fontSize: 12, color: "#94A3B8", marginTop: -4, marginBottom: 16 }}>
            新增账号默认密码为 <strong>123456</strong>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <button onClick={handleAddSubmit} style={{ flex: 1, padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: "13.5px", border: "none", background: "#2563EB", color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>添加</button>
            <button onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: "13.5px", border: "1px solid #E2E8F0", background: "#fff", color: "#1E293B", cursor: "pointer", fontFamily: "inherit" }}>取消</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
