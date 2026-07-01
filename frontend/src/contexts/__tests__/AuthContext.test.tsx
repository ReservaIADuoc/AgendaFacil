import React from "react";
import { render, screen, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../AuthContext";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

const TestComponent = () => {
  const { token, user, isAuthenticated, login, register, logout } = useAuth();
  return (
    <div>
      <span data-testid="token">{token}</span>
      <span data-testid="auth">{isAuthenticated ? "yes" : "no"}</span>
      <span data-testid="user">{user?.name}</span>
      <button onClick={() => login("test@mail.com", "pass")} data-testid="btn-login">Login</button>
      <button onClick={() => register("test@mail.com", "pass", "Name")} data-testid="btn-register">Register</button>
      <button onClick={logout} data-testid="btn-logout">Logout</button>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("1. throws error outside AuthProvider", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow("useAuth debe usarse dentro de un AuthProvider");
    consoleSpy.mockRestore();
  });

  it("2. initializes token from localStorage", async () => {
    localStorage.setItem("token", "dummy-token-123");
    
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1, email: "test@mail.com", name: "Valentina" }),
    });

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    expect(screen.getByTestId("token").textContent).toBe("dummy-token-123");
    expect(screen.getByTestId("auth").textContent).toBe("yes");
  });

  it("3. login sets token in localStorage and state", async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: "login-token" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, email: "test@mail.com", name: "Valentina" }),
      });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByTestId("btn-login").click();
    });

    expect(localStorage.getItem("token")).toBe("login-token");
    expect(screen.getByTestId("token").textContent).toBe("login-token");
    expect(screen.getByTestId("user").textContent).toBe("Valentina");
  });

  it("4. logout removes token and clears state", async () => {
    localStorage.setItem("token", "dummy-token");
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1, email: "test@mail.com", name: "Valentina" }),
    });

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    await act(async () => {
      screen.getByTestId("btn-logout").click();
    });

    expect(localStorage.getItem("token")).toBeNull();
    expect(screen.getByTestId("token").textContent).toBe("");
    expect(screen.getByTestId("auth").textContent).toBe("no");
  });

  it("5. register registers and logs in automatically", async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: "registered-token" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, email: "test@mail.com", name: "Name" }),
      });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByTestId("btn-register").click();
    });

    expect(localStorage.getItem("token")).toBe("registered-token");
    expect(screen.getByTestId("token").textContent).toBe("registered-token");
    expect(screen.getByTestId("user").textContent).toBe("Name");
  });
});
