import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { FormMessage } from "@/components/ui/FormMessage";
import { PasswordField } from "@/components/ui/PasswordField";
import { SubmitButton } from "@/components/ui/SubmitButton";

describe("storefront UI primitives", () => {
  it("associates a field label, hint, and error with its input", () => {
    render(
      <Field
        id="email"
        label="อีเมล"
        hint="ใช้สำหรับรับรหัสสินค้า"
        error="รูปแบบอีเมลไม่ถูกต้อง"
      />,
    );

    const input = screen.getByRole("textbox", { name: "อีเมล" });
    const hint = screen.getByText("ใช้สำหรับรับรหัสสินค้า");
    const error = screen.getByText("รูปแบบอีเมลไม่ถูกต้อง");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute(
      "aria-describedby",
      `${hint.id} ${error.id}`,
    );
  });

  it("toggles password visibility while keeping focus in the input", async () => {
    const user = userEvent.setup();
    render(<PasswordField id="password" label="รหัสผ่าน" />);

    const input = screen.getByLabelText("รหัสผ่าน");
    await user.click(input);
    await user.click(
      screen.getByRole("button", { name: "แสดงรหัสผ่าน" }),
    );

    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveFocus();
    expect(
      screen.getByRole("button", { name: "ซ่อนรหัสผ่าน" }),
    ).toBeInTheDocument();
  });

  it("communicates submit loading and disabled state", () => {
    render(<SubmitButton loading>เข้าสู่ระบบ</SubmitButton>);

    const button = screen.getByRole("button", { name: "กำลังดำเนินการ" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("uses alert for errors and status for success", () => {
    const { rerender } = render(
      <FormMessage tone="error">เข้าสู่ระบบไม่สำเร็จ</FormMessage>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "เข้าสู่ระบบไม่สำเร็จ",
    );

    rerender(
      <FormMessage tone="success">บันทึกข้อมูลแล้ว</FormMessage>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("บันทึกข้อมูลแล้ว");
  });

  it("requires an accessible name for icon-only buttons", () => {
    render(
      <Button aria-label="เปิดการค้นหา" iconOnly>
        <span aria-hidden="true">search</span>
      </Button>,
    );

    expect(
      screen.getByRole("button", { name: "เปิดการค้นหา" }),
    ).toBeInTheDocument();
  });
});
