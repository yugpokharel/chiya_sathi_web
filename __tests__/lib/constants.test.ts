import {
  CATEGORIES,
  CATEGORY_ICONS,
  CATEGORY_DETAILS,
  STATUS_COLORS,
  STATUS_BG,
  STATUS_TEXT,
  imageUrl,
  generateBillKey,
  API_BASE,
  BACKEND_ORIGIN,
  SERVER_API_BASE,
} from "@/lib/constants";

describe("CATEGORIES", () => {
  it("contains exactly four items", () => {
    expect(CATEGORIES).toHaveLength(4);
  });

  it("includes Tea, Coffee, Cigarette, Snacks", () => {
    expect([...CATEGORIES]).toEqual(["Tea", "Coffee", "Cigarette", "Snacks"]);
  });
});

describe("CATEGORY_ICONS", () => {
  it("maps every category to a string icon", () => {
    for (const cat of CATEGORIES) {
      expect(typeof CATEGORY_ICONS[cat]).toBe("string");
    }
  });
});

describe("CATEGORY_DETAILS", () => {
  it("has one entry per category", () => {
    expect(CATEGORY_DETAILS).toHaveLength(CATEGORIES.length);
  });

  it("each entry has name, icon, and color", () => {
    for (const d of CATEGORY_DETAILS) {
      expect(d).toHaveProperty("name");
      expect(d).toHaveProperty("icon");
      expect(d).toHaveProperty("color");
    }
  });
});

describe("STATUS_COLORS / STATUS_BG / STATUS_TEXT", () => {
  const statuses = ["pending", "preparing", "ready", "served", "cancelled"] as const;

  it("STATUS_COLORS has all order statuses", () => {
    for (const s of statuses) expect(STATUS_COLORS[s]).toBeDefined();
  });

  it("STATUS_BG has all order statuses", () => {
    for (const s of statuses) expect(STATUS_BG[s]).toBeDefined();
  });

  it("STATUS_TEXT has all order statuses", () => {
    for (const s of statuses) expect(STATUS_TEXT[s]).toBeDefined();
  });
});

describe("default URLs", () => {
  it("API_BASE is set", () => {
    expect(typeof API_BASE).toBe("string");
    expect(API_BASE.length).toBeGreaterThan(0);
  });
  it("BACKEND_ORIGIN is set", () => {
    expect(typeof BACKEND_ORIGIN).toBe("string");
  });
  it("SERVER_API_BASE is set", () => {
    expect(typeof SERVER_API_BASE).toBe("string");
  });
});

// ─── imageUrl ────────────────────────────────────────────────

describe("imageUrl", () => {
  it("returns null for null input", () => {
    expect(imageUrl(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(imageUrl(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(imageUrl("")).toBeNull();
  });

  it("returns the URL as-is when it starts with http", () => {
    const url = "https://example.com/pic.jpg";
    expect(imageUrl(url)).toBe(url);
  });

  it("returns http URLs as-is", () => {
    const url = "http://example.com/pic.jpg";
    expect(imageUrl(url)).toBe(url);
  });

  it("prepends BACKEND_ORIGIN for relative paths", () => {
    const result = imageUrl("/uploads/pic.jpg");
    expect(result).toBe(`${BACKEND_ORIGIN}/uploads/pic.jpg`);
  });

  it("prepends BACKEND_ORIGIN for paths without leading slash", () => {
    const result = imageUrl("uploads/pic.jpg");
    expect(result).toBe(`${BACKEND_ORIGIN}uploads/pic.jpg`);
  });
});

// ─── generateBillKey ─────────────────────────────────────────

describe("generateBillKey", () => {
  it("starts with CS- prefix", () => {
    const key = generateBillKey("abc123");
    expect(key).toMatch(/^CS-/);
  });

  it("is exactly 9 characters (CS- + 6 chars)", () => {
    const key = generateBillKey("order-id-xyz");
    expect(key).toHaveLength(9);
  });

  it("contains only allowed characters after prefix", () => {
    const key = generateBillKey("test-id");
    const code = key.slice(3);
    // no 0, O, 1, I
    expect(code).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/);
  });

  it("is deterministic (same input → same output)", () => {
    const key1 = generateBillKey("674f1a2b3c4d5e6f");
    const key2 = generateBillKey("674f1a2b3c4d5e6f");
    expect(key1).toBe(key2);
  });

  it("produces different keys for different IDs", () => {
    const key1 = generateBillKey("order-aaa");
    const key2 = generateBillKey("order-bbb");
    expect(key1).not.toBe(key2);
  });

  it("handles long order IDs", () => {
    const key = generateBillKey("674f1a2b3c4d5e6f7a8b9c0d");
    expect(key).toHaveLength(9);
    expect(key).toMatch(/^CS-[A-Z2-9]{6}$/);
  });

  it("handles short order IDs", () => {
    const key = generateBillKey("a");
    expect(key).toHaveLength(9);
    expect(key).toMatch(/^CS-/);
  });
});
