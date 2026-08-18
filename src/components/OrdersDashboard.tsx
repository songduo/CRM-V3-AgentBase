"use client";

import { useState, useEffect, useCallback } from "react";
import type { Order, OrderListResponse, OrderFormOptions } from "@/types/order";
import Sidebar from "./Sidebar";
import Drawer from "./Drawer";
import Modal from "./Modal";
import { usePermission } from "@/hooks/usePermission";
import { defaultDateRange } from "@/lib/date";

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

/* ========== 金额格式化 ========== */
function formatPrice(amount: number) {
  return `¥${amount.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/* ========== 主体页面 ========== */
export default function OrdersDashboard() {
  const perm = usePermission("orders");
  // ---- 列表数据 ----
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [loading, setLoading] = useState(false);

  // ---- 表单选项数据（线索 + 商品） ----
  const [formOptions, setFormOptions] = useState<OrderFormOptions>({ leads: [], products: [] });

  // ---- 筛选 ----
  const [filters, setFilters] = useState({
    ...defaultDateRange(),
    orderNo: "",
    customerName: "",
    customerPhone: "",
    productName: "",
  });

  // ---- 抽屉 & 弹窗 ----
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [deleteOrder, setDeleteOrder] = useState<Order | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // ---- 编辑表单数据 ----
  const [editForm, setEditForm] = useState({
    customerPhone: "",
    customerName: "",
    productId: "",
    productName: "",
    productNo: "",
    amount: 0,
  });
  const [addForm, setAddForm] = useState({ customerPhone: "", productId: "" });

  // ---- 数据加载 ----
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.endDate) params.set("endDate", filters.endDate);
      if (filters.orderNo) params.set("orderNo", filters.orderNo);
      if (filters.customerName) params.set("customerName", filters.customerName);
      if (filters.customerPhone) params.set("customerPhone", filters.customerPhone);
      if (filters.productName) params.set("productName", filters.productName);
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));

      const res = await fetch(`/api/orders?${params.toString()}`);
      const data: OrderListResponse = await res.json();
      setOrders(data.data);
      setTotal(data.total);
    } catch {
      setOrders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize]);

  // 加载表单选项数据
  const fetchFormOptions = useCallback(async () => {
    try {
      const res = await fetch("/api/orders?options=true");
      const data: OrderFormOptions = await res.json();
      setFormOptions(data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // 打开新增弹窗时加载选项
  const openAddModal = () => {
    fetchFormOptions();
    setAddForm({ customerPhone: "", productId: "" });
    setShowAddModal(true);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  // ---- 新增表单联动 ----
  const handleAddPhoneChange = (phone: string) => {
    setAddForm((f) => ({ ...f, customerPhone: phone }));
  };

  const handleAddProductChange = (productId: string) => {
    setAddForm((f) => ({ ...f, productId }));
  };

  // 根据选中的电话和商品，显示关联信息
  const selectedLeadName = formOptions.leads.find((l) => l.phone === addForm.customerPhone)?.name ?? "";
  const selectedProduct = formOptions.products.find((p) => p.id === addForm.productId);

  // ---- 详情 ----
  const openDetail = async (order: Order) => {
    try {
      const res = await fetch(`/api/orders/${order.id}`);
      const data = await res.json();
      setDetailOrder(data);
    } catch {
      setDetailOrder(order);
    }
  };

  // ---- 编辑 ----
  const openEdit = async (order: Order) => {
    try {
      await fetchFormOptions();
      const res = await fetch(`/api/orders/${order.id}`);
      const data: Order = await res.json();
      setEditOrder(data);
      setEditForm({
        customerPhone: data.customerPhone,
        customerName: data.customerName,
        productId: data.productId,
        productName: data.productName,
        productNo: data.productNo,
        amount: data.amount,
      });
    } catch {
      setEditOrder(order);
      setEditForm({
        customerPhone: order.customerPhone,
        customerName: order.customerName,
        productId: order.productId,
        productName: order.productName,
        productNo: order.productNo,
        amount: order.amount,
      });
    }
  };

  // 编辑表单联动
  const handleEditPhoneChange = (phone: string) => {
    const lead = formOptions.leads.find((l) => l.phone === phone);
    setEditForm((f) => ({
      ...f,
      customerPhone: phone,
      customerName: lead?.name ?? f.customerName,
    }));
  };

  const handleEditProductChange = (productId: string) => {
    const product = formOptions.products.find((p) => p.id === productId);
    setEditForm((f) => ({
      ...f,
      productId,
      productNo: product?.productNo ?? f.productNo,
      productName: product?.name ?? f.productName,
      amount: product?.price ?? f.amount,
    }));
  };

  const handleEditSubmit = async () => {
    if (!editOrder) return;
    if (!editForm.customerPhone || !editForm.productId) {
      alert("请选择客户和商品");
      return;
    }
    await fetch(`/api/orders/${editOrder.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerPhone: editForm.customerPhone,
        productId: editForm.productId,
      }),
    });
    setEditOrder(null);
    fetchOrders();
  };

  // ---- 删除 ----
  const handleDeleteConfirm = async () => {
    if (!deleteOrder) return;
    await fetch(`/api/orders/${deleteOrder.id}`, { method: "DELETE" });
    setDeleteOrder(null);
    setPage(1);
    fetchOrders();
  };

  // ---- 新增 ----
  const handleAddSubmit = async () => {
    if (!addForm.customerPhone || !addForm.productId) {
      alert("请选择客户和商品");
      return;
    }
    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addForm),
    });
    setShowAddModal(false);
    setAddForm({ customerPhone: "", productId: "" });
    setPage(1);
    fetchOrders();
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar activeItem="orders" />
      <main style={{ flex: 1, minWidth: 0, padding: "28px 32px", overflowY: "auto", height: "100vh" }}>
        {/* ====== 页面标题 ====== */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.02em", margin: 0 }}>订单管理</h1>
            <p style={{ fontSize: 13, color: "#64748B", marginTop: 4, margin: 0 }}>管理所有客户订单信息，支持新增、修改和删除操作</p>
          </div>
          {perm.canAdd && (
          <button
            onClick={openAddModal}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: "13.5px", border: "none", cursor: "pointer", fontFamily: "inherit", lineHeight: 1, background: "#2563EB", color: "#fff" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            新增订单
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

          {/* 订单编号 */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "12.5px", fontWeight: 500, color: "#64748B", whiteSpace: "nowrap" }}>订单编号</span>
            <input type="text" value={filters.orderNo} onChange={(e) => handleFilterChange("orderNo", e.target.value)} placeholder="请输入订单编号" style={{ padding: "7px 10px", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13, fontFamily: "inherit", color: "#1E293B", background: "#fff", outline: "none", minWidth: 120, width: 130 }} />
          </div>

          {/* 客户名 */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "12.5px", fontWeight: 500, color: "#64748B", whiteSpace: "nowrap" }}>客户名</span>
            <input type="text" value={filters.customerName} onChange={(e) => handleFilterChange("customerName", e.target.value)} placeholder="请输入客户名称" style={{ padding: "7px 10px", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13, fontFamily: "inherit", color: "#1E293B", background: "#fff", outline: "none", minWidth: 120, width: 130 }} />
          </div>

          {/* 客户电话 */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "12.5px", fontWeight: 500, color: "#64748B", whiteSpace: "nowrap" }}>客户电话</span>
            <input type="text" value={filters.customerPhone} onChange={(e) => handleFilterChange("customerPhone", e.target.value)} placeholder="请输入客户电话" style={{ padding: "7px 10px", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13, fontFamily: "inherit", color: "#1E293B", background: "#fff", outline: "none", minWidth: 120, width: 130 }} />
          </div>

          {/* 商品名 */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "12.5px", fontWeight: 500, color: "#64748B", whiteSpace: "nowrap" }}>商品名</span>
            <input type="text" value={filters.productName} onChange={(e) => handleFilterChange("productName", e.target.value)} placeholder="请输入商品名称" style={{ padding: "7px 10px", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13, fontFamily: "inherit", color: "#1E293B", background: "#fff", outline: "none", minWidth: 120, width: 130 }} />
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <button onClick={fetchOrders} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 14px", borderRadius: 8, fontWeight: 600, fontSize: "12.5px", border: "none", cursor: "pointer", fontFamily: "inherit", lineHeight: 1, background: "#2563EB", color: "#fff", margin: 0 }}>
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
          ) : orders.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0", color: "#94A3B8" }}>暂无符合条件的订单</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                    <th style={{ width: 40, padding: "10px 16px", paddingLeft: 20 }}>
                      <input type="checkbox" id="selectAllHeader" style={{ display: "none" }} />
                      <label htmlFor="selectAllHeader" style={{ width: 16, height: 16, border: "2px solid #CBD5E1", borderRadius: 4, display: "inline-block", cursor: "pointer", position: "relative", margin: 0 }} />
                    </th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontSize: "11.5px", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap", userSelect: "none" }}>订单编号</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontSize: "11.5px", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap", userSelect: "none" }}>创建时间</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontSize: "11.5px", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap", userSelect: "none" }}>客户名称</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontSize: "11.5px", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap", userSelect: "none" }}>客户电话</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontSize: "11.5px", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap", userSelect: "none" }}>商品编号</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontSize: "11.5px", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap", userSelect: "none" }}>商品名称</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontSize: "11.5px", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap", userSelect: "none" }}>下单金额</th>
                    <th style={{ padding: "10px 16px", textAlign: "right", paddingRight: 20, fontSize: "11.5px", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap", userSelect: "none" }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} style={{ borderBottom: "1px solid #F1F5F9", transition: "all 0.15s ease" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#FAFBFC"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}>
                      <td style={{ padding: "12px 16px", paddingLeft: 20 }}>
                        <input type="checkbox" id={`row-${order.id}`} style={{ display: "none" }} />
                        <label htmlFor={`row-${order.id}`} style={{ width: 16, height: 16, border: "2px solid #CBD5E1", borderRadius: 4, display: "inline-block", cursor: "pointer", position: "relative", margin: 0 }} />
                      </td>
                      <td style={{ padding: "12px 16px" }}><span style={{ fontWeight: 600, color: "#2563EB", fontSize: 13 }}>{order.orderNo}</span></td>
                      <td style={{ padding: "12px 16px", color: "#64748B", fontSize: 13, whiteSpace: "nowrap" }}>{order.createdAt}</td>
                      <td style={{ padding: "12px 16px", fontWeight: 600, fontSize: 13 }}>{order.customerName}</td>
                      <td style={{ padding: "12px 16px", color: "#64748B", fontSize: 13 }}>{order.customerPhone}</td>
                      <td style={{ padding: "12px 16px", color: "#64748B", fontSize: 13 }}>{order.productNo}</td>
                      <td style={{ padding: "12px 16px", color: "#1E293B", fontSize: 13 }}>{order.productName}</td>
                      <td style={{ padding: "12px 16px", color: "#059669", fontWeight: 600, fontSize: 13 }}>{formatPrice(order.amount)}</td>
                      <td style={{ padding: "12px 16px", textAlign: "right", paddingRight: 20 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                          {perm.canView && (
                          <button title="查看详情" onClick={() => openDetail(order)} style={{ width: 30, height: 30, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", borderRadius: 6, cursor: "pointer", color: "#94A3B8" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#EFF6FF"; (e.currentTarget as HTMLElement).style.color = "#2563EB"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.color = "#94A3B8"; }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M22 12c0 3.5-4.5 8-10 8s-10-4.5-10-8 4.5-8 10-8 10 4.5 10 8z" /></svg>
                          </button>
                          )}
                          {perm.canEdit && (
                          <button title="修改订单" onClick={() => openEdit(order)} style={{ width: 30, height: 30, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", borderRadius: 6, cursor: "pointer", color: "#94A3B8" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#FFF7ED"; (e.currentTarget as HTMLElement).style.color = "#EA580C"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.color = "#94A3B8"; }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                          </button>
                          )}
                          {perm.canDelete && (
                          <button title="删除订单" onClick={() => setDeleteOrder(order)} style={{ width: 30, height: 30, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", borderRadius: 6, cursor: "pointer", color: "#94A3B8" }}
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

      {/* ====== 订单详情抽屉 ====== */}
      <Drawer open={!!detailOrder} onClose={() => setDetailOrder(null)} title="订单详情">
        {detailOrder && (
          <div>
            <DetailRow label="订单编号" value={detailOrder.orderNo} />
            <DetailRow label="创建时间" value={detailOrder.createdAt} />
            <DetailRow label="客户名称" value={detailOrder.customerName} />
            <DetailRow label="客户电话" value={detailOrder.customerPhone} />
            <DetailRow label="商品编号" value={detailOrder.productNo} />
            <DetailRow label="商品名称" value={detailOrder.productName} />
            <DetailRow label="下单金额" value={formatPrice(detailOrder.amount)} />
          </div>
        )}
      </Drawer>

      {/* ====== 订单修改抽屉 ====== */}
      <Drawer open={!!editOrder} onClose={() => setEditOrder(null)} title="修改订单">
        {editOrder && (
          <div>
            <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 20, padding: "8px 12px", background: "#F8FAFC", borderRadius: 8, border: "1px solid #E2E8F0" }}>
              订单编号：{editOrder.orderNo} | 创建时间：{editOrder.createdAt}
            </div>
            <FormField label="客户电话">
              <select value={editForm.customerPhone} onChange={(e) => handleEditPhoneChange(e.target.value)} style={SELECT_STYLE}>
                <option value="">请选择客户电话</option>
                {formOptions.leads.map((l) => (
                  <option key={l.phone} value={l.phone}>{l.phone} - {l.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="客户名称">
              <input type="text" value={editForm.customerName} readOnly style={{ ...INPUT_STYLE, background: "#F8FAFC", color: "#94A3B8" }} />
            </FormField>
            <FormField label="下单商品">
              <select value={editForm.productId} onChange={(e) => handleEditProductChange(e.target.value)} style={SELECT_STYLE}>
                <option value="">请选择商品</option>
                {formOptions.products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} - {formatPrice(p.price)}</option>
                ))}
              </select>
            </FormField>
            <FormField label="商品编号">
              <input type="text" value={editForm.productNo} readOnly style={{ ...INPUT_STYLE, background: "#F8FAFC", color: "#94A3B8" }} />
            </FormField>
            <FormField label="商品名称">
              <input type="text" value={editForm.productName} readOnly style={{ ...INPUT_STYLE, background: "#F8FAFC", color: "#94A3B8" }} />
            </FormField>
            <FormField label="下单金额">
              <input type="text" value={formatPrice(editForm.amount)} readOnly style={{ ...INPUT_STYLE, background: "#F8FAFC", color: "#059669", fontWeight: 600 }} />
            </FormField>
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button onClick={handleEditSubmit} style={{ flex: 1, padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: "13.5px", border: "none", background: "#2563EB", color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>保存修改</button>
              <button onClick={() => setEditOrder(null)} style={{ flex: 1, padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: "13.5px", border: "1px solid #E2E8F0", background: "#fff", color: "#1E293B", cursor: "pointer", fontFamily: "inherit" }}>取消</button>
            </div>
          </div>
        )}
      </Drawer>

      {/* ====== 删除确认弹窗 ====== */}
      <Modal open={!!deleteOrder} onClose={() => setDeleteOrder(null)} title="删除确认">
        {deleteOrder && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: 16, background: "#FEF2F2", borderRadius: 10, border: "1px solid #FECACA" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", color: "#DC2626" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#991B1B" }}>确认删除此订单？</div>
                <div style={{ fontSize: 13, color: "#B91C1C", marginTop: 2 }}>删除后数据将无法恢复。</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleDeleteConfirm} style={{ flex: 1, padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: "13.5px", border: "none", background: "#DC2626", color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>确认删除</button>
              <button onClick={() => setDeleteOrder(null)} style={{ flex: 1, padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: "13.5px", border: "1px solid #E2E8F0", background: "#fff", color: "#1E293B", cursor: "pointer", fontFamily: "inherit" }}>取消</button>
            </div>
          </div>
        )}
      </Modal>

      {/* ====== 新增订单弹窗 ====== */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="新增订单">
        <div>
          <FormField label="客户电话">
            <select value={addForm.customerPhone} onChange={(e) => handleAddPhoneChange(e.target.value)} style={SELECT_STYLE}>
              <option value="">请选择客户电话</option>
              {formOptions.leads.map((l) => (
                <option key={l.phone} value={l.phone}>{l.phone} - {l.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="客户名称">
            <input type="text" value={selectedLeadName || ""} readOnly placeholder="选择客户后自动关联" style={{ ...INPUT_STYLE, background: "#F8FAFC", color: selectedLeadName ? "#1E293B" : "#94A3B8" }} />
          </FormField>
          <FormField label="下单商品">
            <select value={addForm.productId} onChange={(e) => handleAddProductChange(e.target.value)} style={SELECT_STYLE}>
              <option value="">请选择商品</option>
              {formOptions.products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} - {formatPrice(p.price)}</option>
              ))}
            </select>
          </FormField>
          <FormField label="商品编号">
            <input type="text" value={selectedProduct?.productNo ?? ""} readOnly placeholder="选择商品后自动关联" style={{ ...INPUT_STYLE, background: "#F8FAFC", color: selectedProduct ? "#1E293B" : "#94A3B8" }} />
          </FormField>
          <FormField label="商品名称">
            <input type="text" value={selectedProduct?.name ?? ""} readOnly placeholder="选择商品后自动关联" style={{ ...INPUT_STYLE, background: "#F8FAFC", color: selectedProduct ? "#1E293B" : "#94A3B8" }} />
          </FormField>
          <FormField label="下单金额">
            <input type="text" value={selectedProduct ? formatPrice(selectedProduct.price) : ""} readOnly placeholder="选择商品后自动关联" style={{ ...INPUT_STYLE, background: "#F8FAFC", color: selectedProduct ? "#059669" : "#94A3B8", fontWeight: selectedProduct ? 600 : 400 }} />
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
