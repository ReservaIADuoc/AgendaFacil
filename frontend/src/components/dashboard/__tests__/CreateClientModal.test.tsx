import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CreateClientModal from "../CreateClientModal";
import { vi, describe, it, expect } from "vitest";

describe("CreateClientModal Component", () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  it("1. renders null when isOpen is false", () => {
    const { container } = render(
      <CreateClientModal
        isOpen={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("2. pre-fills input fields when editing an existing client", () => {
    const clientToEdit = {
      name: "Juan Perez",
      email: "juan@perez.com",
      phone: "+56987654321",
    };

    render(
      <CreateClientModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        client={clientToEdit}
      />
    );

    expect(screen.getByText("Editar Cliente")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ej. María García")).toHaveValue("Juan Perez");
    expect(screen.getByPlaceholderText("maria.garcia@gmail.com")).toHaveValue("juan@perez.com");
    expect(screen.getByPlaceholderText("Ej. +56 9 1234 5678")).toHaveValue("+56987654321");
  });

  it("3. calls onSave with the correct payload on submit", () => {
    render(
      <CreateClientModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        client={null}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("Ej. María García"), {
      target: { value: "Maria Garcia" },
    });
    fireEvent.change(screen.getByPlaceholderText("maria.garcia@gmail.com"), {
      target: { value: "maria@garcia.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Ej. +56 9 1234 5678"), {
      target: { value: "+56999998888" },
    });

    fireEvent.click(screen.getByRole("button", { name: /añadir cliente/i }));

    expect(mockOnSave).toHaveBeenCalledWith({
      name: "Maria Garcia",
      email: "maria@garcia.com",
      phone: "+56999998888",
    });
  });
});
