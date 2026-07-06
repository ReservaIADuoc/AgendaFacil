import React from "react";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { ToastProvider, useToast } from "../ToastContext";
import { vi, describe, it, expect } from "vitest";

const TestComponent = () => {
  const { showToast } = useToast();
  return (
    <button onClick={() => showToast("Success message", "success")} data-testid="btn-toast">
      Show Toast
    </button>
  );
};

describe("ToastContext", () => {
  it("1. throws error outside ToastProvider", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow("useToast must be used within a ToastProvider");
    consoleSpy.mockRestore();
  });

  it("2. adds toast to the DOM on showToast call", () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByTestId("btn-toast"));
    expect(screen.getByText("Success message")).toBeInTheDocument();
  });

  it("3. auto-removes toast after 3 seconds", () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByTestId("btn-toast"));
    expect(screen.getByText("Success message")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByText("Success message")).not.toBeInTheDocument();
    vi.useRealTimers();
  });
});
