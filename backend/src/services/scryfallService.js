const SCRYFALL_API = "https://api.scryfall.com";

export async function enrichCardsWithScryfall(cards, options = {}) {
  const requireMatch = options.requireMatch ?? true;

  if (!Array.isArray(cards) || cards.length === 0) return cards;

  const lookupNames = cards
    .map((card) => cleanCardName(card.name))
    .filter(Boolean);

  const identifiers = [...new Set(lookupNames)].map((name) => ({ name }));

  if (!identifiers.length) return requireMatch ? [] : cards;

  const chunks = chunkArray(identifiers, 75);
  const byName = new Map();

  for (let i = 0; i < chunks.length; i++) {
    try {
      const response = await fetch(`${SCRYFALL_API}/cards/collection`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "User-Agent": "MTGTop100Live/1.0"
        },
        body: JSON.stringify({ identifiers: chunks[i] })
      });

      if (!response.ok) {
        const text = await response.text();
        console.warn(`[Scryfall] collection failed: HTTP ${response.status} ${text}`);
        continue;
      }

      const data = await response.json();

      for (const scryCard of data.data || []) {
        addScryfallCard(byName, scryCard);
      }

      if (i < chunks.length - 1) {
        await wait(90);
      }
    } catch (error) {
      console.warn("[Scryfall] enrichment failed:", error.message);
    }
  }

  const enriched = [];

  for (const card of cards) {
    const cleaned = cleanCardName(card.name);
    const scryCard =
      byName.get(normalizeName(card.name)) ||
      byName.get(normalizeName(cleaned));

    if (!scryCard) {
      if (!requireMatch) {
        enriched.push({
          ...card,
          sourceName: card.sourceName || card.name,
          cleanName: cleaned
        });
      }
      continue;
    }

    const imageUrl =
      scryCard.image_uris?.normal ||
      scryCard.image_uris?.large ||
      scryCard.card_faces?.[0]?.image_uris?.normal ||
      scryCard.card_faces?.[0]?.image_uris?.large ||
      card.imageUrl ||
      "";

    const colors =
      Array.isArray(scryCard.color_identity) && scryCard.color_identity.length
        ? scryCard.color_identity
        : Array.isArray(scryCard.colors) && scryCard.colors.length
          ? scryCard.colors
          : card.colors;

    const formats = legalFormatsFromScryfall(scryCard.legalities, card.formats);

    enriched.push({
      ...card,

      // Keep raw provider product name for debugging, but display Scryfall identity.
      sourceName: card.sourceName || card.name,
      cleanName: cleaned,

      name: scryCard.name || cleaned || card.name,
      set: String(scryCard.set || card.set || "").toUpperCase(),
      setName: scryCard.set_name || card.setName,
      rarity: titleCase(scryCard.rarity || card.rarity),
      colors,
      formats,
      typeLine: scryCard.type_line || card.typeLine,
      imageUrl,
      tcgplayerId: card.tcgplayerId || scryCard.tcgplayer_id || null,

      // Preserve exact provider TCGplayer product link first.
      productUrl:
        card.productUrl ||
        (card.tcgplayerId ? `https://www.tcgplayer.com/product/${card.tcgplayerId}` : "") ||
        scryCard.purchase_uris?.tcgplayer ||
        (scryCard.tcgplayer_id ? `https://www.tcgplayer.com/product/${scryCard.tcgplayer_id}` : "")
    });
  }

  return enriched;
}

function addScryfallCard(map, scryCard) {
  if (!scryCard?.name) return;

  map.set(normalizeName(scryCard.name), scryCard);

  if (Array.isArray(scryCard.card_faces)) {
    for (const face of scryCard.card_faces) {
      if (face?.name) map.set(normalizeName(face.name), scryCard);
    }
  }
}

function legalFormatsFromScryfall(legalities, fallback = []) {
  if (!legalities || typeof legalities !== "object") return fallback;

  const display = {
    standard: "Standard",
    pioneer: "Pioneer",
    modern: "Modern",
    legacy: "Legacy",
    vintage: "Vintage",
    commander: "Commander",
    pauper: "Pauper",
    brawl: "Brawl",
    historic: "Historic",
    timeless: "Timeless"
  };

  const formats = Object.entries(legalities)
    .filter(([, status]) => status === "legal" || status === "restricted")
    .map(([key]) => display[key])
    .filter(Boolean);

  return formats.length ? formats : fallback;
}

export function cleanCardName(name) {
  let s = String(name || "").trim();

  // Remove demo suffixes from old sample data.
  s = s.replace(/\s+Demo\s+\d+$/i, "");

  // TCGplayer World Championship deck variants:
  // "Aeolipile - 1996 Michael Loconto (FEM) (SB)" -> "Aeolipile"
  s = s.replace(/\s+-\s+\d{4}\s+.*$/i, "");

  // Remove obvious edition/condition/slot suffixes:
  // "Animate Dead (CE)" -> "Animate Dead"
  // "Forest (B)" -> "Forest"
  s = s.replace(/\s*\((CE|IE|Intl\.?\s*Collectors'? Edition|International Edition|Collector'?s Edition|SB|MB|A|B|C|D|E|F|G|H|Oversized|Foil|Non-Foil|Etched Foil)\)\s*$/gi, "");

  // Remove common marketing suffixes after a dash.
  s = s.replace(/\s+-\s+(Borderless|Extended Art|Showcase|Retro Frame|Foil Etched|Surge Foil|Prerelease Promo|Buy-a-Box Promo|Promo Pack|Store Championship|Commander Party).*$/i, "");

  // Remove trailing set code parenthetical.
  s = s.replace(/\s*\(([A-Z0-9]{2,6})\)\s*$/g, "");

  // Remove collector-number style suffixes.
  s = s.replace(/\s+#\d+[a-z]?$/i, "");

  // Collapse extra spaces.
  s = s.replace(/\s+/g, " ").trim();

  return s;
}

function normalizeName(name) {
  return cleanCardName(name).toLowerCase();
}

function chunkArray(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function titleCase(value) {
  const s = String(value || "");
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;
}
