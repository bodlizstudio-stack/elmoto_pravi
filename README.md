# EL-MOTO

Spletna stran za prodajo in najem motornih koles. Javni del je v slovenščini. Administracija omogoča vnos motorjev, fotografij, najema, povpraševanj in vsebin.

Lokalno teče na [http://localhost:3000](http://localhost:3000).

## Lokalni zagon

Potrebujete Node.js 20 ali novejši.

```bash
npm install
npx prisma db push
npx prisma db seed
npm run dev
```

Odprite http://localhost:3000.

Administracija: http://localhost:3000/admin/prijava

Javne registracije ni. Prvega administratorja ustvariš z `npm run admin:ustvari`, ko sta v okolju `ADMIN_EMAIL` in geslo z vsaj 12 znaki. Ukaz obstoječega gesla ne prepiše in ne pošlje e-pošte. Seed gesla ne ponastavlja.

Pozabljeno geslo: `npm run admin:ponastavi` izpiše enkratno lokalno povezavo, veljavno 30 minut. Povezave ne pošiljaj po e-pošti. Prijavljen skrbnik geslo zamenja na http://localhost:3000/admin/geslo.

Lokalni račun, ki že obstaja v bazi, pred gostovanjem zamenjaj. Gesla ni v kodi strani.

## Baza

Lokalno se uporablja SQLite prek Prisme, ker na tem računalniku ni nameščen PostgreSQL. Shema je v `prisma/schema.prisma`.

Za produkcijo z PostgreSQL:

1. V `prisma/schema.prisma` nastavite `provider = "postgresql"`.
2. `DATABASE_URL` nastavite na povezavo PostgreSQL.
3. Zaženite `npx prisma migrate dev --name init` in `npx prisma db seed`.

Varnostna kopija: redno shranite datoteko SQLite ali naredite `pg_dump` produkcijske baze. Kopijo hranite izven strežnika.

## E-pošta

Povpraševanje se vedno shrani v bazo. E-pošta se pošlje samo, če je nastavljen Resend (`RESEND_API_KEY`) ali SMTP (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`). Prejemnik obvestil je `NOTIFY_EMAIL` oziroma nastavitev v administraciji.

## Fotografije in ponudba

Lokalno, brez `BLOB_READ_WRITE_TOKEN`, se naložene fotografije shranijo v `public/uploads`. To je trajno na tem računalniku. Na Vercelu brez žetona nalaganje zavrne, da se fotografije ne izgubijo na začasnem disku. Za gostovanje nastavi `BLOB_READ_WRITE_TOKEN` in `DATABASE_URL` na PostgreSQL. SQLite v tej mapi je lokalna baza; kopija na Vercelu ni trajna shramba administracije.

Dovoljeni so JPG, PNG in WebP do 8 MB. HEIC ni podprt.

Javna ponudba bere isto bazo kot administracija. Arhivirani motorji in osnutki niso javni. `npm run import:instagram` ne obnavlja arhiviranih motorjev in ne prepisuje obstoječih zapisov. Instagram objave in stran KOVE niso dodatna zaloga.

## Odprto po prenovi

- Avto.net ni povezan s zalogo. Na strani je samo povezava na https://www.avto.net/EL-MOTO. Sinhronizacije oglasov ni.
- Logotipi partnerjev so uradne datoteke: Leanpay (help.leanpay.com), NLB Buy&Go (web.nlbbuygo.si), CarGarantie barvna različica (cargarantie.com, `logo-cargarantie-col.svg`).
- Fotografije modelov KOVE so z uradnih strani kove.si in niso zaloga EL-MOTO. Cene in jamstva distributerja niso prikazani kot ponudba EL-MOTO.
- Oglas `kove-800x-gt-touring-2026` ostane z naslovom KOVE 800X GT/Touring. Ni združen z uradnim modelom 800X TOURING.
- Naslov Špruha 33 je v projektnih podatkih. V tej nalogi ga naročnik po e-pošti ni posebej potrdil. Delovni čas in pogoji jamstva EL-MOTO niso vpisani.
- Moto oprema je izklopljena (`enableMotoEquipment` v `src/lib/moto-equipment.ts`).
- Produkcijska objava in sprememba DNS v tej nalogi nista bili izvedeni.

## Objava na elmoto.si

DNS zapisov in trenutne strani ne spreminjajte brez izrecnega dovoljenja. Vrednosti DNS preberi v nadzorni plošči gostovanja, ko je projekt tam ustvarjen. Teh vrednosti ne izmišljaj vnaprej.

1. Aplikacijo postavite na Node gostovanje ali Vercel.
2. Vključite HTTPS pri ponudniku.
3. Nastavite spremenljivke iz `.env.example`.
4. `NEXT_PUBLIC_SITE_URL` nastavite na `https://www.elmoto.si`, šele ko domena res kaže na to namestitev. Pred tem canonical ostane na naslovu predogleda.
5. Povežite PostgreSQL in nastavite `BLOB_READ_WRITE_TOKEN`.
6. Ustvarite administratorja z `npm run admin:ustvari` in geslo zamenjajte na `/admin/geslo`.
7. Nastavite e-pošto.
8. V administraciji potrdite pravna besedila, delovni čas in cenike.
9. Ponudbo urejajte v administraciji. Ne zaženite čiščenja ponudbe znova.
10. Šele nato preusmerite domeno na novo strežbo.

## Preverjanje

```bash
npm test
npm run build
```

## Česa stran ne počne

- Ne prikazuje izmišljenih motorjev, cen ali ocen.
- Ne izvaja spletnega plačila.
- Povpraševanje za najem ni potrjena rezervacija.
- Analitika ni vklopljena.
