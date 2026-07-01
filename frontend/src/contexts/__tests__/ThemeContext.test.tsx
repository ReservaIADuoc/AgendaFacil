import React from "react";
import { render, screen, act } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../ThemeContext";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

const TestComponent = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme} data-testid="btn-toggle">Toggle Theme</button>
    </div>
  );
};

describe("ThemeContext", () => {
  beforeEach(() => {
    localStorage.clear();
    
    vi.spyOn(document.documentElement.classList, "add").mockImplementation(() => {});
    vi.spyOn(document.documentElement.classList, "remove").mockImplementation(() => {});

    vi.stubGlobal("matchMedia", vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    })));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("1. throws error outside ThemeProvider", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow("useTheme must be used within a ThemeProvider");
    consoleSpy.mockRestore();
  });

  it("2. toggles theme between light and dark", async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleBtn = screen.getByTestId("btn-toggle");
    const themeSpan = screen.getByTestId("theme");

    expect(themeSpan.textContent).toBe("light");
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith("dark");

    await act(async () => {
      toggleBtn.click();
    });

    expect(themeSpan.textContent).toBe("dark");
    expect(document.documentElement.classList.add).toHaveBeenCalledWith("dark");
  });

  it("3. persists selected theme to localStorage", async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await act(async () => {
      screen.getByTestId("btn-toggle").click();
    });

    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("4. reads initial theme from localStorage or system preference", () => {
    localStorage.setItem("theme", "dark");
    
    const { unmount } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByTestId("theme").textContent).toBe("dark");
    unmount();

    localStorage.clear();
    vi.stubGlobal("matchMedia", vi.fn().mockImplementation((query) => ({
      matches: query.includes("dark"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    })));

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByTestId("theme").textContent).toBe("dark");
  });
});
