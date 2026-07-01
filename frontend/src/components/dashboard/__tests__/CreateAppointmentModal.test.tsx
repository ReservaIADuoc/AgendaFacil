import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CreateAppointmentModal from "../CreateAppointmentModal";
import { vi, describe, it, expect } from "vitest";

describe("CreateAppointmentModal Component", () => {
  const mockClients = [
    { uuid: "client-1", name: "Maria Garcia", email: "maria@mail.com" },
  ];
  const mockServices = [
    { uuid: "service-1", name: "Terapia Individual", durationMinutes: 60 },
  ];
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  it("1. renders null when isOpen is false", () => {
    const { container } = render(
      <CreateAppointmentModal
        isOpen={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("2. renders form fields and client/service options when open", () => {
    render(
      <CreateAppointmentModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        clients={mockClients}
        services={mockServices}
      />
    );

    expect(screen.getByText("Nueva Cita")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /cliente/i })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /servicio/i })).toBeInTheDocument();
  });

  it("3. calls onSave with the correct payload on saving", () => {
    render(
      <CreateAppointmentModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        clients={mockClients}
        services={mockServices}
        initialDate="2026-07-01"
        initialTime="10:00"
      />
    );

    fireEvent.change(screen.getByRole("combobox", { name: /cliente/i }), {
      target: { value: "client-1" },
    });

    fireEvent.change(screen.getByRole("combobox", { name: /servicio/i }), {
      target: { value: "service-1" },
    });

    fireEvent.click(screen.getByRole("button", { name: /guardar cita/i }));

    expect(mockOnSave).toHaveBeenCalledWith({
      clientName: "Maria Garcia",
      clientId: "client-1",
      service: "Terapia Individual",
      serviceId: "service-1",
      serviceColor: "#C0987A",
      date: "2026-07-01",
      time: "10:00",
      duration: 1,
    });
  });
});
