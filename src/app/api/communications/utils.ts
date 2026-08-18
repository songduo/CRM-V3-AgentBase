import fs from "fs";
import path from "path";
import type { Communication } from "@/types/communication";

const DATA_PATH = path.join(process.cwd(), "data", "communications.json");

/** 读取所有沟通记录 */
export function readCommunications(): Communication[] {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/** 写入所有沟通记录 */
export function writeCommunications(communications: Communication[]): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(communications, null, 2), "utf-8");
}

/** 根据 ID 查找沟通记录 */
export function findCommunication(id: string): Communication | undefined {
  return readCommunications().find((c) => c.id === id);
}

/** 生成新沟通记录 ID */
export function generateCommunicationId(communications: Communication[]): string {
  const maxNum = communications.reduce((max, c) => {
    const num = parseInt(c.id.replace("COMM-2026-", ""), 10);
    return num > max ? num : max;
  }, 0);
  const next = String(maxNum + 1).padStart(4, "0");
  return `COMM-2026-${next}`;
}
