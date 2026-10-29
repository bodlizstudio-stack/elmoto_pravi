import { site, siteUrl } from "@/lib/site";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export type InquiryEmailData = {
  inquiryId: string;
  name: string;
  email: string;
  phone?: string | null;
  typeLabel: string;
  motorcycleName?: string | null;
  message: string;
  createdAt?: string;
};

export type RentalEmailData = {
  bookingId: string;
  name: string;
  email: string;
  phone: string;
  licenseCategory: string;
  motorcycleName: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  days: number;
  quotedCents?: number | null;
  message?: string | null;
};

/**
 * skupni ovoj za vsa EL-MOTO e-poštna sporočila
 */
function emailShell({
  preheader,
  content,
}: {
  preheader: string;
  content: string;
}): string {
  const baseUrl = siteUrl();
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="sl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EL-MOTO</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, a { font-family: Arial, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #111216; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: #F5F5F5;">
  <!-- Skrito predogledno besedilo -->
  <div style="display: none; font-size: 1px; color: #111216; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${escapeHtml(preheader)}
  </div>

  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #111216; padding: 24px 12px 40px 12px;">
    <tr>
      <td align="center">
        <!-- Glavna kartica -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #1B1D22; border-radius: 14px; overflow: hidden; border: 1px solid #2E323B; box-shadow: 0 10px 30px rgba(0,0,0,0.45);">
          
          <!-- Rdeča dirkaška zgornja linija -->
          <tr>
            <td style="background-color: #E31B2B; height: 5px; line-height: 5px; font-size: 5px;">&nbsp;</td>
          </tr>

          <!-- Glava z logotipom -->
          <tr>
            <td style="padding: 32px 36px 24px 36px; background-color: #18191E; border-bottom: 1px solid #262932;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <!-- Logotip znamke -->
                    <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="vertical-align: middle;">
                          <a href="${baseUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                            <span style="font-size: 28px; font-weight: 900; letter-spacing: 2px; color: #FFFFFF; font-family: 'Barlow Condensed', -apple-system, Arial, sans-serif; text-transform: uppercase;">
                              EL<span style="color: #E31B2B;">-MOTO</span>
                            </span>
                          </a>
                        </td>
                        <td style="vertical-align: middle; padding-left: 12px;">
                          <span style="display: inline-block; width: 6px; height: 6px; background-color: #E31B2B; border-radius: 50%;"></span>
                        </td>
                        <td style="vertical-align: middle; padding-left: 10px;">
                          <span style="font-size: 12px; color: #8EADD4; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">
                            ${escapeHtml(site.slogan)}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="font-size: 11px; color: #7B818F; text-transform: uppercase; letter-spacing: 1px;">
                      Trzin, SI
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Glavna vsebina -->
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              ${content}
            </td>
          </tr>

          <!-- Noga sporočila -->
          <tr>
            <td style="padding: 24px 36px; background-color: #15161A; border-top: 1px solid #262932; text-align: center;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding-bottom: 14px;">
                    <p style="margin: 0; font-size: 13px; font-weight: 700; color: #F5F5F5; letter-spacing: 0.5px;">
                      ${escapeHtml(site.brand)}
                    </p>
                    <p style="margin: 4px 0 0 0; font-size: 12px; color: #8EADD4;">
                      ${escapeHtml(site.street)}, ${escapeHtml(site.postalCode)} ${escapeHtml(site.city)} &bull; Tel: <a href="tel:${site.phoneTel}" style="color: #F5F5F5; text-decoration: none; font-weight: 600;">${escapeHtml(site.phoneDisplay)}</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <a href="${site.instagram}" target="_blank" style="display: inline-block; margin: 0 10px; font-size: 12px; color: #B9BDC5; text-decoration: none;">Instagram: ${escapeHtml(site.instagramHandle)}</a>
                    <span style="color: #383B44;">&bull;</span>
                    <a href="${site.facebook}" target="_blank" style="display: inline-block; margin: 0 10px; font-size: 12px; color: #B9BDC5; text-decoration: none;">Facebook</a>
                    <span style="color: #383B44;">&bull;</span>
                    <a href="${baseUrl}" target="_blank" style="display: inline-block; margin: 0 10px; font-size: 12px; color: #E31B2B; font-weight: 600; text-decoration: none;">elmoto.si</a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="border-top: 1px solid #23252C; padding-top: 14px;">
                    <p style="margin: 0; font-size: 11px; color: #666C7A; line-height: 16px;">
                      To je samodejno sporočilo s spletne strani EL-MOTO.<br>&copy; ${year} EL-MOTO d.o.o. Vse pravice pridržane.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * 1. Obrazec / e-sporočilo za POŠILJATELJA (stranka - potrdilo o oddaji)
 */
export function buildSenderInquiryEmail(data: InquiryEmailData): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `Prejeli smo vaše povpraševanje | EL-MOTO`;
  const baseUrl = siteUrl();

  const text = [
    `Pozdravljeni, ${data.name}!`,
    "",
    "Hvala za vaše povpraševanje na spletni strani EL-MOTO.",
    "Vaše sporočilo je bilo uspešno sprejeto. Naša ekipa ga bo pregledala v najkrajšem možnem času in vam odgovorila.",
    "",
    "POVZETEK VAŠEGA POVPRAŠEVANJA:",
    `--------------------------------------`,
    `Referenčna št.: ${data.inquiryId}`,
    `Vrsta: ${data.typeLabel}`,
    data.motorcycleName ? `Motor: ${data.motorcycleName}` : null,
    `Ime in priimek: ${data.name}`,
    `E-pošta: ${data.email}`,
    data.phone ? `Telefon: ${data.phone}` : null,
    "",
    "VAŠE SPOROČILO:",
    data.message,
    "",
    "--------------------------------------",
    "Če imate nujno vprašanje ali želite takojšen ogled motorja, nas lahko pokličete na 070 868 600.",
    "",
    `EL-MOTO d.o.o.`,
    `${site.street}, ${site.postalCode} ${site.city}`,
    `Tel: ${site.phoneDisplay}`,
    `Splet: ${baseUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  const content = `
    <!-- Značka stanja -->
    <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
      <tr>
        <td style="background-color: rgba(227, 27, 43, 0.14); border: 1px solid rgba(227, 27, 43, 0.4); border-radius: 6px; padding: 6px 14px;">
          <span style="font-size: 11px; font-weight: 700; color: #FF4D5E; letter-spacing: 1.5px; text-transform: uppercase;">
            ✓ Povpraševanje uspešno prejeto
          </span>
        </td>
      </tr>
    </table>

    <!-- Pozdrav in uvod -->
    <h1 style="margin: 0 0 12px 0; font-size: 26px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px; line-height: 1.2;">
      Pozdravljeni, ${escapeHtml(data.name)}!
    </h1>
    <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 24px; color: #B9BDC5;">
      Hvala za vaše zanimanje za <strong style="color: #FFFFFF;">EL-MOTO</strong>. Vaše povpraševanje je uspešno shranjeno v naš sistem. Naša ekipa bo vaše sporočilo pregledala in se vam v najkrajšem možnem času oglasila z vsemi odgovori.
    </p>

    <!-- Kartica s podatki -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #22242B; border: 1px solid #2E323C; border-radius: 10px; margin-bottom: 24px; overflow: hidden;">
      <tr>
        <td style="padding: 14px 20px; background-color: #272A33; border-bottom: 1px solid #323642;">
          <span style="font-size: 12px; font-weight: 700; color: #8EADD4; letter-spacing: 1.2px; text-transform: uppercase;">
            Podrobnosti oddanega obrazca
          </span>
        </td>
      </tr>
      <tr>
        <td style="padding: 18px 20px;">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding: 6px 0; font-size: 13px; color: #8C92A0; width: 38%; vertical-align: top;">Referenca:</td>
              <td style="padding: 6px 0; font-size: 13px; color: #F5F5F5; font-family: monospace; font-weight: 600;">#${escapeHtml(data.inquiryId.slice(0, 12))}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 13px; color: #8C92A0; vertical-align: top;">Vrsta povpraševanja:</td>
              <td style="padding: 6px 0; font-size: 13px; color: #FFFFFF; font-weight: 700;">
                <span style="display: inline-block; background-color: #1A1C23; border: 1px solid #373A46; padding: 2px 8px; border-radius: 4px; color: #FF4D5E;">
                  ${escapeHtml(data.typeLabel)}
                </span>
              </td>
            </tr>
            ${
              data.motorcycleName
                ? `<tr>
              <td style="padding: 6px 0; font-size: 13px; color: #8C92A0; vertical-align: top;">Izbrani motor:</td>
              <td style="padding: 6px 0; font-size: 13px; color: #FFFFFF; font-weight: 700;">${escapeHtml(data.motorcycleName)}</td>
            </tr>`
                : ""
            }
            <tr>
              <td style="padding: 6px 0; font-size: 13px; color: #8C92A0; vertical-align: top;">Vaš e-naslov:</td>
              <td style="padding: 6px 0; font-size: 13px; color: #F5F5F5;">${escapeHtml(data.email)}</td>
            </tr>
            ${
              data.phone
                ? `<tr>
              <td style="padding: 6px 0; font-size: 13px; color: #8C92A0; vertical-align: top;">Vaš telefon:</td>
              <td style="padding: 6px 0; font-size: 13px; color: #F5F5F5;">${escapeHtml(data.phone)}</td>
            </tr>`
                : ""
            }
          </table>
        </td>
      </tr>
    </table>

    <!-- Blok sporočila -->
    <div style="margin-bottom: 28px;">
      <div style="font-size: 12px; font-weight: 700; color: #8C92A0; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
        Vaše vprašanje oz. sporočilo:
      </div>
      <div style="background-color: #15161A; border-left: 3px solid #E31B2B; border-radius: 0 8px 8px 0; padding: 16px 18px; font-size: 14px; line-height: 22px; color: #E8E8E8; font-style: normal; white-space: pre-wrap;">${escapeHtml(data.message)}</div>
    </div>

    <!-- Opozorilo / Naslednji koraki -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #1A2230; border: 1px solid #2B3A54; border-radius: 8px; padding: 14px 18px; margin-bottom: 28px;">
      <tr>
        <td style="vertical-align: top; width: 28px; font-size: 18px;">ℹ️</td>
        <td style="font-size: 13px; line-height: 20px; color: #BACDE5;">
          <strong style="color: #FFFFFF;">Kaj sledi?</strong> To sporočilo je potrdilo o prejetem povpraševanju (in še ne pomeni potrditve nakupa ali rezervacije). Oglasili se vam bomo takoj, ko pregledamo podrobnosti.
        </td>
      </tr>
    </table>

    <!-- Gumbi / Hitre povezave -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center" style="padding-bottom: 8px;">
          <table role="presentation" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center" style="border-radius: 8px; background-color: #E31B2B;">
                <a href="${baseUrl}/motorji" target="_blank" style="font-size: 14px; font-weight: 800; color: #FFFFFF; text-decoration: none; padding: 14px 28px; display: inline-block; letter-spacing: 1px; text-transform: uppercase;">
                  Preglej ponudbo motorjev &rarr;
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center">
          <p style="margin: 10px 0 0 0; font-size: 13px; color: #8C92A0;">
            Imate vprašanje? Pokličite nas: <a href="tel:${site.phoneTel}" style="color: #FFFFFF; font-weight: 700; text-decoration: underline;">${escapeHtml(site.phoneDisplay)}</a>
          </p>
        </td>
      </tr>
    </table>
  `;

  return {
    subject,
    text,
    html: emailShell({
      preheader: `Prejeli smo vaše povpraševanje za EL-MOTO (${data.typeLabel}). Hvala!`,
      content,
    }),
  };
}

/**
 * 2. Obrazec / e-sporočilo za PREJEMNIKA (EL-MOTO ekipa - skrbniško obvestilo o novem kontaktu)
 */
export function buildRecipientInquiryEmail(data: InquiryEmailData): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `[Novo povpraševanje] ${data.name} &bull; ${data.typeLabel}`;
  const baseUrl = siteUrl();

  const text = [
    `NOVO POVPRAŠEVANJE NA SPLETNI STRANI EL-MOTO`,
    `============================================`,
    `Številka / ID: ${data.inquiryId}`,
    `Vrsta: ${data.typeLabel}`,
    data.motorcycleName ? `Motor: ${data.motorcycleName}` : "Motor: ni vezano na določen motor",
    "",
    `STRANKA:`,
    `Ime in priimek: ${data.name}`,
    `E-pošta: ${data.email}`,
    `Telefon: ${data.phone || "ni naveden"}`,
    "",
    `SPOROČILO STRANKE:`,
    data.message,
    "",
    `============================================`,
    `Skrbništvo: ${baseUrl}/skrbnistvo`,
  ].join("\n");

  const content = `
    <!-- Značka za admin obvestilo -->
    <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
      <tr>
        <td style="background-color: #E31B2B; border-radius: 6px; padding: 6px 14px;">
          <span style="font-size: 11px; font-weight: 800; color: #FFFFFF; letter-spacing: 1.5px; text-transform: uppercase;">
            ★ Novo povpraševanje stranke
          </span>
        </td>
      </tr>
    </table>

    <h1 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">
      Novo sporočilo s kontaktnega obrazca
    </h1>
    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 22px; color: #B9BDC5;">
      Preko spletnega obrazca na <strong style="color: #FFFFFF;">elmoto.si</strong> je prispelo novo povpraševanje. Spodaj so zbrani vsi kontaktni podatki za hiter odziv.
    </p>

    <!-- Glavna kartica stranke -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #22242B; border: 1px solid #2E323C; border-radius: 10px; margin-bottom: 22px; overflow: hidden;">
      <tr>
        <td style="padding: 12px 20px; background-color: #272A33; border-bottom: 1px solid #323642;">
          <span style="font-size: 11px; font-weight: 800; color: #8EADD4; letter-spacing: 1.2px; text-transform: uppercase;">
            Podatki o stranki in povpraševanju
          </span>
        </td>
      </tr>
      <tr>
        <td style="padding: 18px 20px;">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding: 7px 0; font-size: 13px; color: #8C92A0; width: 34%; vertical-align: top;">Ime in priimek:</td>
              <td style="padding: 7px 0; font-size: 15px; color: #FFFFFF; font-weight: 700;">${escapeHtml(data.name)}</td>
            </tr>
            <tr>
              <td style="padding: 7px 0; font-size: 13px; color: #8C92A0; vertical-align: top;">E-poštni naslov:</td>
              <td style="padding: 7px 0; font-size: 14px; color: #F5F5F5;">
                <a href="mailto:${escapeHtml(data.email)}" style="color: #8EADD4; font-weight: 600; text-decoration: underline;">
                  ${escapeHtml(data.email)}
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding: 7px 0; font-size: 13px; color: #8C92A0; vertical-align: top;">Telefonska št.:</td>
              <td style="padding: 7px 0; font-size: 14px; color: #F5F5F5;">
                ${
                  data.phone
                    ? `<a href="tel:${escapeHtml(data.phone)}" style="color: #25D366; font-weight: 700; text-decoration: none;">
                    📞 ${escapeHtml(data.phone)}
                  </a>`
                    : `<span style="color: #6C7280; font-style: italic;">Ni navedena</span>`
                }
              </td>
            </tr>
            <tr>
              <td style="padding: 7px 0; font-size: 13px; color: #8C92A0; vertical-align: top;">Vrsta povpraševanja:</td>
              <td style="padding: 7px 0; font-size: 13px; color: #FFFFFF; font-weight: 700;">
                <span style="display: inline-block; background-color: #18191E; border: 1px solid #373A46; padding: 3px 10px; border-radius: 4px; color: #FF4D5E;">
                  ${escapeHtml(data.typeLabel)}
                </span>
              </td>
            </tr>
            ${
              data.motorcycleName
                ? `<tr>
              <td style="padding: 7px 0; font-size: 13px; color: #8C92A0; vertical-align: top;">Izbrani motor:</td>
              <td style="padding: 7px 0; font-size: 14px; color: #FFFFFF; font-weight: 800;">
                🏍️ ${escapeHtml(data.motorcycleName)}
              </td>
            </tr>`
                : ""
            }
            <tr>
              <td style="padding: 7px 0; font-size: 13px; color: #8C92A0; vertical-align: top;">ID v bazi:</td>
              <td style="padding: 7px 0; font-size: 12px; color: #7B818F; font-family: monospace;">${escapeHtml(data.inquiryId)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Vsebina sporočila -->
    <div style="margin-bottom: 26px;">
      <div style="font-size: 12px; font-weight: 700; color: #8C92A0; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
        Vsebina sporočila stranke:
      </div>
      <div style="background-color: #141518; border: 1px solid #2B2E37; border-left: 4px solid #E31B2B; border-radius: 0 8px 8px 0; padding: 18px 20px; font-size: 14px; line-height: 22px; color: #F5F5F5; white-space: pre-wrap;">${escapeHtml(data.message)}</div>
    </div>

    <!-- Hitra dejanja za ekipo -->
    <div style="background-color: #1D1F25; border: 1px solid #282B33; border-radius: 10px; padding: 20px; text-align: center;">
      <div style="font-size: 12px; font-weight: 700; color: #8EADD4; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px;">
        Hitra dejanja za odziv:
      </div>
      <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center">
        <tr>
          <td style="padding: 0 6px;">
            <a href="mailto:${escapeHtml(data.email)}?subject=${encodeURIComponent(`Re: Vaše povpraševanje | EL-MOTO`)}" style="background-color: #E31B2B; color: #FFFFFF; font-size: 13px; font-weight: 800; padding: 10px 18px; border-radius: 6px; text-decoration: none; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px;">
              ✉ Odgovori stranki
            </a>
          </td>
          ${
            data.phone
              ? `<td style="padding: 0 6px;">
            <a href="tel:${escapeHtml(data.phone)}" style="background-color: #272A33; border: 1px solid #3A3E4B; color: #FFFFFF; font-size: 13px; font-weight: 700; padding: 10px 18px; border-radius: 6px; text-decoration: none; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px;">
              📞 Pokliči stranko
            </a>
          </td>`
              : ""
          }
          <td style="padding: 0 6px;">
            <a href="${baseUrl}/skrbnistvo" target="_blank" style="background-color: #18191E; border: 1px solid #3A3E4B; color: #B9BDC5; font-size: 13px; font-weight: 700; padding: 10px 18px; border-radius: 6px; text-decoration: none; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px;">
              ⚙ Skrbništvo
            </a>
          </td>
        </tr>
      </table>
    </div>
  `;

  return {
    subject,
    text,
    html: emailShell({
      preheader: `Novo povpraševanje: ${data.name} (${data.typeLabel})${data.motorcycleName ? ` za ${data.motorcycleName}` : ""}`,
      content,
    }),
  };
}

/**
 * 3. Najem - Obrazec / e-sporočilo za POŠILJATELJA
 */
export function buildSenderRentalEmail(data: RentalEmailData): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `Prejeli smo povpraševanje za najem | EL-MOTO`;
  const baseUrl = siteUrl();

  const text = [
    `Pozdravljeni, ${data.name}!`,
    "",
    `Vaše povpraševanje za najem motorja ${data.motorcycleName} je bilo uspešno sprejeto.`,
    "OPOZORILO: To še ni potrjena rezervacija. Rezervacija začne veljati šele po naši potrditvi.",
    "",
    "PODROBNOSTI NAJEMA:",
    `--------------------------------------`,
    `Motor: ${data.motorcycleName}`,
    `Prevzem: ${data.pickupDate} ${data.pickupTime}`,
    `Vračilo: ${data.returnDate} ${data.returnTime}`,
    `Število dni: ${data.days}`,
    `Okvirni znesek: ${data.quotedCents != null ? `${data.quotedCents / 100} €` : "Po dogovoru"}`,
    `Vozniško dovoljenje: ${data.licenseCategory}`,
    "",
    `EL-MOTO d.o.o.`,
    `${site.street}, ${site.postalCode} ${site.city}`,
    `Tel: ${site.phoneDisplay}`,
  ].join("\n");

  const content = `
    <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
      <tr>
        <td style="background-color: rgba(227, 27, 43, 0.14); border: 1px solid rgba(227, 27, 43, 0.4); border-radius: 6px; padding: 6px 14px;">
          <span style="font-size: 11px; font-weight: 700; color: #FF4D5E; letter-spacing: 1.5px; text-transform: uppercase;">
            ✓ Povpraševanje za najem sprejeto
          </span>
        </td>
      </tr>
    </table>

    <h1 style="margin: 0 0 12px 0; font-size: 26px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">
      Pozdravljeni, ${escapeHtml(data.name)}!
    </h1>
    <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 24px; color: #B9BDC5;">
      Prejeli smo vaše povpraševanje za najem motorja <strong style="color: #FFFFFF;">${escapeHtml(data.motorcycleName)}</strong>. V kratkem bomo preverili razpoložljivost in vas kontaktirali glede potrditve rezervacije.
    </p>

    <!-- Kartica podrobnosti najema -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #22242B; border: 1px solid #2E323C; border-radius: 10px; margin-bottom: 24px; overflow: hidden;">
      <tr>
        <td style="padding: 14px 20px; background-color: #272A33; border-bottom: 1px solid #323642;">
          <span style="font-size: 12px; font-weight: 700; color: #8EADD4; letter-spacing: 1.2px; text-transform: uppercase;">
            Povzetek želenega termina
          </span>
        </td>
      </tr>
      <tr>
        <td style="padding: 18px 20px;">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding: 6px 0; font-size: 13px; color: #8C92A0; width: 36%;">Motor:</td>
              <td style="padding: 6px 0; font-size: 15px; color: #FFFFFF; font-weight: 800;">${escapeHtml(data.motorcycleName)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 13px; color: #8C92A0;">Prevzem:</td>
              <td style="padding: 6px 0; font-size: 14px; color: #F5F5F5; font-weight: 600;">📅 ${escapeHtml(data.pickupDate)} ob ${escapeHtml(data.pickupTime)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 13px; color: #8C92A0;">Vračilo:</td>
              <td style="padding: 6px 0; font-size: 14px; color: #F5F5F5; font-weight: 600;">📅 ${escapeHtml(data.returnDate)} ob ${escapeHtml(data.returnTime)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 13px; color: #8C92A0;">Trajanje:</td>
              <td style="padding: 6px 0; font-size: 14px; color: #F5F5F5;">${data.days} ${data.days === 1 ? "dan" : data.days === 2 ? "dneva" : data.days <= 4 ? "dni" : "dni"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 13px; color: #8C92A0;">Okvirna cena:</td>
              <td style="padding: 6px 0; font-size: 16px; color: #FF4D5E; font-weight: 800;">
                ${data.quotedCents != null ? `${(data.quotedCents / 100).toFixed(2)} €` : "Po dogovoru"}
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 13px; color: #8C92A0;">Vozniško dovoljenje:</td>
              <td style="padding: 6px 0; font-size: 13px; color: #F5F5F5;">Kategorija ${escapeHtml(data.licenseCategory)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #2D1D1F; border: 1px solid #572A2E; border-radius: 8px; padding: 14px 18px; margin-bottom: 28px;">
      <tr>
        <td style="vertical-align: top; width: 28px; font-size: 18px;">⚠️</td>
        <td style="font-size: 13px; line-height: 20px; color: #F0B4B8;">
          <strong style="color: #FFFFFF;">Pomembno opozorilo:</strong> Oddano povpraševanje še ne pomeni sklenjene pogodbe ali rezervacije. Rezervacija postane veljavna šele, ko prejmete našo uradno potrditev.
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center">
          <a href="${baseUrl}/najem" target="_blank" style="background-color: #E31B2B; color: #FFFFFF; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 28px; border-radius: 8px; display: inline-block; letter-spacing: 1px; text-transform: uppercase;">
            Pogoji in cenik najema &rarr;
          </a>
        </td>
      </tr>
    </table>
  `;

  return {
    subject,
    text,
    html: emailShell({
      preheader: `Prejeli smo vaše povpraševanje za najem ${data.motorcycleName} pri EL-MOTO.`,
      content,
    }),
  };
}

/**
 * 4. Najem - Obrazec / e-sporočilo za PREJEMNIKA (EL-MOTO skrbništvo)
 */
export function buildRecipientRentalEmail(data: RentalEmailData): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `[Najem motorja] ${data.motorcycleName} &bull; ${data.name}`;
  const baseUrl = siteUrl();

  const text = [
    `NOVO POVPRAŠEVANJE ZA NAJEM MOTORJA`,
    `==================================`,
    `ID rezervacije: ${data.bookingId}`,
    `Motor: ${data.motorcycleName}`,
    `Stranka: ${data.name}`,
    `E-pošta: ${data.email}`,
    `Telefon: ${data.phone}`,
    `Kategorija izpita: ${data.licenseCategory}`,
    `Prevzem: ${data.pickupDate} ob ${data.pickupTime}`,
    `Vračilo: ${data.returnDate} ob ${data.returnTime}`,
    `Dni: ${data.days}`,
    `Informativni znesek: ${data.quotedCents != null ? `${data.quotedCents / 100} EUR` : "ni potrjen"}`,
    data.message ? `Sporočilo: ${data.message}` : null,
    `==================================`,
  ]
    .filter(Boolean)
    .join("\n");

  const content = `
    <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
      <tr>
        <td style="background-color: #E31B2B; border-radius: 6px; padding: 6px 14px;">
          <span style="font-size: 11px; font-weight: 800; color: #FFFFFF; letter-spacing: 1.5px; text-transform: uppercase;">
            ★ Novo povpraševanje za najem
          </span>
        </td>
      </tr>
    </table>

    <h1 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">
      Novo povpraševanje: ${escapeHtml(data.motorcycleName)}
    </h1>
    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 22px; color: #B9BDC5;">
      Stranka se zanima za najem motorja. Preveri razpoložljivost v koledarju in potrdi termin.
    </p>

    <!-- Kartica podatkov -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #22242B; border: 1px solid #2E323C; border-radius: 10px; margin-bottom: 24px; overflow: hidden;">
      <tr>
        <td style="padding: 12px 20px; background-color: #272A33; border-bottom: 1px solid #323642;">
          <span style="font-size: 11px; font-weight: 800; color: #8EADD4; letter-spacing: 1.2px; text-transform: uppercase;">
            Podrobnosti termina in stranke
          </span>
        </td>
      </tr>
      <tr>
        <td style="padding: 18px 20px;">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding: 7px 0; font-size: 13px; color: #8C92A0; width: 34%;">Motor:</td>
              <td style="padding: 7px 0; font-size: 15px; color: #FFFFFF; font-weight: 800;">🏍️ ${escapeHtml(data.motorcycleName)}</td>
            </tr>
            <tr>
              <td style="padding: 7px 0; font-size: 13px; color: #8C92A0;">Stranka:</td>
              <td style="padding: 7px 0; font-size: 14px; color: #FFFFFF; font-weight: 700;">${escapeHtml(data.name)}</td>
            </tr>
            <tr>
              <td style="padding: 7px 0; font-size: 13px; color: #8C92A0;">E-pošta:</td>
              <td style="padding: 7px 0; font-size: 14px; color: #8EADD4;"><a href="mailto:${escapeHtml(data.email)}" style="color: #8EADD4; text-decoration: underline;">${escapeHtml(data.email)}</a></td>
            </tr>
            <tr>
              <td style="padding: 7px 0; font-size: 13px; color: #8C92A0;">Telefon:</td>
              <td style="padding: 7px 0; font-size: 14px; color: #25D366; font-weight: 700;"><a href="tel:${escapeHtml(data.phone)}" style="color: #25D366; text-decoration: none;">📞 ${escapeHtml(data.phone)}</a></td>
            </tr>
            <tr>
              <td style="padding: 7px 0; font-size: 13px; color: #8C92A0;">Dovoljenje:</td>
              <td style="padding: 7px 0; font-size: 13px; color: #F5F5F5;">Kategorija ${escapeHtml(data.licenseCategory)}</td>
            </tr>
            <tr>
              <td style="padding: 7px 0; font-size: 13px; color: #8C92A0;">Termin:</td>
              <td style="padding: 7px 0; font-size: 13px; color: #F5F5F5;">Od <strong>${escapeHtml(data.pickupDate)} ${escapeHtml(data.pickupTime)}</strong><br>do <strong>${escapeHtml(data.returnDate)} ${escapeHtml(data.returnTime)}</strong> (${data.days} dni)</td>
            </tr>
            <tr>
              <td style="padding: 7px 0; font-size: 13px; color: #8C92A0;">Informativni znesek:</td>
              <td style="padding: 7px 0; font-size: 15px; color: #FF4D5E; font-weight: 800;">${data.quotedCents != null ? `${(data.quotedCents / 100).toFixed(2)} €` : "Ni potrjen"}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${
      data.message
        ? `<div style="margin-bottom: 24px;">
      <div style="font-size: 12px; font-weight: 700; color: #8C92A0; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Sporočilo stranke:</div>
      <div style="background-color: #141518; border: 1px solid #2B2E37; border-left: 4px solid #E31B2B; border-radius: 0 8px 8px 0; padding: 16px 18px; font-size: 14px; line-height: 22px; color: #F5F5F5; white-space: pre-wrap;">${escapeHtml(data.message)}</div>
    </div>`
        : ""
    }

    <div style="background-color: #1D1F25; border: 1px solid #282B33; border-radius: 10px; padding: 18px; text-align: center;">
      <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center">
        <tr>
          <td style="padding: 0 6px;">
            <a href="mailto:${escapeHtml(data.email)}?subject=${encodeURIComponent(`Re: Najem motorja ${data.motorcycleName} | EL-MOTO`)}" style="background-color: #E31B2B; color: #FFFFFF; font-size: 13px; font-weight: 800; padding: 10px 18px; border-radius: 6px; text-decoration: none; display: inline-block; text-transform: uppercase;">
              ✉ Odgovori
            </a>
          </td>
          <td style="padding: 0 6px;">
            <a href="tel:${escapeHtml(data.phone)}" style="background-color: #272A33; border: 1px solid #3A3E4B; color: #FFFFFF; font-size: 13px; font-weight: 700; padding: 10px 18px; border-radius: 6px; text-decoration: none; display: inline-block; text-transform: uppercase;">
              📞 Pokliči
            </a>
          </td>
          <td style="padding: 0 6px;">
            <a href="${baseUrl}/skrbnistvo/rezervacije" target="_blank" style="background-color: #18191E; border: 1px solid #3A3E4B; color: #B9BDC5; font-size: 13px; font-weight: 700; padding: 10px 18px; border-radius: 6px; text-decoration: none; display: inline-block; text-transform: uppercase;">
              ⚙ Rezervacije
            </a>
          </td>
        </tr>
      </table>
    </div>
  `;

  return {
    subject,
    text,
    html: emailShell({
      preheader: `Novo povpraševanje za najem: ${data.motorcycleName} - ${data.name}`,
      content,
    }),
  };
}
