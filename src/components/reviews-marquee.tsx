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
    <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#5B616B]">
      <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" aria-hidden="true">
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
    // Explicitly exclude Andreas / Andrea Prando if present anywhere
    if (item.authorName.toLowerCase().includes("prando")) continue;
    const key = `${item.authorName.toLowerCase()}::${item.text.slice(0, 30).toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      allReviews.push(item);
    }
  }

  return (
    <section
      className="overflow-hidden border-y border-[#E2E5E9] bg-white py-3 text-[#16181C] sm:py-5 lg:py-6"
      aria-label="Mnenja strank Google"
    >
      <div className="wrap mb-2.5 flex items-center justify-between gap-2 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <span className="h-0.5 w-4 rounded-full bg-[#E31B2B] sm:w-6" aria-hidden="true" />
          <h2 className="display text-base font-bold uppercase tracking-wider text-[#16181C] sm:text-2xl">
            MNENJA STRANK
          </h2>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E5E9] bg-[#F6F6F4] px-2.5 py-1 text-[11px] font-bold text-[#16181C] shadow-2xs sm:gap-2 sm:px-3.5 sm:py-1.5 sm:text-xs">
          <div className="flex items-center text-[#fbbc04]" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-current sm:h-3.5 sm:w-3.5" />
            ))}
          </div>
          <span className="sm:hidden">5,0 / 5</span>
          <span className="hidden sm:inline">5,0 / 5 na Googlu</span>
        </div>
      </div>

      <div className="reviews-marquee-mask relative w-full overflow-hidden">
        <div className="reviews-marquee-track flex w-max gap-2 px-2 sm:gap-3">
          {[...allReviews, ...allReviews].map((review, index) => {
            const initial = review.authorName.trim().charAt(0).toUpperCase() || "E";
            const isDuplicate = index >= allReviews.length;
            return (
              <article
                key={`${review.id}-${index}`}
                aria-hidden={isDuplicate ? "true" : undefined}
                className="flex w-[12rem] shrink-0 flex-col justify-between rounded-[10px] border border-[#E2E5E9] bg-white p-2.5 shadow-2xs transition-transform sm:w-[17.5rem] lg:w-[18.5rem] sm:rounded-[12px] sm:p-3.5 sm:px-4 text-[#16181C]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#E31B2B] text-[10px] font-bold text-white sm:h-8 sm:w-8 sm:text-xs">
                        {initial}
                      </span>
                      <div>
                        <h3 className="text-xs font-bold leading-tight text-[#16181C] sm:text-[13.5px] sm:leading-snug">
                          {review.authorName}
                        </h3>
                        <div className="hidden sm:block">
                          <GoogleBadge />
                        </div>
                      </div>
                    </div>
                    <span className="rounded border border-[#E2E5E9] bg-[#F6F6F4] px-1.5 py-0.5 text-[10px] font-bold text-[#16181C] sm:rounded-md sm:px-2 sm:py-0.5 sm:text-[11px]">
                      {review.rating}/5
                    </span>
                  </div>

                  <div
                    className="mt-1 flex items-center gap-1 text-[#fbbc04] sm:mt-2"
                    aria-label={`Ocena ${review.rating} od 5`}
                  >
                    {Array.from({ length: review.rating || 5 }).map((_, starIdx) => (
                      <Star key={starIdx} className="h-3 w-3 fill-current sm:h-3.5 sm:w-3.5" />
                    ))}
                    {review.timeAgo ? (
                      <span className="ml-1 text-[10px] text-[#5B616B] sm:ml-1.5 sm:text-[11px]">
                        {review.timeAgo}
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-1 line-clamp-3 text-[11px] leading-snug text-[#5B616B] sm:mt-2 sm:line-clamp-4 sm:text-[13px] sm:leading-relaxed">
                    {review.text}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
