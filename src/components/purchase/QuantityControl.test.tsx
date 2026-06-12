import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { QuantityControl } from "@/components/purchase/QuantityControl";

describe("QuantityControl", () => {
  it("increments and decrements within the available stock", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <QuantityControl
        name="Microsoft Office 2021"
        onChange={onChange}
        quantity={2}
        stock={3}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "เพิ่มจำนวน Microsoft Office 2021",
      }),
    );
    expect(onChange).toHaveBeenLastCalledWith(3);

    rerender(
      <QuantityControl
        name="Microsoft Office 2021"
        onChange={onChange}
        quantity={1}
        stock={3}
      />,
    );
    await user.click(
      screen.getByRole("button", {
        name: "ลดจำนวน Microsoft Office 2021",
      }),
    );
    expect(onChange).not.toHaveBeenCalledWith(0);
  });

  it("disables controls at the minimum and stock maximum", () => {
    const { rerender } = render(
      <QuantityControl
        name="Microsoft Office 2021"
        onChange={vi.fn()}
        quantity={1}
        stock={3}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: "ลดจำนวน Microsoft Office 2021",
      }),
    ).toBeDisabled();
    expect(
      screen.getByRole("spinbutton", {
        name: "จำนวน Microsoft Office 2021",
      }),
    ).toHaveValue(1);

    rerender(
      <QuantityControl
        name="Microsoft Office 2021"
        onChange={vi.fn()}
        quantity={3}
        stock={3}
      />,
    );
    expect(
      screen.getByRole("button", {
        name: "เพิ่มจำนวน Microsoft Office 2021",
      }),
    ).toBeDisabled();
  });

  it("disables every control for unavailable stock", () => {
    render(
      <QuantityControl
        name="Microsoft Office 2021"
        onChange={vi.fn()}
        quantity={0}
        stock={0}
      />,
    );

    expect(
      screen.getAllByRole("button").every((button) => button.hasAttribute("disabled")),
    ).toBe(true);
    expect(
      screen.getByRole("spinbutton", {
        name: "จำนวน Microsoft Office 2021",
      }),
    ).toBeDisabled();
  });
});
