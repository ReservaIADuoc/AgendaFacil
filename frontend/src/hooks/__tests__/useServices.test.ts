import { renderHook, act } from "@testing-library/react";
import { useServices } from "../useServices";
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({ token: "mocked-token" }),
  API_BASE_URL: "http://localhost:8080/api",
}));

describe("useServices hook", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("1. maps service data correctly", async () => {
    const apiServices = [
      {
        id: 1,
        uuid: "srv-1",
        name: "Consulta Clinica",
        durationMinutes: 45,
        price: 50000,
        modality: "video",
        active: true,
      },
    ];

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => apiServices,
    });

    const { result } = renderHook(() => useServices());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.services.length).toBe(1);
    const s = result.current.services[0];
    expect(s.id).toBe(1);
    expect(s.uuid).toBe("srv-1");
    expect(s.name).toBe("Consulta Clinica");
    expect(s.duration).toBe("45 min");
    expect(s.price).toBe("$50.000");
    expect(s.type).toBe("video");
    expect(s.status).toBe("active");
  });

  it("2. selects correct icon based on name", async () => {
    const apiServices = [
      { id: 1, name: "Terapia de Pareja", durationMinutes: 60, price: 50000 },
      { id: 2, name: "Evaluación Inicial", durationMinutes: 60, price: 50000 },
      { id: 3, name: "Consulta de Video", durationMinutes: 60, price: 50000 },
    ];

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => apiServices,
    });

    const { result } = renderHook(() => useServices());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.services[0].type).toBe("presencial");
    expect(result.current.services[1].type).toBe("video");
    expect(result.current.services[2].type).toBe("video");
  });

  it("3. performs optimistic update on toggleStatus", async () => {
    const apiServices = [
      {
        id: 10,
        uuid: "srv-10",
        name: "Test Svc",
        durationMinutes: 60,
        price: 20000,
        active: true,
      },
    ];

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => apiServices,
    });

    const { result } = renderHook(() => useServices());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.services[0].status).toBe("active");

    act(() => {
      result.current.toggleStatus(10);
    });

    expect(result.current.services[0].status).toBe("inactive");
  });

  it("4. converts formatted prices back to numbers", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    const { result } = renderHook(() => useServices());

    await act(async () => {
      await result.current.addService({
        name: "Svc New",
        duration: "90 min",
        price: "$85.000",
        type: "video",
      });
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/services"),
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('"price":85000'),
      })
    );
  });
});
