import fs from "fs";
import path from "path";
import type { Lead } from "@/types/lead";

const DATA_PATH = path.join(process.cwd(), "data", "leads.json");

/** 读取所有线索 */
export function readLeads(): Lead[] {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/** 写入所有线索 */
export function writeLeads(leads: Lead[]): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(leads, null, 2), "utf-8");
}

/** 根据 ID 查找线索 */
export function findLead(id: string): Lead | undefined {
  return readLeads().find((l) => l.id === id);
}

/** 更新线索 */
export function updateLead(id: string, updates: Partial<Lead>): Lead | null {
  const leads = readLeads();
  const index = leads.findIndex((l) => l.id === id);
  if (index === -1) return null;
  leads[index] = { ...leads[index], ...updates };
  writeLeads(leads);
  return leads[index];
}

/** 删除线索 */
export function deleteLead(id: string): boolean {
  const leads = readLeads();
  const index = leads.findIndex((l) => l.id === id);
  if (index === -1) return false;
  leads.splice(index, 1);
  writeLeads(leads);
  return true;
}

/** 生成新线索 ID */
export function generateLeadId(leads: Lead[]): string {
  const maxNum = leads.reduce((max, l) => {
    const num = parseInt(l.id.replace("LD-2026-", ""), 10);
    return num > max ? num : max;
  }, 0);
  const next = String(maxNum + 1).padStart(4, "0");
  return `LD-2026-${next}`;
}
