import fs from "fs";
import path from "path";
import type { Account } from "@/types/account";

const DATA_PATH = path.join(process.cwd(), "data", "accounts.json");

/** 读取所有账号 */
export function readAccounts(): Account[] {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/** 写入所有账号 */
export function writeAccounts(accounts: Account[]): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(accounts, null, 2), "utf-8");
}

/** 根据 ID 查找账号 */
export function findAccount(id: string): Account | undefined {
  return readAccounts().find((a) => a.id === id);
}

/** 更新账号 */
export function updateAccount(id: string, updates: Partial<Account>): Account | null {
  const accounts = readAccounts();
  const index = accounts.findIndex((a) => a.id === id);
  if (index === -1) return null;
  accounts[index] = { ...accounts[index], ...updates };
  writeAccounts(accounts);
  return accounts[index];
}

/** 删除账号 */
export function deleteAccount(id: string): boolean {
  const accounts = readAccounts();
  const index = accounts.findIndex((a) => a.id === id);
  if (index === -1) return false;
  accounts.splice(index, 1);
  writeAccounts(accounts);
  return true;
}

/** 生成新账号 ID */
export function generateAccountId(accounts: Account[]): string {
  const maxNum = accounts.reduce((max, a) => {
    const num = parseInt(a.id.replace("ACCT-2026-", ""), 10);
    return num > max ? num : max;
  }, 0);
  const next = String(maxNum + 1).padStart(4, "0");
  return `ACCT-2026-${next}`;
}
