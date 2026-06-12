import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  iconOnly?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className = "",
      type = "button",
      variant = "primary",
      iconOnly = false,
      ...props
    },
    ref,
  ) {
    const classes = [
      "ui-button",
      `ui-button--${variant}`,
      iconOnly ? "ui-button--icon" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return <button ref={ref} className={classes} type={type} {...props} />;
  },
);
