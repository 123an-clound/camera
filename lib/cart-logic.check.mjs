// Regression checks for cart submission rules. Run: node lib/cart-logic.check.mjs
import assert from "node:assert/strict";
import { currentUnitPrice, groupForSubmit, lineIssue, lineTotal } from "./cart-logic.ts";

const sale = (id, qty = 1) => ({ id: `sale:${id}`, productId: id, type: "sale", unitPrice: 100, quantity: qty });
const rent = (id, s, e) => ({ id: `rent:${id}`, productId: id, type: "rent", unitPrice: 10, quantity: 1, rentStart: s, rentEnd: e });

// Bug fixed: rentals with different dates used to be merged under the first item's dates.
const groups = groupForSubmit([sale("a"), rent("b", "2026-10-01", "2026-10-03"), rent("c", "2026-10-05", "2026-10-06"), rent("d", "2026-10-01", "2026-10-03"), sale("e")]);
assert.equal(groups.length, 3);
assert.deepEqual(groups.map((g) => g.lines.map((l) => l.productId)), [["a", "e"], ["b", "d"], ["c"]]);
assert.deepEqual(groups.map((g) => [g.rentStart, g.rentEnd]), [[undefined, undefined], ["2026-10-01", "2026-10-03"], ["2026-10-05", "2026-10-06"]]);

// Totals derive rental days from the dates, not a stored day count.
assert.equal(lineTotal(rent("b", "2026-10-01", "2026-10-04")), 30);
assert.equal(lineTotal(sale("a", 3)), 300);

// Issues against the product's current state.
const today = "2026-10-01";
const p = { id: "a", salePrice: 100, rentPriceDay: 10, stock: 2, canSale: true, canRent: true };
assert.equal(lineIssue(sale("a", 2), p, today), null);
assert.match(lineIssue(sale("a", 3), p, today), /Chỉ còn 2/);
assert.match(lineIssue(sale("a"), { ...p, stock: 0 }, today), /hết hàng/);
assert.match(lineIssue(sale("a"), undefined, today), /ngừng kinh doanh/);
assert.match(lineIssue(sale("a"), { ...p, canSale: false }, today), /không bán/);
assert.equal(lineIssue(rent("a", "2026-10-01", "2026-10-02"), p, today), null);
assert.match(lineIssue(rent("a", "2026-09-20", "2026-09-22"), p, today), /đã qua/);
assert.match(lineIssue(rent("a", "2026-10-01", "2026-10-02"), { ...p, canRent: false }, today), /không cho thuê/);

// Price refresh.
assert.equal(currentUnitPrice(sale("a"), { ...p, salePrice: 120 }), 120);
assert.equal(currentUnitPrice(rent("a", today, today), p), 10);
assert.equal(currentUnitPrice(sale("a"), undefined), null);

console.log("cart-logic ok");
