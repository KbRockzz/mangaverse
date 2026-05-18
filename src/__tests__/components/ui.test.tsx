import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Pagination, EmptyState } from "@/components/ui";

describe("Pagination", () => {
  it("renders prev/next buttons", () => {
    render(<Pagination currentPage={2} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByText("Prev")).toBeTruthy();
    expect(screen.getByText("Next")).toBeTruthy();
  });

  it("calls onPageChange with correct page", () => {
    const handler = vi.fn();
    render(<Pagination currentPage={1} totalPages={5} onPageChange={handler} />);
    fireEvent.click(screen.getByText("Next"));
    expect(handler).toHaveBeenCalledWith(2);
  });

  it("disables prev on first page", () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByText("Prev")).toBeDisabled();
  });

  it("disables next on last page", () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByText("Next")).toBeDisabled();
  });

  it("returns null for single page", () => {
    const { container } = render(<Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />);
    expect(container.firstChild).toBeNull();
  });
});

describe("EmptyState", () => {
  it("renders title and message", () => {
    render(<EmptyState title="No items" message="Nothing here." />);
    expect(screen.getByText("No items")).toBeTruthy();
    expect(screen.getByText("Nothing here.")).toBeTruthy();
  });
});
