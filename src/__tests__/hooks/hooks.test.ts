import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagination } from "@/hooks/usePagination";

describe("useDebounce", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello", 300));
    expect(result.current).toBe("hello");
  });

  it("debounces updates", () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), {
      initialProps: { v: "hello" },
    });
    rerender({ v: "world" });
    expect(result.current).toBe("hello");
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe("world");
  });
});

describe("usePagination", () => {
  it("initializes correctly", () => {
    const { result } = renderHook(() => usePagination({ totalItems: 100, itemsPerPage: 10 }));
    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(10);
    expect(result.current.offset).toBe(0);
  });

  it("navigates pages", () => {
    const { result } = renderHook(() => usePagination({ totalItems: 100, itemsPerPage: 10 }));
    act(() => { result.current.nextPage(); });
    expect(result.current.currentPage).toBe(2);
    expect(result.current.offset).toBe(10);
  });

  it("does not exceed totalPages", () => {
    const { result } = renderHook(() => usePagination({ totalItems: 10, itemsPerPage: 10 }));
    act(() => { result.current.nextPage(); });
    expect(result.current.currentPage).toBe(1);
  });

  it("does not go below page 1", () => {
    const { result } = renderHook(() => usePagination({ totalItems: 100, itemsPerPage: 10 }));
    act(() => { result.current.prevPage(); });
    expect(result.current.currentPage).toBe(1);
  });
});
