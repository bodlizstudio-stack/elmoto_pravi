import { CookieBanner } from "@/components/cookie-banner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSettings } from "@/lib/settings";
import { avtoNetUrl, site, siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: site.brand,
    description: "Novi in rabljeni motorji v Trzinu. Pooblaščeni prodajalec KOVE.",
    url: siteUrl(),
    telephone: settings.phoneTel,
    email: settings.email,
    image: `${siteUrl()}/logo.svg`,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.street,
      postalCode: settings.postalCode,
      addressLocality: settings.city,
      addressCountry: site.countryCode,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.lat,
      longitude: site.lng,
    },
    sameAs: [settings.instagram, settings.facebook, avtoNetUrl],
    areaServed: ["Trzin", "Ljubljana", "Slovenija"],
  };

  return (
    <div className="public-site min-h-screen bg-[#111216] text-[#F5F5F5]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader
        phoneDisplay={settings.phoneDisplay}
        phoneTel={settings.phoneTel}
        whatsappUrl={settings.whatsappUrl}
        facebook={settings.facebook}
        instagram={settings.instagram}
      />
      <CookieBanner />
      <main id="vsebina">{children}</main>
      <SiteFooter
        phone={settings.phoneDisplay}
        phoneTel={settings.phoneTel}
        email={settings.email}
        instagram={settings.instagram}
        facebook={settings.facebook}
        street={settings.street}
        postalCode={settings.postalCode}
        city={settings.city}
        hours={settings.hours}
        newsletter={settings.newsletterEnabled}
      />
    </div>
  );
}
