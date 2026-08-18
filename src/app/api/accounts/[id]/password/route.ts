import { NextRequest, NextResponse } from "next/server";
import { findAccount, updateAccount } from "../../utils";

type Params = Promise<{ id: string }>;

/**
 * PUT /api/accounts/[id]/password - 修改密码
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  const { id } = await params;

  try {
    const { oldPassword, newPassword } = await request.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: "请填写完整的密码信息" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "新密码长度不能少于6位" }, { status: 400 });
    }

    const account = findAccount(id);
    if (!account) {
      return NextResponse.json({ error: "账号不存在" }, { status: 404 });
    }

    if (account.password !== oldPassword) {
      return NextResponse.json({ error: "原密码错误" }, { status: 400 });
    }

    const updated = updateAccount(id, { password: newPassword });
    if (!updated) {
      return NextResponse.json({ error: "修改失败" }, { status: 500 });
    }

    return NextResponse.json({ message: "密码修改成功" });
  } catch {
    return NextResponse.json({ error: "请求数据格式错误" }, { status: 400 });
  }
}
