import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DeleteConfirmationDialog } from "../DeleteConfirmationDialog";

describe("DeleteConfirmationDialog", () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();
  const mockOnOpenChange = vi.fn();

  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    title: "Delete Customer",
    description: "Are you sure you want to delete this customer?",
    itemName: "Acme Corporation",
    isDeleting: false,
    onConfirm: mockOnConfirm,
    onCancel: mockOnCancel,
    isDangerous: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders delete confirmation dialog", () => {
    render(<DeleteConfirmationDialog {...defaultProps} />);
    expect(screen.getByText("Delete Customer")).toBeInTheDocument();
  });

  it("displays item name being deleted", () => {
    render(<DeleteConfirmationDialog {...defaultProps} />);
    expect(screen.getByText(/Acme Corporation/)).toBeInTheDocument();
  });

  it("displays warning message", () => {
    render(<DeleteConfirmationDialog {...defaultProps} />);
    expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();
  });

  it("has Cancel and Delete buttons", () => {
    render(<DeleteConfirmationDialog {...defaultProps} />);
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("calls onConfirm when Delete button is clicked", async () => {
    render(<DeleteConfirmationDialog {...defaultProps} />);
    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalled();
    });
  });

  it("calls onCancel when Cancel button is clicked", () => {
    render(<DeleteConfirmationDialog {...defaultProps} />);
    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it("closes dialog after confirmation", async () => {
    render(<DeleteConfirmationDialog {...defaultProps} />);
    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("disables buttons when deleting", () => {
    const props = { ...defaultProps, isDeleting: true };
    render(<DeleteConfirmationDialog {...props} />);
    
    const deleteButton = screen.getByText("Deleting...") as HTMLButtonElement;
    const cancelButton = screen.getByText("Cancel") as HTMLButtonElement;

    expect(deleteButton.disabled).toBe(true);
    expect(cancelButton.disabled).toBe(true);
  });

  it("shows danger styling for critical deletions", () => {
    const props = { ...defaultProps, isDangerous: true };
    render(<DeleteConfirmationDialog {...props} />);
    
    // Check for danger warning
    expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();
  });

  it("handles async onConfirm", async () => {
    const asyncOnConfirm = vi.fn().mockResolvedValue(undefined);
    const props = { ...defaultProps, onConfirm: asyncOnConfirm };
    
    render(<DeleteConfirmationDialog {...props} />);
    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(asyncOnConfirm).toHaveBeenCalled();
    });
  });
});
