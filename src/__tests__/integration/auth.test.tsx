import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RegisterPage from "@/app/(auth)/register/page";
import LoginPage from "@/app/(auth)/login/page";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/uiStore";

// Mock the hooks
vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/store/uiStore", () => ({
  useUIStore: vi.fn(),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

describe("Authentication Flows (Integration)", () => {
  const mockLogin = vi.fn();
  const mockAddToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({ login: mockLogin });
    (useUIStore as any).mockReturnValue(mockAddToast);
  });

  it("shows validation errors on empty login submit", async () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid email address")).toBeInTheDocument();
      expect(screen.getByText("Password must be at least 6 characters")).toBeInTheDocument();
    });
  });

  it("calls login function on valid submission", async () => {
    mockLogin.mockResolvedValueOnce({ error: null });
    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("admin@mangaverse.com"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("••••••"), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123");
      expect(mockAddToast).toHaveBeenCalledWith("success", "Welcome back!");
    });
  });

  it("shows validation errors on register password mismatch", async () => {
    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText("Your name"), { target: { value: "Test User" } });
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getAllByPlaceholderText("••••••")[0], { target: { value: "password123" } });
    fireEvent.change(screen.getAllByPlaceholderText("••••••")[1], { target: { value: "differentpassword" } });

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
    });
  });
});
