import { NextRequest, NextResponse } from "next/server";
import { readAccounts } from "../../accounts/utils";
import { readRoles } from "../../roles/utils";

export async function POST(request: NextRequest) {
  try {
    const { phone, password } = await request.json();

    if (!phone || !password) {
      return NextResponse.json({ error: "请输入手机号和密码" }, { status: 400 });
    }

    const accounts = readAccounts();
    const account = accounts.find((a) => a.phone === phone);

    if (!account || account.password !== password) {
      return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
    }

    // 返回用户信息（隐藏密码）
    const { password: _, ...userInfo } = account;

    // 读取角色权限信息
    const roles = readRoles();
    const role = roles.find((r) => r.id === account.roleId);

    return NextResponse.json({
      user: userInfo,
      role: role ?? null,
      token: Buffer.from(`${account.id}:${Date.now()}`).toString("base64"),
    });
  } catch {
    return NextResponse.json({ error: "请求数据格式错误" }, { status: 400 });
  }
}
