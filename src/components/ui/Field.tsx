import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

export interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  inputClassName?: string;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  {
    id,
    label,
    hint,
    error,
    className = "",
    inputClassName = "",
    ...inputProps
  },
  ref,
) {
  const fieldId = id ?? inputProps.name;
  if (!fieldId) {
    throw new Error("Field requires an id or name");
  }

  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={["ui-field", className].filter(Boolean).join(" ")}>
      <label className="ui-field__label" htmlFor={fieldId}>
        {label}
      </label>
      <input
        {...inputProps}
        ref={ref}
        aria-describedby={describedBy}
        aria-invalid={error ? "true" : undefined}
        className={[
          "ui-field__input",
          error ? "ui-field__input--error" : "",
          inputClassName,
        ]
          .filter(Boolean)
          .join(" ")}
        id={fieldId}
      />
      {hint ? (
        <p className="ui-field__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="ui-field__error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
});
