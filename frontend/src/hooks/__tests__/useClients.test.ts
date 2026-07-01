import { renderHook, act } from "@testing-library/react";
import { useClients } from "../useClients";
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({ token: "mocked-token" }),
  API_BASE_URL: "http://localhost:8080/api",
}));

describe("useClients hook", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("1. maps clients with default values when properties are missing", async () => {
    const apiClients = [
      {
        id: 1,
        uuid: "cli-1",
        name: "Carlos Gomez",
        email: "carlos@gomez.com",
        phone: "+56911122233",
      },
    ];

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => apiClients,
    });

    const { result } = renderHook(() => useClients());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.clients.length).toBe(1);
    const c = result.current.clients[0];
    expect(c.status).toBe("Activo");
    expect(c.appointments).toBe(0);
    expect(c.lastAppointment).toBe("N/A");
  });

  it("2. sends POST request when adding a client", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    const { result } = renderHook(() => useClients());

    await act(async () => {
      await result.current.addClient({
        name: "Carlos Gomez",
        email: "carlos@gomez.com",
        phone: "+56911122233",
        status: "Activo",
      });
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/clients"),
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('"email":"carlos@gomez.com"'),
      })
    );
  });

  it("3. sends DELETE request when deleting a client", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    const { result } = renderHook(() => useClients());

    await act(async () => {
      await result.current.deleteClient(5);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/clients/5"),
      expect.objectContaining({
        method: "DELETE",
      })
    );
  });
});
