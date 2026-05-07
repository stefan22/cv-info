import { afterEach, describe, expect, it, vi } from "vitest";

import { cn, formatSize, generateUUID } from "~/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("resolves tailwind conflicts via tailwind-merge", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});

describe("formatSize", () => {
  it("formats zero bytes", () => {
    expect(formatSize(0)).toBe("0 Bytes");
  });

  it("formats kilobytes", () => {
    expect(formatSize(2048)).toBe("2 KB");
  });
});

describe("generateUUID", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns a UUID-like string", () => {
    const id = generateUUID();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });
});
