"use client";

import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";
import Sidebar from "./Sidebar";

// ---- 注册 Chart.js 组件 ----
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

/* ========== 工具样式 ========== */
const CARD: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #E2E8F0",
  borderRadius: 12,
  padding: "20px 24px",
};

/* ========== 假数据 ========== */
const DAY_LABELS = Array.from({ length: 15 }, (_, i) => `${i + 1}日`);

const salesTrend = [4200, 5800, 3900, 7200, 6500, 8100, 5600, 9300, 7800, 6200, 8700, 7100, 5500, 9900, 8400];
const leadsTrend = [8, 12, 6, 15, 10, 18, 9, 22, 14, 11, 19, 13, 7, 25, 16];
const ordersTrend = [2, 4, 3, 5, 4, 7, 3, 8, 6, 4, 7, 5, 3, 9, 6];

const sourceData = [
  { label: "官网咨询", value: 35 },
  { label: "百度推广", value: 28 },
  { label: "展会活动", value: 22 },
  { label: "朋友圈广告", value: 18 },
  { label: "转介绍", value: 15 },
  { label: "行业峰会", value: 10 },
];

const funnelData = [
  { label: "线索获取", value: 128 },
  { label: "需求确认", value: 86 },
  { label: "推产品", value: 52 },
  { label: "成交", value: 45 },
];

const productSales = [
  { label: "智能办公套装 Pro", value: 2999 * 2, count: 2 },
  { label: "CRM 客户管理基础版", value: 1999 * 1, count: 1 },
  { label: "智能客服机器人", value: 8999 * 1, count: 1 },
  { label: "网络安全防护套件", value: 12999 * 1, count: 1 },
  { label: "AI 内容生成平台", value: 6999 * 1, count: 1 },
  { label: "数据分析引擎旗舰版", value: 15999 * 1, count: 1 },
  { label: "会议一体机/云服务", value: 599 * 1, count: 1 },
  { label: "其他", value: 399 + 499 + 2499 + 1299 + 1599 + 899 + 3999, count: 7 },
];

const salesRanking = [
  { name: "李思琪", sales: 45800, deals: 12, leads: 30 },
  { name: "陈伟杰", sales: 39200, deals: 10, leads: 28 },
  { name: "赵雪梅", sales: 35600, deals: 9, leads: 25 },
  { name: "孙雅文", sales: 32100, deals: 8, leads: 22 },
  { name: "周晨阳", sales: 28900, deals: 7, leads: 20 },
  { name: "刘伟", sales: 21500, deals: 6, leads: 18 },
  { name: "王芳", sales: 18200, deals: 5, leads: 16 },
  { name: "张磊", sales: 15800, deals: 4, leads: 15 },
  { name: "杨帆", sales: 12600, deals: 3, leads: 12 },
  { name: "黄婷", sales: 9500, deals: 2, leads: 10 },
];

// 按销售额排序
const salesSorted = [...salesRanking].sort((a, b) => b.sales - a.sales);
// 按转化率排序
const conversionSorted = [...salesRanking]
  .map((s) => ({ ...s, rate: s.leads > 0 ? (s.deals / s.leads) * 100 : 0 }))
  .sort((a, b) => b.rate - a.rate);

/* ========== Chart 全局默认配置 ========== */
const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: "#94A3B8", fontSize: 11 } },
    y: { grid: { color: "#F1F5F9" }, ticks: { color: "#94A3B8", fontSize: 11 } },
  },
};

/* ========== 趋势图表选项卡 ========== */
function TrendCharts() {
  const [tab, setTab] = useState<"sales" | "leads" | "orders">("sales");

  const tabs = [
    { key: "sales", label: "销售额" },
    { key: "leads", label: "客户线索数" },
    { key: "orders", label: "订单数" },
  ] as const;

  const chartDataMap = {
    sales: {
      labels: DAY_LABELS,
      datasets: [
        {
          label: "销售额",
          data: salesTrend,
          borderColor: "#2563EB",
          backgroundColor: "rgba(37, 99, 235, 0.08)",
          fill: true,
          tension: 0.3,
          pointBackgroundColor: "#2563EB",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
        },
      ],
    },
    leads: {
      labels: DAY_LABELS,
      datasets: [
        {
          label: "客户线索数",
          data: leadsTrend,
          borderColor: "#059669",
          backgroundColor: "rgba(5, 150, 105, 0.08)",
          fill: true,
          tension: 0.3,
          pointBackgroundColor: "#059669",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
        },
      ],
    },
    orders: {
      labels: DAY_LABELS,
      datasets: [
        {
          label: "订单数",
          data: ordersTrend,
          borderColor: "#D97706",
          backgroundColor: "rgba(217, 119, 6, 0.08)",
          fill: true,
          tension: 0.3,
          pointBackgroundColor: "#D97706",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
        },
      ],
    },
  };

  const unitMap = { sales: "元", leads: "个", orders: "单" };

  return (
    <div style={CARD}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: 0 }}>业绩趋势</h3>
        <div style={{ display: "flex", gap: 4, background: "#F1F5F9", borderRadius: 8, padding: 2 }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "inherit",
                background: tab === t.key ? "#fff" : "transparent",
                color: tab === t.key ? "#2563EB" : "#64748B",
                boxShadow: tab === t.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ height: 260 }}>
        <Line data={chartDataMap[tab]} options={lineOptions} />
      </div>
      <div style={{ textAlign: "center", fontSize: 11, color: "#94A3B8", marginTop: 8 }}>
        近 15 天{tab === "sales" ? "销售额" : tab === "leads" ? "客户线索数" : "订单数"}趋势（单位：{unitMap[tab]}）
      </div>
    </div>
  );
}

/* ========== 卡头样式 ========== */
function CardHeader({ title }: { title: string }) {
  return <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: 0, marginBottom: 16 }}>{title}</h3>;
}

/* ========== 漏斗图（自定义） ========== */
function FunnelChart() {
  const maxVal = Math.max(...funnelData.map((d) => d.value));

  return (
    <div style={CARD}>
      <CardHeader title="客户转化漏斗" />
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {funnelData.map((item, i) => {
          const pct = Math.round((item.value / maxVal) * 100);
          const colors = ["#2563EB", "#3B82F6", "#60A5FA", "#93C5FD"];
          return (
            <div key={item.label}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: "#1E293B", fontWeight: 600 }}>{item.label}</span>
                <span style={{ color: "#64748B" }}>{item.value}</span>
              </div>
              <div
                style={{
                  height: 28,
                  width: `${pct}%`,
                  background: colors[i],
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 600,
                  transition: "width 0.3s",
                  minWidth: 40,
                }}
              >
                {item.value} 个
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ========== 柱状图封装 ========== */
function BarChartWidget({ title, data, label, color }: { title: string; data: { label: string; value: number }[]; label: string; color: string }) {
  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        label,
        data: data.map((d) => d.value),
        backgroundColor: color,
        borderRadius: 4,
        barThickness: 28,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: "#F1F5F9" }, ticks: { color: "#94A3B8", fontSize: 11 } },
      y: { grid: { display: false }, ticks: { color: "#1E293B", fontSize: 11, font: { weight: 500 } } },
    },
  };

  return (
    <div style={CARD}>
      <CardHeader title={title} />
      <div style={{ height: data.length > 6 ? 300 : 220 }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

/* ========== 饼图封装 ========== */
function PieChartWidget({ title, data }: { title: string; data: { label: string; value: number }[] }) {
  const colors = ["#2563EB", "#059669", "#D97706", "#DC2626", "#7C3AED", "#0891B2", "#F59E0B", "#EC4899"];

  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        data: data.map((d) => d.value),
        backgroundColor: colors.slice(0, data.length),
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: { color: "#1E293B", fontSize: 11, padding: 12, usePointStyle: true, boxWidth: 8 },
      },
    },
  };

  return (
    <div style={CARD}>
      <CardHeader title={title} />
      <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
}

/* ========== 双条形排行榜 ========== */
function SalesRanking() {
  const [rankingTab, setRankingTab] = useState<"sales" | "rate">("sales");

  const displayData = rankingTab === "sales" ? salesSorted : conversionSorted;

  return (
    <div style={CARD}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: 0 }}>销售人员业绩排行榜</h3>
        <div style={{ display: "flex", gap: 4, background: "#F1F5F9", borderRadius: 8, padding: 2 }}>
          <button
            onClick={() => setRankingTab("sales")}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "inherit",
              background: rankingTab === "sales" ? "#fff" : "transparent",
              color: rankingTab === "sales" ? "#2563EB" : "#64748B",
              boxShadow: rankingTab === "sales" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            销售额 Top10
          </button>
          <button
            onClick={() => setRankingTab("rate")}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "inherit",
              background: rankingTab === "rate" ? "#fff" : "transparent",
              color: rankingTab === "rate" ? "#2563EB" : "#64748B",
              boxShadow: rankingTab === "rate" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            转化率 Top10
          </button>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {displayData.map((item, i) => {
          const maxVal = Math.max(...displayData.map((d) => rankingTab === "sales" ? d.sales : (d as any).rate));
          const currentVal = rankingTab === "sales" ? item.sales : (item as any).rate;
          const pct = Math.round((currentVal / maxVal) * 100);
          const rankColors = ["#F59E0B", "#94A3B8", "#CD7F32", "#2563EB", "#2563EB", "#3B82F6", "#60A5FA", "#7C3AED", "#8B5CF6", "#A78BFA"];

          return (
            <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 20, fontSize: 12, fontWeight: 700, color: i < 3 ? rankColors[i] : "#94A3B8", textAlign: "center" }}>
                {i + 1}
              </span>
              <span style={{ width: 56, fontSize: 12, fontWeight: 600, color: "#1E293B", flexShrink: 0 }}>{item.name}</span>
              <div style={{ flex: 1, height: 22, background: "#F1F5F9", borderRadius: 6, overflow: "hidden", position: "relative" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${rankColors[i]}, ${rankColors[i]}88)`,
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: 8,
                    transition: "width 0.3s",
                    minWidth: 40,
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#fff", whiteSpace: "nowrap" }}>
                    {rankingTab === "sales"
                      ? `¥${currentVal.toLocaleString()}`
                      : `${(currentVal as number).toFixed(1)}%`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ========== 主页面 ========== */
export default function Dashboard() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar activeItem="dashboard" />
      <main style={{ flex: 1, minWidth: 0, padding: "28px 32px", overflowY: "auto", height: "100vh" }}>
        {/* 页面标题 */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.02em", margin: 0 }}>数据仪表盘</h1>
          <p style={{ fontSize: 13, color: "#64748B", marginTop: 4, margin: 0 }}>查看业务核心指标和数据分析</p>
        </div>

        {/* ====== 顶部核心数据卡片 ====== */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
          {/* 本月销售额 */}
          <div style={{ ...CARD, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563EB", flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}>本月销售额</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", marginTop: 2 }}>¥85,600</div>
              <div style={{ fontSize: 11, color: "#059669", fontWeight: 600, marginTop: 2 }}>↑ 12.5% 较上月</div>
            </div>
          </div>

          {/* 本月客户线索数 */}
          <div style={{ ...CARD, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669", flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}>本月客户线索数</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", marginTop: 2 }}>128</div>
              <div style={{ fontSize: 11, color: "#059669", fontWeight: 600, marginTop: 2 }}>↑ 8.3% 较上月</div>
            </div>
          </div>

          {/* 本月订单数 */}
          <div style={{ ...CARD, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "#FFF7ED", display: "flex", alignItems: "center", justifyContent: "center", color: "#D97706", flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}>本月订单数</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", marginTop: 2 }}>45</div>
              <div style={{ fontSize: 11, color: "#059669", fontWeight: 600, marginTop: 2 }}>↑ 15.4% 较上月</div>
            </div>
          </div>

          {/* 业绩完成情况 */}
          <div style={{ ...CARD, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", color: "#DC2626", flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}>业绩完成情况</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", marginTop: 2 }}>85.6%</div>
              <div style={{ fontSize: 11, color: "#64748B", fontWeight: 500, marginTop: 2 }}>目标 ¥100,000</div>
            </div>
          </div>
        </div>

        {/* ====== 业绩进度条 ====== */}
        <div style={{ ...CARD, marginBottom: 20, padding: "14px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", whiteSpace: "nowrap" }}>本月业绩目标达成</span>
            <div style={{ flex: 1, height: 10, background: "#F1F5F9", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ width: "85.6%", height: "100%", background: "linear-gradient(90deg, #2563EB, #60A5FA)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#2563EB", whiteSpace: "nowrap" }}>¥85,600 / ¥100,000</span>
          </div>
        </div>

        {/* ====== 业绩趋势图 ====== */}
        <div style={{ marginBottom: 20 }}>
          <TrendCharts />
        </div>

        {/* ====== 第二行：线索来源 + 漏斗 + 商品统计 ====== */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
          <BarChartWidget title="线索来源排行榜" data={sourceData} label="线索数" color="#3B82F6" />
          <FunnelChart />
          <PieChartWidget title="售卖商品统计" data={productSales} />
        </div>

        {/* ====== 销售人员业绩排行榜 ====== */}
        <SalesRanking />
      </main>
    </div>
  );
}
