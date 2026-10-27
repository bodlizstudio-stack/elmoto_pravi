"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LogoLink } from "@/components/logo";
import { login, type ActionState } from "@/lib/actions/admin";

function LoginForm() {
  const [state, action, pending] = useActionState(login, null as ActionState);
  const params = useSearchParams();
  return (
    <main className="admin-shell grid min-h-dvh place-items-center bg-[#f6f6f4] px-6 py-10 text-[#16181c]">
      <form action={action} className="grid w-full max-w-md gap-4 rounded-[12px] border border-black/10 bg-white p-6">
        <LogoLink className="h-10 w-auto" theme="light" />
        <h1 className="text-2xl font-semibold">Prijava za skrbnika</h1>
        <p className="text-sm leading-6 text-ink/70">Ta stran ni za obiskovalce. Po prijavi lahko dodaš, urejaš in umakneš motorje.</p>
        {params.get("ponastavljeno") ? <p role="status">Geslo je ponastavljeno. Prijavi se z novim geslom.</p> : null}
        <label className="field">
          <span>Uporabniško ime</span>
          <input name="email" type="text" autoComplete="username" required />
        </label>
        <label className="field">
          <span>Geslo</span>
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        {state?.error ? (
          <p className="text-sm text-accent" role="alert">
            {state.error}
          </p>
        ) : null}
        <button className="btn btn-primary" disabled={pending}>
          {pending ? "Prijavljam ..." : "Prijava"}
        </button>
        <p className="text-sm leading-6 text-ink/70">
          Javne registracije ni. Pozabljeno geslo ponastavi skrbnik strežnika z ukazom na računalniku. Povezave ne pošiljamo po e-pošti.{" "}
          <Link className="underline" href="/admin/ponastavitev">
            Imam povezavo za ponastavitev
          </Link>
        </p>
      </form>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
