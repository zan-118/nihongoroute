import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "@/store/useAuthStore";

describe("useAuthStore Real Unit Test", () => {
  beforeEach(() => {
    useAuthStore.setState({
      isAuthenticated: false,
    });
  });

  it("harus mempunyai nilai state awal false untuk isAuthenticated", () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
  });

  it("harus memperbarui status autentikasi saat setAuth dipanggil", () => {
    useAuthStore.getState().setAuth(true);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it("harus mereset status autentikasi saat resetAuth dipanggil", () => {
    useAuthStore.getState().setAuth(true);
    useAuthStore.getState().resetAuth();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
