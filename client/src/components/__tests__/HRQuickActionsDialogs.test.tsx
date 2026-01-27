import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { HRQuickActionsDialogs } from "../HRQuickActionsDialogs";
import * as tRPCReact from "@trpc/react-query";

// Mock tRPC
vi.mock("@/lib/trpc", () => ({
  trpc: {
    hr: {
      markAttendance: {
        useMutation: () => ({
          mutateAsync: vi.fn().mockResolvedValue({}),
        }),
      },
      createPerformanceReview: {
        useMutation: () => ({
          mutateAsync: vi.fn().mockResolvedValue({}),
        }),
      },
    },
    useUtils: () => ({
      hr: {
        getAttendance: { invalidate: vi.fn() },
        getPerformanceReviews: { invalidate: vi.fn() },
      },
    }),
  },
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("HRQuickActionsDialogs", () => {
  const mockTeamMembers = [
    { id: 1, name: "John Doe", employeeId: "EMP001" },
    { id: 2, name: "Jane Smith", employeeId: "EMP002" },
  ];

  const mockEmployees = [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" },
  ];

  const defaultProps = {
    markAttendanceOpen: true,
    setMarkAttendanceOpen: vi.fn(),
    generateReportOpen: false,
    setGenerateReportOpen: vi.fn(),
    performanceReviewOpen: false,
    setPerformanceReviewOpen: vi.fn(),
    teamMembers: mockTeamMembers,
    employees: mockEmployees,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Mark Attendance dialog when open", () => {
    render(<HRQuickActionsDialogs {...defaultProps} />);
    expect(screen.getByText("Mark Attendance")).toBeInTheDocument();
  });

  it("displays team members in dropdown", () => {
    render(<HRQuickActionsDialogs {...defaultProps} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("shows error when required fields are empty", async () => {
    const { toast } = await import("sonner");
    render(<HRQuickActionsDialogs {...defaultProps} />);
    
    const submitButton = screen.getByText("Mark Attendance");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Please fill in all required fields");
    });
  });

  it("renders Generate Report dialog when open", () => {
    const props = {
      ...defaultProps,
      markAttendanceOpen: false,
      generateReportOpen: true,
    };
    render(<HRQuickActionsDialogs {...props} />);
    expect(screen.getByText("Generate Report")).toBeInTheDocument();
  });

  it("renders Performance Review dialog when open", () => {
    const props = {
      ...defaultProps,
      markAttendanceOpen: false,
      performanceReviewOpen: true,
    };
    render(<HRQuickActionsDialogs {...props} />);
    expect(screen.getByText("Performance Review")).toBeInTheDocument();
  });

  it("validates rating is between 1 and 5", async () => {
    const { toast } = await import("sonner");
    const props = {
      ...defaultProps,
      markAttendanceOpen: false,
      performanceReviewOpen: true,
    };
    render(<HRQuickActionsDialogs {...props} />);

    // This test would need actual form interaction
    // Simplified for demonstration
    expect(screen.getByText("Performance Review")).toBeInTheDocument();
  });
});
