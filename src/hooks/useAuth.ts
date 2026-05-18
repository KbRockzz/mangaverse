"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useCallback } from "react";

export function useAuth() {
  const { data: session, status, update } = useSession();

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      return result;
    },
    []
  );

  const logout = useCallback(async () => {
    await signOut({ redirectTo: "/" });
  }, []);

  return {
    user: session?.user ?? null,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    isAdmin: session?.user?.role === "ADMIN",
    login,
    logout,
    update,
  };
}
