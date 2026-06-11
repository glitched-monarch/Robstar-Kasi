// ─── ROBSTAR KASI — Utility Helpers ─────────────────────────────

/** Format a number as KES currency */
export const fmt = n => `KES ${Number(n).toLocaleString("en-KE")}`;

/** Generate a short random ID */
export const uid = () => Math.random().toString(36).slice(2, 10);