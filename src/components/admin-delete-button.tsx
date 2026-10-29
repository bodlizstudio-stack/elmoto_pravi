"use client";

import { useTransition } from "react";

export function AdminDeleteButton({
  confirmMessage,
  label = "Odstrani",
  className = "text-xs font-semibold text-[#E31B2B] transition hover:underline",
}: {
  confirmMessage: string;
  label?: string;
  className?: string;
}) {
  const [isPending] = useTransition();

  return (
    <button
      type="submit"
      disabled={isPending}
      className={className}
      onClick={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      {isPending ? "Brisanje..." : label}
    </button>
  );
}
