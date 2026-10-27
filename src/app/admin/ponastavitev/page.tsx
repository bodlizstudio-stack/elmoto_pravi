"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { resetPasswordWithToken, type ActionState } from "@/lib/actions/admin";

function ResetForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, action, pending] = useActionState(resetPasswordWithToken, null as ActionState);
  return (
    <main className="admin-shell grid min-h-dvh place-items-center bg-[#f6f6f4] px-6 py-10 text-[#16181c]">
      <form action={action} className="grid w-full max-w-md gap-4 rounded-[12px] border border-black/10 bg-white p-6">
        <h1 className="text-2xl font-semibold">Ponastavitev gesla</h1>
        {token ? (
          <>
            <input type="hidden" name="token" value={token} />
            <p className="text-sm leading-6 text-ink/70">Povezava velja kratek čas in jo lahko uporabiš samo enkrat.</p>
            <label className="field">
              <span>Novo geslo</span>
              <input name="next" type="password" autoComplete="new-password" minLength={12} required />
            </label>
            <label className="field">
              <span>Ponovi geslo</span>
              <input name="again" type="password" autoComplete="new-password" minLength={12} required />
            </label>
            {state?.error ? (
              <p className="text-sm text-accent" role="alert">
                {state.error}
              </p>
            ) : null}
            <button className="btn btn-primary" disabled={pending}>
              {pending ? "Shranjujem ..." : "Shrani novo geslo"}
            </button>
          </>
        ) : (
          <p className="leading-7">
            Za ponastavitev potrebuješ enkratno povezavo. Skrbnik strežnika jo pripravi z ukazom npm run admin:ponastavi in jo odpre na tem računalniku. Po e-pošti je ne pošiljamo.
          </p>
        )}
      </form>
    </main>
  );
}

export default function ResetPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
