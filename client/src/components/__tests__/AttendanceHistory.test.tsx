import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AttendanceHistory } from "../AttendanceHistory";

// Mock tRPC
vi.mock("@/lib/trpc", () => ({
  trpc: {
    hr: {
      getAttendance: {
        useQuery: () => ({
          data: [
            {
              id: 1,
              date: "2026-01-26",
              teamMemberId: 1,
              teamMember: { id: 1, name: "John Doe" },
              status: "present",
              notes: "Regular working day",
            },
            {
              id: 2,
              date: "2026-01-25",
              teamMemberId: 2,
              teamMember: { id: 2, name: "Jane Smith" },
              status: "absent",
              notes: "Medical leave",
            },
          ],
          isLoading: false,
        }),
      },
    },
  },
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("AttendanceHistory", () => {
  const mockTeamMembers = [
    { id: 1, name: "John Doe", employeeId: "EMP001" },
    { id: 2, name: "Jane Smith", employeeId: "EMP002" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders attendance history component", () => {
    render(<AttendanceHistory teamMembers={mockTeamMembers} />);
    expect(screen.getByText("Filter Attendance Records")).toBeInTheDocument();
  });

  it("displays filter inputs", () => {
    render(<AttendanceHistory teamMembers={mockTeamMembers} />);
    expect(screen.getByLabelText("Start Date")).toBeInTheDocument();
    expect(screen.getByLabelText("End Date")).toBeInTheDocument();
    expect(screen.getByLabelText("Team Member")).toBeInTheDocument();
  });

  it("displays attendance records table", () => {
    render(<AttendanceHistory teamMembers={mockTeamMembers} />);
    expect(screen.getByText("Attendance Records")).toBeInTheDocument();
  });

  it("displays summary statistics", () => {
    render(<AttendanceHistory teamMembers={mockTeamMembers} />);
    expect(screen.getByText("Total Records")).toBeInTheDocument();
    expect(screen.getByText("Present")).toBeInTheDocument();
    expect(screen.getByText("Absent")).toBeInTheDocument();
  });

  it("has export CSV button", () => {
    render(<AttendanceHistory teamMembers={mockTeamMembers} />);
    const exportButton = screen.getByText(/Export CSV/i);
    expect(exportButton).toBeInTheDocument();
  });

  it("allows date filtering", () => {
    render(<AttendanceHistory teamMembers={mockTeamMembers} />);
    const startDateInput = screen.getByLabelText("Start Date") as HTMLInputElement;
    const endDateInput = screen.getByLabelText("End Date") as HTMLInputElement;

    fireEvent.change(startDateInput, { target: { value: "2026-01-01" } });
    fireEvent.change(endDateInput, { target: { value: "2026-01-31" } });

    expect(startDateInput.value).toBe("2026-01-01");
    expect(endDateInput.value).toBe("2026-01-31");
  });

  it("displays team member options in filter", () => {
    render(<AttendanceHistory teamMembers={mockTeamMembers} />);
    // Team member dropdown should be available
    expect(screen.getByLabelText("Team Member")).toBeInTheDocument();
  });
});
