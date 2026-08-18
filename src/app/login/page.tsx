"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!phone || !password) {
      setError("请输入手机号和密码");
      return;
    }

    setSubmitting(true);
    const err = await login(phone, password);
    setSubmitting(false);

    if (err) {
      setError(err);
    } else {
      router.push("/leads");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F1F5F9",
      }}
    >
      {/* 登录卡片 */}
      <div
        style={{
          width: 400,
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          padding: "40px 36px",
        }}
      >
        {/* Logo 区域 */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "linear-gradient(135deg, #2563EB, #60A5FA)",
              color: "#fff",
              fontSize: 24,
              fontWeight: 800,
              marginBottom: 12,
            }}
          >
            C
          </div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#0F172A",
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            CRM 客户管理平台
          </h1>
          <p style={{ fontSize: 13, color: "#64748B", marginTop: 6, margin: 0 }}>
            请使用手机号和密码登录
          </p>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit}>
          {/* 手机号 */}
          <div style={{ marginBottom: 18 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#1E293B",
                marginBottom: 6,
              }}
            >
              手机号
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                border: "1px solid #E2E8F0",
                borderRadius: 10,
                transition: "border-color 0.15s",
                background: "#fff",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" width="18" height="18" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="请输入手机号"
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  fontSize: 14,
                  fontFamily: "inherit",
                  color: "#1E293B",
                  background: "transparent",
                }}
              />
            </div>
          </div>

          {/* 密码 */}
          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#1E293B",
                marginBottom: 6,
              }}
            >
              密码
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                border: "1px solid #E2E8F0",
                borderRadius: 10,
                transition: "border-color 0.15s",
                background: "#fff",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" width="18" height="18" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  fontSize: 14,
                  fontFamily: "inherit",
                  color: "#1E293B",
                  background: "transparent",
                }}
              />
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                background: "#FEF2F2",
                borderRadius: 8,
                border: "1px solid #FECACA",
                marginBottom: 16,
                fontSize: 13,
                color: "#B91C1C",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {/* 登录按钮 */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              padding: "12px 20px",
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 14,
              border: "none",
              cursor: submitting ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              background: submitting ? "#93C5FD" : "#2563EB",
              color: "#fff",
              transition: "all 0.15s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
            onMouseEnter={(e) => {
              if (!submitting) (e.currentTarget as HTMLElement).style.background = "#1D4ED8";
            }}
            onMouseLeave={(e) => {
              if (!submitting) (e.currentTarget as HTMLElement).style.background = "#2563EB";
            }}
          >
            {submitting ? (
              <>
                <span
                  style={{
                    width: 16,
                    height: 16,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.6s linear infinite",
                  }}
                />
                登录中...
              </>
            ) : (
              "登 录"
            )}
          </button>
        </form>

        {/* 底部提示 */}
        <div
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "#94A3B8",
            marginTop: 20,
            paddingTop: 16,
            borderTop: "1px solid #F1F5F9",
          }}
        >
          默认账号：13912345678 / 密码：123123
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}
