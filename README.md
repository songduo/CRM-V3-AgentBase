# CRM 客户管理平台（纯 CRM 版）

从 CRM Agent 项目剥离出的**无 AI 能力**版本：只保留标准 CRM 业务功能，不含 AI 助手、Agent 管理、AI 文件管理、Skill 管理。

## 功能

- 数据仪表盘（chart.js 图表）
- 线索管理 / 商品管理 / 订单管理
- 账号管理 / 角色与权限（页面权限 + 功能权限 + 数据范围）
- 沟通记录
- 手机号 + 密码登录

## 技术栈

- Next.js 16.2.9（Turbopack）+ React 19.2 + Tailwind 4 + chart.js
- 数据层：JSON 文件存储（`data/*.json`），Next.js API Routes 读写
- **无后端服务**，单进程运行

## 快速启动

```bash
npm install
npm run dev        # http://127.0.0.1:3100
```

默认账号：`13912345678` / 密码 `123123`（见 `data/accounts.json`）

## 目录结构

```
src/app/           页面路由（dashboard/leads/products/orders/accounts/roles/communications/login）
src/app/api/       API 路由（auth/accounts/leads/orders/products/roles/communications）
src/components/    业务组件
src/hooks/         usePermission 权限判断
src/types/         类型定义
data/              JSON 数据文件（业务数据 + 账号 + 角色 + 销售目标）
```

## 数据文件

`accounts.json` / `leads.json` / `products.json` / `orders.json` / `roles.json` / `communications.json` / `sales-targets.json`

与 CRM Agent 版（3000 端口）相互独立，数据互不同步。

## 来源

由 `crm-agent/frontend/` 剥离 Agent 相关能力生成（2026-08-18）。
