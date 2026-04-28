let bearerCache = {
  token: null,
  expiresAt: 0
};

export async function getTcgBearerToken() {
  const now = Date.now();

  if (bearerCache.token && bearerCache.expiresAt > now + 60_000) {
    return bearerCache.token;
  }

  const publicKey = process.env.TCGPLAYER_PUBLIC_KEY;
  const privateKey = process.env.TCGPLAYER_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    throw new Error("Missing TCGPLAYER_PUBLIC_KEY or TCGPLAYER_PRIVATE_KEY.");
  }

  const apiBase = process.env.TCGPLAYER_API_BASE || "https://api.tcgplayer.com";
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: publicKey,
    client_secret: privateKey
  });

  const response = await fetch(`${apiBase}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json"
    },
    body
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`TCGplayer token request failed: HTTP ${response.status} ${text}`);
  }

  const data = await response.json();
  const token = data.access_token || data.accessToken;

  if (!token) {
    throw new Error("TCGplayer token response did not include access_token.");
  }

  const expiresInSec = Number(data.expires_in || data.expiresIn || 1209600);
  bearerCache = {
    token,
    expiresAt: now + Math.max(60, expiresInSec - 60) * 1000
  };

  return token;
}

export function clearTcgAuthCache() {
  bearerCache = {
    token: null,
    expiresAt: 0
  };
}
