"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonVariant } from "./ui";

export function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  className,
  name,
  value,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: ButtonVariant;
  className?: string;
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} disabled={pending} aria-disabled={pending} className={className} name={name} value={value}>
      {pending ? (pendingLabel ?? "Saving…") : children}
    </Button>
  );
}
