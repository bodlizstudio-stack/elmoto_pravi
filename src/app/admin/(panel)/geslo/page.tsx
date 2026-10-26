"use client";

import { useActionState } from "react";
import { changePassword, type ActionState } from "@/lib/actions/admin";

export default function PasswordPage() {
  const [state, action, pending] = useActionState(changePassword, null as ActionState);
  return (
    <form action={action} className="grid max-w-lg gap-4 rounded-[12px] border border-black/10 bg-white p-5">
      <h1 className="text-3xl font-semibold">Zamenjaj geslo</h1>
      <p className="text-sm leading-6 text-ink/70">Novo geslo naj ima vsaj 12 znakov. Po uspešni shranitvi ostaneš prijavljen.</p>
      <label className="field">
        <span>Trenutno geslo</span>
        <input name="current" type="password" autoComplete="current-password" required />
      </label>
      <label className="field">
        <span>Novo geslo</span>
        <input name="next" type="password" autoComplete="new-password" minLength={12} required />
      </label>
      <label className="field">
        <span>Ponovi novo geslo</span>
        <input name="again" type="password" autoComplete="new-password" minLength={12} required />
      </label>
      {state?.error ? (
        <p className="text-sm text-accent" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p className="text-sm" role="status">
          {state.ok}
        </p>
      ) : null}
      <button className="btn btn-primary" disabled={pending}>
        {pending ? "Shranjujem ..." : "Shrani geslo"}
      </button>
    </form>
  );
}
