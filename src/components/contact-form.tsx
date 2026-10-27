"use client";

import { useActionState, useState } from "react";
import { submitInquiry, type FormState } from "@/lib/actions/public";
import { inquiryTypes } from "@/lib/site";
import { contactSchema, fieldErrors } from "@/lib/validators";

export function ContactForm({
  motorcycles,
  initialType = "GENERAL",
  initialMotorcycleId = "",
  initialInterest = "",
  mailto,
  dark = false,
}: {
  motorcycles: { id: string; label: string }[];
  initialType?: string;
  initialMotorcycleId?: string;
  initialInterest?: string;
  mailto?: string;
  dark?: boolean;
}) {
  const [state, action, pending] = useActionState(submitInquiry, null as FormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const shown = { ...errors, ...state?.errors };
  const relevant = ["PURCHASE", "RENTAL", "VIEWING"];

  if (state?.ok) {
    return (
      <div className="rounded-[14px] border border-white/10 bg-[#25272D] p-6 text-[#F5F5F5]" role="status">
        <h2 className="display text-4xl text-white">Povpraševanje je shranjeno</h2>
        <p className="mt-3 leading-7 text-[#B9BDC5]">{state.message}</p>
        <a className="btn btn-primary mt-5" href="/kontakt">
          Pošlji novo sporočilo
        </a>
      </div>
    );
  }

  return (
    <form
      action={action}
      className={`grid gap-4 ${dark ? "dark-fields" : ""}`}
      onSubmit={(event) => {
        const parsed = contactSchema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));
        if (!parsed.success) {
          event.preventDefault();
          setErrors(fieldErrors(parsed.error));
        } else setErrors({});
      }}
      noValidate
    >
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label>
          Spletna stran
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="field">
        <span>Ime in priimek</span>
        <input name="name" autoComplete="name" required aria-invalid={Boolean(shown.name)} />
        {shown.name ? <em className="text-sm text-accent not-italic">{shown.name}</em> : null}
      </label>
      <label className="field">
        <span>E-pošta</span>
        <input name="email" type="email" autoComplete="email" required aria-invalid={Boolean(shown.email)} />
        {shown.email ? <em className="text-sm text-accent not-italic">{shown.email}</em> : null}
      </label>
      <label className="field">
        <span>Telefon (ni obvezno)</span>
        <input name="phone" type="tel" autoComplete="tel" inputMode="tel" />
        {shown.phone ? <em className="text-sm text-accent not-italic">{shown.phone}</em> : null}
      </label>
      <label className="field">
        <span>Vrsta povpraševanja</span>
        <select name="type" defaultValue={initialType} onChange={(event) => event.currentTarget.form?.querySelector("[data-moto]")?.toggleAttribute("hidden", !relevant.includes(event.target.value))}>
          {inquiryTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Model ali kategorija (ni obvezno)</span>
        <input name="interest" defaultValue={initialInterest} maxLength={160} />
      </label>
      <label className="field" data-moto hidden={!relevant.includes(initialType)}>
        <span>Izbrani motor (če je relevantno)</span>
        <select name="motorcycleId" defaultValue={initialMotorcycleId}>
          <option value="">Ni vezano na določen motor</option>
          {motorcycles.map((bike) => (
            <option key={bike.id} value={bike.id}>
              {bike.label}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Sporočilo</span>
        <textarea name="message" required aria-invalid={Boolean(shown.message)} />
        {shown.message ? <em className="text-sm text-accent not-italic">{shown.message}</em> : null}
      </label>
      <label className="flex items-start gap-3 text-sm leading-6 text-ink/80">
        <input name="privacy" type="checkbox" className="mt-1 h-5 w-5 min-h-5" required />
        <span>
          Seznanjen sem s <a className="underline" href="/zasebnost">politiko zasebnosti</a> in soglašam, da EL-MOTO moje podatke uporabi za odgovor na povpraševanje.
        </span>
      </label>
      {shown.privacy ? <p className="text-sm text-accent">{shown.privacy}</p> : null}
      {state?.message ? (
        <p className="text-sm text-accent" role="alert">
          {state.message}
        </p>
      ) : null}
      <button className="btn btn-primary w-full sm:w-auto" disabled={pending} aria-busy={pending}>
        {pending ? "Pošiljam ..." : "Pošlji povpraševanje"}
      </button>
      {mailto ? (
        <p className="text-sm leading-6 text-ink/70">
          Lahko pišeš tudi neposredno.{" "}
          <a className="font-semibold underline" href={mailto}>
            Odpri e-poštni program
          </a>
          . Sporočilo se pošlje šele, ko ga v programu oddaš.
        </p>
      ) : null}
    </form>
  );
}
