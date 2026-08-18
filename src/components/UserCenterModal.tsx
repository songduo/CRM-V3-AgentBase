"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Modal from "./Modal";

/* ========== 样式常量 ========== */
const INPUT_STYLE: React.CSSProperties = {
  padding: "9px 12px",
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

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

/* ========== 主组件 ========== */
interface UserCenterModalProps {
  open: boolean;
  onClose: () => void;
}

export default function UserCenterModal({ open, onClose }: UserCenterModalProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  // ---- 弹窗层级 ----
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // ---- 修改密码表单 ----
  const [pwdForm, setPwdForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");
  const [pwdSubmitting, setPwdSubmitting] = useState(false);

  // ---- 修改密码 ----
  const handleChangePassword = async () => {
    setPwdError("");
    setPwdSuccess("");

    if (!pwdForm.oldPassword || !pwdForm.newPassword || !pwdForm.confirmPassword) {
      setPwdError("请填写完整信息");
      return;
    }
    if (pwdForm.newPassword.length < 6) {
      setPwdError("新密码长度不能少于6位");
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdError("两次输入的新密码不一致");
      return;
    }

    setPwdSubmitting(true);
    try {
      const res = await fetch(`/api/accounts/${user!.id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword: pwdForm.oldPassword, newPassword: pwdForm.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwdError(data.error || "修改失败");
      } else {
        setPwdSuccess("密码修改成功");
        setPwdForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch {
      setPwdError("网络错误，请稍后重试");
    } finally {
      setPwdSubmitting(false);
    }
  };

  // ---- 退出登录 ----
  const handleLogout = () => {
    logout();
    onClose();
    router.push("/login");
  };

  if (!user) return null;

  // 主弹窗
  if (!showChangePwd && !showLogoutConfirm) {
    return (
      <Modal open={open} onClose={onClose} title="用户中心" width="420px">
        <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
          {/* 头像 */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              background: "linear-gradient(135deg, #2563EB, #60A5FA)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
              fontSize: 28,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {user.name[0]}
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#0F172A" }}>{user.name}</div>
          <div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>{user.roleName}</div>
        </div>

        <div
          style={{
            background: "#F8FAFC",
            borderRadius: 10,
            border: "1px solid #E2E8F0",
            padding: "14px 16px",
            marginBottom: 20,
          }}
        >
          <DetailRow label="手机号" value={user.phone} />
          <DetailRow label="账号 ID" value={user.id} />
          <DetailRow label="创建时间" value={user.createdAt} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={() => { setShowChangePwd(true); setPwdError(""); setPwdSuccess(""); setPwdForm({ oldPassword: "", newPassword: "", confirmPassword: "" }); }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "10px 20px",
              borderRadius: 10,
              fontWeight: 600,
              fontSize: "13.5px",
              border: "1px solid #E2E8F0",
              background: "#fff",
              color: "#1E293B",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#2563EB"; (e.currentTarget as HTMLElement).style.color = "#2563EB"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0"; (e.currentTarget as HTMLElement).style.color = "#1E293B"; }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            修改密码
          </button>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "10px 20px",
              borderRadius: 10,
              fontWeight: 600,
              fontSize: "13.5px",
              border: "none",
              background: "#FEF2F2",
              color: "#DC2626",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#FEE2E2"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#FEF2F2"; }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            退出登录
          </button>
        </div>
      </Modal>
    );
  }

  // 修改密码弹窗
  if (showChangePwd) {
    return (
      <Modal open={open} onClose={onClose} title="修改密码" width="420px">
        <div>
          <FormField label="原密码">
            <input
              type="password"
              value={pwdForm.oldPassword}
              onChange={(e) => setPwdForm((f) => ({ ...f, oldPassword: e.target.value }))}
              style={INPUT_STYLE}
              placeholder="请输入原密码"
            />
          </FormField>
          <FormField label="新密码">
            <input
              type="password"
              value={pwdForm.newPassword}
              onChange={(e) => setPwdForm((f) => ({ ...f, newPassword: e.target.value }))}
              style={INPUT_STYLE}
              placeholder="请输入新密码（至少6位）"
            />
          </FormField>
          <FormField label="确认新密码">
            <input
              type="password"
              value={pwdForm.confirmPassword}
              onChange={(e) => setPwdForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              style={INPUT_STYLE}
              placeholder="请再次输入新密码"
            />
          </FormField>

          {pwdError && (
            <div style={{ padding: "8px 12px", background: "#FEF2F2", borderRadius: 8, border: "1px solid #FECACA", fontSize: 13, color: "#B91C1C", marginBottom: 12 }}>
              {pwdError}
            </div>
          )}
          {pwdSuccess && (
            <div style={{ padding: "8px 12px", background: "#F0FDF4", borderRadius: 8, border: "1px solid #BBF7D0", fontSize: 13, color: "#15803D", marginBottom: 12 }}>
              {pwdSuccess}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button
              onClick={() => setShowChangePwd(false)}
              style={{ flex: 1, padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: "13.5px", border: "1px solid #E2E8F0", background: "#fff", color: "#1E293B", cursor: "pointer", fontFamily: "inherit" }}
            >
              返回
            </button>
            <button
              onClick={handleChangePassword}
              disabled={pwdSubmitting}
              style={{
                flex: 1,
                padding: "10px 20px",
                borderRadius: 10,
                fontWeight: 600,
                fontSize: "13.5px",
                border: "none",
                background: pwdSubmitting ? "#93C5FD" : "#2563EB",
                color: "#fff",
                cursor: pwdSubmitting ? "not-allowed" : "pointer",
                fontFamily: "inherit",
              }}
            >
              {pwdSubmitting ? "提交中..." : "确认修改"}
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  // 退出确认弹窗
  return (
    <Modal open={open} onClose={onClose} title="退出登录" width="400px">
      <div style={{ textAlign: "center", padding: "8px 0" }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            background: "#FEF2F2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            color: "#DC2626",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>确认退出登录？</div>
        <div style={{ fontSize: 13, color: "#64748B", marginBottom: 24 }}>退出后需要重新登录才能使用系统</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setShowLogoutConfirm(false)}
            style={{ flex: 1, padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: "13.5px", border: "1px solid #E2E8F0", background: "#fff", color: "#1E293B", cursor: "pointer", fontFamily: "inherit" }}
          >
            取消
          </button>
          <button
            onClick={handleLogout}
            style={{ flex: 1, padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: "13.5px", border: "none", background: "#DC2626", color: "#fff", cursor: "pointer", fontFamily: "inherit" }}
          >
            确认退出
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ========== 详情行 ========== */
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", padding: "8px 0", borderBottom: "1px solid #F1F5F9" }}>
      <div style={{ width: 80, fontSize: 13, color: "#64748B", flexShrink: 0 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#1E293B" }}>{value}</div>
    </div>
  );
}
