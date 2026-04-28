const SCRYFALL_API = "https://api.scryfall.com";

export async function enrichCardsWithScryfall(cards) {
  if (!Array.isArray(cards) || cards.length === 0) return cards;

  const identifiers = cards
    .map((card) => cleanCardName(card.name))
    .filter(Boolean)
    .map((name) => ({ name }));

  if (!identifiers.length) return cards;

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
        byName.set(normalizeName(scryCard.name), scryCard);

        // Double-faced cards sometimes have "Front // Back"; also map front face.
        if (Array.isArray(scryCard.card_faces) && scryCard.card_faces[0]?.name) {
          byName.set(normalizeName(scryCard.card_faces[0].name), scryCard);
        }
      }

      // Scryfall asks clients to be polite. Small delay between batches.
      if (i < chunks.length - 1) {
        await wait(90);
      }
    } catch (error) {
      console.warn("[Scryfall] enrichment failed:", error.message);
    }
  }

  return cards.map((card) => {
    const scryCard =
      byName.get(normalizeName(card.name)) ||
      byName.get(normalizeName(cleanCardName(card.name)));

    if (!scryCard) return card;

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

    return {
      ...card,
      // Preserve tcgapi.dev pricing/ranking, but trust Scryfall for public card identity.
      name: scryCard.name || card.name,
      set: String(scryCard.set || card.set || "").toUpperCase(),
      setName: scryCard.set_name || card.setName,
      rarity: titleCase(scryCard.rarity || card.rarity),
      colors,
      formats,
      typeLine: scryCard.type_line || card.typeLine,
      imageUrl,
      tcgplayerId: card.tcgplayerId || scryCard.tcgplayer_id || null,
      productUrl:
        scryCard.purchase_uris?.tcgplayer ||
        (scryCard.tcgplayer_id ? `https://www.tcgplayer.com/product/${scryCard.tcgplayer_id}` : card.productUrl)
    };
  });
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

function cleanCardName(name) {
  return String(name || "")
    .replace(/\s+Demo\s+\d+$/i, "")
    .replace(/\s+\(\d+\)$/i, "")
    .trim();
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
