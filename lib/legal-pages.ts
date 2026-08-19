import type { Block } from "@/lib/types/blocks";
import { nanoid } from "@/lib/types/nanoid";

export type LegalKind = "privacy" | "voorwaarden" | "cookies";

export const LEGAL_PAGES: { kind: LegalKind; title: string; slug: string }[] = [
  { kind: "privacy", title: "Privacyverklaring", slug: "privacy" },
  { kind: "voorwaarden", title: "Algemene voorwaarden", slug: "voorwaarden" },
  { kind: "cookies", title: "Cookieverklaring", slug: "cookies" },
];

function heading(text: string, level: 1 | 2 = 1): Block {
  return { id: nanoid(), type: "heading", props: { text, level, align: "left" } };
}

function text(html: string): Block {
  return { id: nanoid(), type: "text", props: { html, align: "left" } };
}

export function legalBlocks(siteName: string, kind: LegalKind): Block[] {
  const today = new Date().toLocaleDateString("nl-NL");

  if (kind === "privacy") {
    return [
      heading("Privacyverklaring"),
      text(`<p>Laatst bijgewerkt: ${today}. ${siteName} respecteert je privacy en verwerkt persoonsgegevens zorgvuldig, in lijn met de AVG.</p>`),
      heading("Welke gegevens verzamelen we?", 2),
      text("<p>Via het contactformulier ontvangen we naam, e-mailadres, eventueel een onderwerp en je bericht. Als je cookies accepteert kunnen we anonieme statistieken bijhouden.</p>"),
      heading("Waarvoor gebruiken we die gegevens?", 2),
      text("<p>We gebruiken contactgegevens alleen om je vraag te beantwoorden. We verkopen je gegevens niet aan derden.</p>"),
      heading("Bewaartermijn", 2),
      text("<p>Berichten bewaren we zolang nodig is om je vraag af te handelen, daarna verwijderen we ze of anonimiseren we ze.</p>"),
      heading("Jouw rechten", 2),
      text("<p>Je hebt recht op inzage, correctie en verwijdering van je gegevens. Stuur daarvoor een e-mail via de contactgegevens op deze website.</p>"),
    ];
  }

  if (kind === "voorwaarden") {
    return [
      heading("Algemene voorwaarden"),
      text(`<p>Laatst bijgewerkt: ${today}. Deze voorwaarden gelden voor het gebruik van de website van ${siteName}.</p>`),
      heading("Aanbod en inhoud", 2),
      text("<p>We doen ons best om informatie actueel en juist te houden. Aan de inhoud van deze website kunnen geen rechten worden ontleend.</p>"),
      heading("Aansprakelijkheid", 2),
      text("<p>We zijn niet aansprakelijk voor schade door het gebruik van deze website of door tijdelijke onbeschikbaarheid, voor zover de wet dat toelaat.</p>"),
      heading("Wijzigingen", 2),
      text("<p>We mogen deze voorwaarden aanpassen. De nieuwe versie geldt vanaf publicatie op deze pagina.</p>"),
    ];
  }

  return [
    heading("Cookieverklaring"),
    text(`<p>Laatst bijgewerkt: ${today}. ${siteName} gebruikt cookies om de website te laten werken en, als je dat toestaat, om het gebruik te begrijpen.</p>`),
    heading("Noodzakelijke cookies", 2),
    text("<p>Deze cookies onthouden je cookiekeuze. Zonder deze cookies werkt de banner niet goed. Ze bevatten geen persoonsgegevens.</p>"),
    heading("Statistieken", 2),
    text("<p>Als je statistieken accepteert, kunnen we anonieme bezoekcijfers zien (bijvoorbeeld via Plausible). We gebruiken geen tracking-cookies van adverteerders.</p>"),
    heading("Je keuze wijzigen", 2),
    text("<p>Je kunt je keuze later wissen via de instellingen van je browser. Daarna verschijnt de cookie-banner opnieuw.</p>"),
  ];
}
