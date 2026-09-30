// Rental rules shared by the product page, cart, admin and tests. The database function
// create_camera_order_v2 applies the same rules server-side (see supabase/migrations).
// Pure module: self-check with `node lib/rental.check.mjs`.

export const SHOP_TIMEZONE = "Asia/Ho_Chi_Minh";
export const MAX_RENT_DAYS = 365;
const DAY_MS = 86_400_000;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// Today's date (YYYY-MM-DD) in the shop's timezone — not UTC, which is still "yesterday"
// before 07:00 in Vietnam.
export function todayInShop(now: Date = new Date()): string {
  return now.toLocaleDateString("sv-SE", { timeZone: SHOP_TIMEZONE });
}

function toUtcDay(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

// Billed rental days from `start` to `end`: the days between them, minimum 1
// (same-day return = 1 day, 30/9 → 1/10 = 1 day). This is the rule customers have been shown.
export function rentalDays(start: string, end: string): number {
  return Math.max(1, Math.round((toUtcDay(end) - toUtcDay(start)) / DAY_MS));
}

// Returns a Vietnamese error message, or null when the range is bookable.
export function validateRentalRange(start: string | undefined, end: string | undefined, today = todayInShop()): string | null {
  if (!start || !end || !ISO_DATE.test(start) || !ISO_DATE.test(end)) return "Vui lòng chọn ngày nhận và ngày trả máy.";
  if (Number.isNaN(toUtcDay(start)) || Number.isNaN(toUtcDay(end))) return "Ngày thuê không hợp lệ.";
  if (end < start) return "Ngày trả phải sau hoặc bằng ngày nhận.";
  if (start < today) return "Ngày nhận máy đã qua, vui lòng chọn lại.";
  if (rentalDays(start, end) > MAX_RENT_DAYS) return `Thời gian thuê tối đa ${MAX_RENT_DAYS} ngày.`;
  return null;
}
