import { renderHook, act } from "@testing-library/react";
import { useAppointments } from "../useAppointments";
import { vi, describe, it, expect, beforeEach } from "vitest";

let mockToken: string | null = "mocked-token";

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({ token: mockToken }),
  API_BASE_URL: "http://localhost:8080/api",
}));

describe("useAppointments hook", () => {
  beforeEach(() => {
    mockToken = "mocked-token";
    vi.stubGlobal("fetch", vi.fn());
  });

  it("1. returns empty events and stops loading if no token is present", async () => {
    mockToken = null;
    const { result } = renderHook(() => useAppointments());
    expect(result.current.events).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("2. fetches and maps appointments with proper dates and duration formatting", async () => {
    const mockAppointments = [
      {
        id: "appt-1",
        clientName: "Maria Garcia",
        clientId: "client-1",
        serviceName: "Terapia Individual",
        serviceId: "service-1",
        colorHex: "#FF0000",
        startAt: "2026-07-01T10:00:00Z",
        endAt: "2026-07-01T11:30:00Z",
        status: "CONFIRMED",
      },
    ];

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockAppointments,
    });

    const { result } = renderHook(() => useAppointments());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.events.length).toBe(1);
    const event = result.current.events[0];
    expect(event.clientName).toBe("Maria Garcia");
    expect(event.duration).toBe(1.5);
    expect(event.date).toBe("2026-07-01");
    expect(event.time).toBe("10:00");
  });

  it("3. sends POST request to add an appointment", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    const { result } = renderHook(() => useAppointments());

    await act(async () => {
      await result.current.addAppointment({
        clientName: "Juan",
        clientId: "client-id",
        service: "Terapia",
        serviceId: "service-id",
        serviceColor: "#FFF",
        date: "2026-07-01",
        time: "12:00",
        duration: 1,
      });
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/appointments"),
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('"clientId":"client-id"'),
      })
    );
  });

  it("4. sends PUT request to update appointment", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "appt-1",
          startAt: "2026-07-01T10:00:00Z",
          endAt: "2026-07-01T11:00:00Z",
        }
      ],
    });

    const { result } = renderHook(() => useAppointments());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.updateAppointment("appt-1", {
        time: "11:00",
      });
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/appointments/appt-1"),
      expect.objectContaining({
        method: "PUT",
        body: expect.stringContaining("11:00"),
      })
    );
  });

  it("5. sends DELETE request to remove appointment", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    const { result } = renderHook(() => useAppointments());

    await act(async () => {
      await result.current.deleteAppointment("appt-1");
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/appointments/appt-1"),
      expect.objectContaining({
        method: "DELETE",
      })
    );
  });
});
