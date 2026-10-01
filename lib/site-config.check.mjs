// Self-check for the site-config schema. Run: node lib/site-config.check.mjs
import assert from "node:assert/strict";
import { DEFAULTS, parseGroup, schemas, validateGroup } from "./site-config-schema.ts";

// Every default must satisfy its own schema.
for (const [group, schema] of Object.entries(schemas)) {
  assert.ok(schema.safeParse(DEFAULTS[group]).success, `default for ${group} is invalid`);
}

// Missing / garbage rows fall back to defaults.
assert.deepEqual(parseGroup("theme", undefined), DEFAULTS.theme);
assert.deepEqual(parseGroup("theme", "nope"), DEFAULTS.theme);
// Partial rows merge over defaults.
assert.equal(parseGroup("theme", { accent: "lilac" }).accent, "lilac");
assert.equal(parseGroup("theme", { accent: "lilac" }).enable_spotlight, true);
// Invalid values are rejected by the strict validator and ignored by the reader.
assert.ok("error" in validateGroup("theme", { ...DEFAULTS.theme, accent: "neon" }));
assert.equal(parseGroup("theme", { accent: "neon" }).accent, "strawberry");

// Link safety: javascript:/protocol-relative/http are rejected; / and https allowed.
const nav = (href) => validateGroup("nav", { links: [{ label: "x", href }] });
assert.ok("error" in nav("javascript:alert(1)"));
assert.ok("error" in nav("//evil.example"));
assert.ok("error" in nav("http://example.com"));
assert.ok("data" in nav("/products"));
assert.ok("data" in nav("https://example.com"));

// Zalo is digits only.
assert.ok("error" in validateGroup("contact", { ...DEFAULTS.contact, zalo: "09a" }));
assert.ok("data" in validateGroup("contact", { ...DEFAULTS.contact, zalo: "0901234567" }));

console.log("site-config ok");
