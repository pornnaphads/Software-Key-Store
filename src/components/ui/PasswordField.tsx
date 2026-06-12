"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import type { FieldProps } from "@/components/ui/Field";

export type PasswordFieldProps = Omit<FieldProps, "type">;

export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleVisibility = () => {
    setVisible((current) => !current);
    inputRef.current?.focus();
  };

  return (
    <div className="ui-password-field">
      <Field {...props} ref={inputRef} type={visible ? "text" : "password"} />
      <Button
        aria-label={visible ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
        className="ui-password-field__toggle"
        iconOnly
        onClick={toggleVisibility}
        variant="quiet"
      >
        <span aria-hidden="true" className="material-symbols-outlined">
          {visible ? "visibility_off" : "visibility"}
        </span>
      </Button>
    </div>
  );
}
