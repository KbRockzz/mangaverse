import { describe, it, expect } from "vitest";
import { formatDate, formatNumber, slugify, truncate, cn, getInitials } from "@/utils/helpers";

describe("formatDate", () => {
  it("formats a valid date string", () => {
    const result = formatDate("2024-01-15");
    expect(result).toContain("2024");
    expect(result).toContain("Jan");
  });
  it("formats a Date object", () => {
    const result = formatDate(new Date("2024-06-01"));
    expect(result).toContain("Jun");
  });
});

describe("formatNumber", () => {
  it("formats millions", () => expect(formatNumber(1500000)).toBe("1.5M"));
  it("formats thousands", () => expect(formatNumber(2500)).toBe("2.5K"));
  it("formats small numbers", () => expect(formatNumber(500)).toBe("500"));
});

describe("slugify", () => {
  it("converts to lowercase with hyphens", () => {
    expect(slugify("One Piece")).toBe("one-piece");
  });
  it("removes special characters", () => {
    expect(slugify("Hello World!")).toBe("hello-world");
  });
});

describe("truncate", () => {
  it("truncates long text", () => {
    expect(truncate("Hello World", 5)).toBe("Hello...");
  });
  it("returns original if short", () => {
    expect(truncate("Hi", 10)).toBe("Hi");
  });
});

describe("cn", () => {
  it("joins classes", () => expect(cn("a", "b", "c")).toBe("a b c"));
  it("filters falsy values", () => expect(cn("a", false, null, "b")).toBe("a b"));
});

describe("getInitials", () => {
  it("gets first letters", () => expect(getInitials("John Doe")).toBe("JD"));
  it("handles single name", () => expect(getInitials("Alice")).toBe("AL"));
});
