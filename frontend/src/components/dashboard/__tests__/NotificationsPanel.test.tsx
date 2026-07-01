import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import NotificationsPanel from "../NotificationsPanel";
import { vi, describe, it, expect } from "vitest";

const mockShowToast = vi.fn();
vi.mock("../../../contexts/ToastContext", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

vi.mock("../../../hooks/useAppointments", () => ({
  useAppointments: () => ({
    events: [
      { id: "1", clientName: "Juan", date: "2026-07-01", time: "10:00", status: "CONFIRMED" },
    ],
  }),
}));

vi.mock("../../../hooks/useClients", () => ({
  useClients: () => ({
    clients: [{ id: 1, name: "Juan" }],
  }),
}));

describe("NotificationsPanel Component", () => {
  it("1. renders null when isOpen is false", () => {
    const { container } = render(
      <NotificationsPanel isOpen={false} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("2. allows marking all notifications as read", () => {
    const mockOnClose = vi.fn();
    render(<NotificationsPanel isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText("Notificaciones")).toBeInTheDocument();
    
    const markAllBtn = screen.getByRole("button", { name: /marcar todas como leídas/i });
    expect(markAllBtn).toBeEnabled();

    fireEvent.click(markAllBtn);

    expect(mockShowToast).toHaveBeenCalledWith("Notificaciones marcadas como leídas", "success");
  });
});
