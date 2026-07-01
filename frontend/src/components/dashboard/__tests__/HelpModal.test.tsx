import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import HelpModal from "../HelpModal";
import { vi, describe, it, expect } from "vitest";

describe("HelpModal Component", () => {
  it("1. dispatches open-copilot custom event on support chat click", () => {
    const mockOnClose = vi.fn();
    const eventSpy = vi.fn();

    window.addEventListener("open-copilot", eventSpy);

    render(<HelpModal isOpen={true} onClose={mockOnClose} />);

    const supportChatBtn = screen.getByText("Chat de Soporte").closest("div");
    expect(supportChatBtn).toBeInTheDocument();

    fireEvent.click(supportChatBtn!);

    expect(eventSpy).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();

    window.removeEventListener("open-copilot", eventSpy);
  });
});
