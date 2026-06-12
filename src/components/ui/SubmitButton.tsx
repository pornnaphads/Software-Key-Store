import { Button } from "@/components/ui/Button";
import type { ButtonProps } from "@/components/ui/Button";

export interface SubmitButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

export function SubmitButton({
  children,
  disabled,
  loading = false,
  loadingText = "กำลังดำเนินการ",
  ...props
}: SubmitButtonProps) {
  return (
    <Button
      {...props}
      aria-busy={loading ? "true" : undefined}
      disabled={disabled || loading}
      type="submit"
    >
      {loading ? (
        <>
          <span aria-hidden="true" className="ui-spinner" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
