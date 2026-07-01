import { renderHook, act } from "@testing-library/react";
import { useClientNotes } from "../useClientNotes";
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({ token: "mocked-token" }),
  API_BASE_URL: "http://localhost:8080/api",
}));

describe("useClientNotes hook", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("1. fetches client notes using UUID", async () => {
    const mockNotes = [
      {
        id: "note-1",
        clientId: "client-uuid",
        contentMarkdown: "Some notes",
        isAiAssisted: false,
        version: 1,
        createdAt: "2026-07-01T10:00:00Z",
      },
    ];

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockNotes,
    });

    const { result } = renderHook(() => useClientNotes("client-uuid"));

    await act(async () => {
      await result.current.fetchNotes();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/clients/client-uuid/notes"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer mocked-token",
        }),
      })
    );
    expect(result.current.notes).toEqual(mockNotes);
  });
});
