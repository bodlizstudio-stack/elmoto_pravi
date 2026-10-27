import { Star } from "lucide-react";

export type ReviewItem = {
  id: string;
  authorName: string;
  text: string;
  rating: number;
  source: string;
  timeAgo?: string;
};

export const googleReviews: ReviewItem[] = [
  {
    id: "rev-1",
    authorName: "Maja Lapuh",
    text: "Korekten odnos. Vse tako kot je bilo dogovorjeno. Pohvale Elvisu.",
    rating: 5,
    source: "Google",
    timeAgo: "pred 3 tedni",
  },
  {
    id: "rev-2",
    authorName: "Uki Ukano",
    text: "Super odnos in prijaznost prodajalca Elvisa, vse uredil tako kot je treba od začetka do konca! Priporočam nakup motorja pri njem.",
    rating: 5,
    source: "Google",
    timeAgo: "pred 2 mesecema",
  },
  {
    id: "rev-3",
    authorName: "David Mihelič",
    text: "Vsi papirji so urejeni. Elvis je res zaupanja vreden prodajalec!",
    rating: 5,
    source: "Google",
    timeAgo: "pred 2 mesecema",
  },
  {
    id: "rev-4",
    authorName: "Valentina Salopek",
    text: "Prezadovoljni, preporučam!",
    rating: 5,
    source: "Google",
    timeAgo: "pred 3 meseci",
  },
  {
    id: "rev-5",
    authorName: "Andrea Prando",
    text: "Ho venduto la mia moto in Italia, puntuale e preciso, pagamento immediato, nessuna problematica.",
    rating: 5,
    source: "Google",
    timeAgo: "pred 4 meseci",
  },
  {
    id: "rev-6",
    authorName: "Dejan Košir",
    text: "Zelo sem zadovoljen z nakupom motorja. 😊 Na vsa vprašanja sem dobil odgovor. 👍",
    rating: 5,
    source: "Google",
    timeAgo: "pred 5 meseci",
  },
  {
    id: "rev-7",
    authorName: "Boris Kaluža",
    text: "Zelo korektni, držijo se dogovora, zelo prijazni, hitro odzivni.",
    rating: 5,
    source: "Google",
    timeAgo: "pred 6 meseci",
  },
  {
    id: "rev-8",
    authorName: "Lukas Sorgi",
    text: "Prijaznost, strokovno in dobro svetovanje priporočam, super nakup +++",
    rating: 5,
    source: "Google",
    timeAgo: "pred 7 meseci",
  },
  {
    id: "rev-9",
    authorName: "Grega Marolt",
    text: "Dobra izkušnja z nakupom motorja. Prijazno osebje.",
    rating: 5,
    source: "Google",
    timeAgo: "pred 7 meseci",
  },
  {
    id: "rev-10",
    authorName: "Matjaž Štokelj",
    text: "Zelo zadovoljen z nakupom. Lp",
    rating: 5,
    source: "Google",
    timeAgo: "pred 7 meseci",
  },
];

function GoogleBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B9BDC5]">
      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.54-5.17 3.54-8.97Z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14A11.99 11.99 0 0 0 12 24Z"
        />
        <path
          fill="#FBBC05"
          d="M5.28 14.24a7.18 7.18 0 0 1 0-4.48V6.62H1.29a12 12 0 0 0 0 10.76l3.99-3.14Z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A11.99 11.99 0 0 0 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
        />
      </svg>
      <span>Google mnenje</span>
    </span>
  );
}

export function ReviewsMarquee({ extraReviews = [] }: { extraReviews?: ReviewItem[] }) {
  const seen = new Set<string>();
  const allReviews: ReviewItem[] = [];
  for (const item of [...extraReviews, ...googleReviews]) {
    const key = `${item.authorName.toLowerCase()}::${item.text.slice(0, 30).toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      allReviews.push(item);
    }
  }

  return (
    <section
      className="overflow-hidden border-y border-white/10 bg-[#1B1D22] pb-12 pt-14 text-[#F5F5F5]"
      aria-label="Mnenja strank Google"
    >
      <div className="wrap mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="kicker">Mnenja strank</p>
          <h2 className="display mt-2.5 text-3xl text-white sm:text-4xl">KAJ O NAS PRAVIJO KUPCI</h2>
        </div>
        <div className="inline-flex items-center gap-2.5 self-start rounded-full border border-white/12 bg-[#25272D] px-4 py-2 text-sm font-bold text-white shadow-sm">
          <div className="flex items-center text-[#fbbc04]" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <span>5,0 / 5 na Googlu</span>
        </div>
      </div>

      <div className="reviews-marquee-mask relative w-full overflow-hidden">
        <div className="reviews-marquee-track flex w-max gap-4 px-2">
          {[...allReviews, ...allReviews].map((review, index) => {
            const initial = review.authorName.trim().charAt(0).toUpperCase() || "E";
            const isDuplicate = index >= allReviews.length;
            return (
              <article
                key={`${review.id}-${index}`}
                aria-hidden={isDuplicate ? "true" : undefined}
                className="flex w-[20rem] shrink-0 flex-col justify-between rounded-[14px] border border-white/10 bg-[#25272D] p-5 shadow-[0_10px_28px_rgba(0,0,0,0.3)] sm:w-[23rem]"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#E31B2B] text-sm font-bold text-white">
                        {initial}
                      </span>
                      <div>
                        <h3 className="text-[15px] font-bold leading-5 text-[#F5F5F5]">{review.authorName}</h3>
                        <GoogleBadge />
                      </div>
                    </div>
                    <span className="rounded-md border border-white/10 bg-[#111216] px-2.5 py-1 text-xs font-bold text-[#F5F5F5]">
                      {review.rating}/5
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-1 text-[#fbbc04]" aria-label={`Ocena ${review.rating} od 5`}>
                    {Array.from({ length: review.rating || 5 }).map((_, starIdx) => (
                      <Star key={starIdx} className="h-4 w-4 fill-current" />
                    ))}
                    {review.timeAgo ? <span className="ml-2 text-xs text-[#B9BDC5]">{review.timeAgo}</span> : null}
                  </div>

                  <p className="mt-3 text-[15px] leading-6 text-[#B9BDC5]">{review.text}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
