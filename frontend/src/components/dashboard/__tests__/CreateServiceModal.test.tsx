import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CreateServiceModal from "../CreateServiceModal";
import { vi, describe, it, expect } from "vitest";

describe("CreateServiceModal Component", () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  it("1. renders null when isOpen is false", () => {
    const { container } = render(
      <CreateServiceModal
        isOpen={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("2. pre-fills fields when editing an existing service", () => {
    const serviceToEdit = {
      id: 123,
      name: "Consulta Individual",
      duration: "45 min",
      price: "$60.000",
      type: "presencial",
    };

    render(
      <CreateServiceModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        serviceToEdit={serviceToEdit}
      />
    );

    expect(screen.getByText("Editar Servicio")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ej. Terapia Individual")).toHaveValue("Consulta Individual");
    expect(screen.getByRole("combobox", { name: /duración/i })).toHaveValue("45");
    expect(screen.getByPlaceholderText("Ej. 50000")).toHaveValue("60000");
  });

  it("3. calls onSave with the correct payload on submit", () => {
    render(
      <CreateServiceModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        serviceToEdit={null}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("Ej. Terapia Individual"), {
      target: { value: "Consulta Online" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: /duración/i }), {
      target: { value: "60" },
    });
    fireEvent.change(screen.getByPlaceholderText("Ej. 50000"), {
      target: { value: "40000" },
    });

    fireEvent.click(screen.getByRole("button", { name: /crear servicio/i }));

    expect(mockOnSave).toHaveBeenCalledWith({
      id: undefined,
      name: "Consulta Online",
      duration: "60 min",
      price: "40000",
      type: "video",
    });
  });
});
