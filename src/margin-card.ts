/** Preserve the complete selected passage while normalising PDF text-layer
 * whitespace for a readable margin-card quotation. */
export function marginCardSourceText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

const FOLDED_CARD_MIN_HEIGHT = 48;
const FOLDED_CARD_MAX_HEIGHT = 132;

/** A logarithmic fold keeps length legible without letting several long notes
 * consume the rail. Every additional passage still makes the resting card
 * taller, but progressively less so. */
export function foldedMarginCardHeight(displayUnits: number): number {
  const units = Math.max(0, displayUnits);
  const scaled = FOLDED_CARD_MIN_HEIGHT + 14 * Math.log2(1 + units / 42);
  return Math.round(Math.min(FOLDED_CARD_MAX_HEIGHT, scaled));
}

function displayUnits(text: string, weight = 1): number {
  const lineBreaks = (text.match(/\n/g) ?? []).length;
  const wideCharacters = (text.match(/[\u2e80-\u9fff\uf900-\ufaff]/g) ?? []).length;
  return (text.length + lineBreaks * 24 + wideCharacters * 0.65) * weight;
}

/** Textareas do not grow with their value by default. Size every margin-card
 * editor to its content so the card's natural height reflects the annotation
 * length; the card itself supplies the collapsed/expanded viewport rules. */
export function syncMarginCardPresentation(card: HTMLElement): void {
  for (const textarea of card.querySelectorAll<HTMLTextAreaElement>("textarea")) {
    textarea.style.height = "auto";
    textarea.style.height = `${Math.max(textarea.scrollHeight, 20)}px`;
  }

  const note = card.querySelector<HTMLTextAreaElement>(".lpa-margin-note")?.value ?? "";
  const sideNote = card.querySelector<HTMLTextAreaElement>(".lpa-margin-side-note")?.value ?? "";
  const source = card.querySelector<HTMLElement>(".lpa-margin-source")?.textContent ?? "";
  // User-authored comments are the strongest signal; the quoted source still
  // contributes enough to distinguish short and long selected passages.
  const units = displayUnits(note) + displayUnits(sideNote) + displayUnits(source, 0.55);
  const foldedHeight = foldedMarginCardHeight(units);
  card.style.setProperty("--lpa-card-folded-height", `${foldedHeight}px`);
  card.classList.toggle("is-folded", foldedHeight > FOLDED_CARD_MIN_HEIGHT + 8);
}
