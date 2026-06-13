import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { AdminCalendar } from "@/components/admin/AdminCalendar";

describe("AdminCalendar", () => {
  it("opens a view-only calendar and navigates between months", async () => {
    const user = userEvent.setup();
    render(<AdminCalendar initialDate={new Date(2026, 5, 13)} />);

    await user.click(
      screen.getByRole("button", { name: "เปิดปฏิทิน" }),
    );

    expect(
      screen.getByRole("dialog", { name: "ปฏิทิน" }),
    ).toBeInTheDocument();
    expect(screen.getByText("มิถุนายน 2026")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "เดือนถัดไป" }),
    );
    expect(screen.getByText("กรกฎาคม 2026")).toBeInTheDocument();
  });

  it("closes the calendar with Escape", async () => {
    const user = userEvent.setup();
    render(<AdminCalendar initialDate={new Date(2026, 5, 13)} />);

    await user.click(
      screen.getByRole("button", { name: "เปิดปฏิทิน" }),
    );
    await user.keyboard("{Escape}");

    expect(
      screen.queryByRole("dialog", { name: "ปฏิทิน" }),
    ).not.toBeInTheDocument();
  });
});
