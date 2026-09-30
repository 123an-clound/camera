// Regression checks for rental rules. Run: node lib/rental.check.mjs
import assert from "node:assert/strict";
import { rentalDays, todayInShop, validateRentalRange } from "./rental.ts";

// Day counting (the rule shown to customers since launch).
assert.equal(rentalDays("2026-10-01", "2026-10-01"), 1, "same-day return bills 1 day");
assert.equal(rentalDays("2026-09-30", "2026-10-01"), 1, "overnight bills 1 day");
assert.equal(rentalDays("2026-10-01", "2026-10-04"), 3);
assert.equal(rentalDays("2026-12-30", "2027-01-02"), 3, "across year end");
assert.equal(rentalDays("2027-03-27", "2027-03-29"), 2, "no DST drift");

// Shop timezone: 2026-09-30 23:30 UTC is already 1 Oct in Vietnam.
assert.equal(todayInShop(new Date("2026-09-30T23:30:00Z")), "2026-10-01");
assert.equal(todayInShop(new Date("2026-09-30T16:59:00Z")), "2026-09-30");

// Validation.
const today = "2026-10-01";
assert.equal(validateRentalRange("2026-10-01", "2026-10-03", today), null);
assert.match(validateRentalRange(undefined, "2026-10-03", today), /chọn ngày/);
assert.match(validateRentalRange("2026-10-05", "2026-10-03", today), /sau hoặc bằng/);
assert.match(validateRentalRange("2026-09-30", "2026-10-03", today), /đã qua/);
assert.match(validateRentalRange("2026-10-01", "2027-10-05", today), /tối đa/);
assert.match(validateRentalRange("01/10/2026", "2026-10-03", today), /chọn ngày/);

console.log("rental ok");
