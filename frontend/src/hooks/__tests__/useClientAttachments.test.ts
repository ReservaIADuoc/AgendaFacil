import { renderHook } from "@testing-library/react";
import { useClientAttachments } from "../useClientAttachments";
import { vi, describe, it, expect } from "vitest";

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({ token: "mocked-token" }),
  API_BASE_URL: "http://localhost:8080/api",
}));

describe("useClientAttachments hook", () => {
  it("1. formats size under 1024 bytes correctly as B", () => {
    const { result } = renderHook(() => useClientAttachments("some-client-uuid"));
    expect(result.current.formatSize(500)).toBe("500 B");
  });

  it("2. formats size under 1 MB correctly as KB", () => {
    const { result } = renderHook(() => useClientAttachments("some-client-uuid"));
    expect(result.current.formatSize(1024 * 1.5)).toBe("1.5 KB");
  });

  it("3. formats size above 1 MB correctly as MB", () => {
    const { result } = renderHook(() => useClientAttachments("some-client-uuid"));
    expect(result.current.formatSize(1024 * 1024 * 2.34)).toBe("2.3 MB");
  });
});
