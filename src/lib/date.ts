/** 日期工具 */

/** 本地时区的今天（YYYY-MM-DD）。避免 toISOString() 的 UTC 时区偏移问题（凌晨打开会错成昨天）。 */
export function localToday(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** 列表页默认时间筛选：2026-06-01 ~ 今天 */
export function defaultDateRange(): { startDate: string; endDate: string } {
  return { startDate: "2026-06-01", endDate: localToday() };
}
