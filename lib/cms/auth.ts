import { getCloudflareContext } from "@opennextjs/cloudflare";

// /admin and /api/admin/* sit behind a Cloudflare Access application (one-time PIN to the
// client's email). Access adds a signed JWT to every request it lets through; this verifies it
// independently, so the admin stays locked even if the Access app is misconfigured or removed,
// or the Worker is reached by a route Access doesn't cover. Fails closed when unconfigured.
declare global {
  interface CloudflareEnv {
    /** e.g. "ocd.cloudflareaccess.com" — Zero Trust → Settings → Custom pages → Team domain. */
    ACCESS_TEAM_DOMAIN: string;
    /** The Access application's "Application Audience (AUD) Tag". */
    ACCESS_AUD: string;
  }
}

export type AdminIdentity = { email: string };

type Jwk = JsonWebKey & { kid: string };
let jwksCache: { domain: string; keys: Jwk[]; fetchedAt: number } | null = null;
const JWKS_TTL_MS = 60 * 60 * 1000;

function b64urlDecode(input: string): Uint8Array<ArrayBuffer> {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function signingKeys(domain: string, forceRefresh: boolean): Promise<Jwk[]> {
  if (!forceRefresh && jwksCache?.domain === domain && Date.now() - jwksCache.fetchedAt < JWKS_TTL_MS) {
    return jwksCache.keys;
  }
  const res = await fetch(`https://${domain}/cdn-cgi/access/certs`);
  if (!res.ok) throw new Error(`Access certs fetch failed: ${res.status}`);
  const { keys } = (await res.json()) as { keys: Jwk[] };
  jwksCache = { domain, keys, fetchedAt: Date.now() };
  return keys;
}

async function verifyAccessJwt(token: string, domain: string, aud: string): Promise<AdminIdentity | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [rawHeader, rawPayload, rawSig] = parts;
  const header = JSON.parse(new TextDecoder().decode(b64urlDecode(rawHeader))) as { alg?: string; kid?: string };
  if (header.alg !== "RS256" || !header.kid) return null;

  // Access rotates its keys; one forced refresh covers a kid we haven't seen yet.
  let jwk = (await signingKeys(domain, false)).find((k) => k.kid === header.kid);
  jwk ??= (await signingKeys(domain, true)).find((k) => k.kid === header.kid);
  if (!jwk) return null;

  const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    b64urlDecode(rawSig),
    new TextEncoder().encode(`${rawHeader}.${rawPayload}`),
  );
  if (!valid) return null;

  const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(rawPayload))) as {
    aud?: string | string[];
    exp?: number;
    nbf?: number;
    iss?: string;
    email?: string;
  };
  const now = Math.floor(Date.now() / 1000);
  const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!audiences.includes(aud)) return null;
  if (!payload.exp || payload.exp < now) return null;
  if (payload.nbf && payload.nbf > now + 60) return null;
  if (payload.iss !== `https://${domain}`) return null;
  return { email: payload.email ?? "" };
}

/** Returns who's signed in, or null (→ 403). Bypassed only under `next dev`. */
export async function requireAdmin(headers: Headers): Promise<AdminIdentity | null> {
  if (process.env.NODE_ENV === "development") return { email: "dev@localhost" };

  const { env } = await getCloudflareContext({ async: true });
  const domain = env.ACCESS_TEAM_DOMAIN?.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
  const aud = env.ACCESS_AUD?.trim();
  if (!domain || !aud) {
    console.error("[admin] ACCESS_TEAM_DOMAIN / ACCESS_AUD not set — admin is locked");
    return null;
  }
  const token = headers.get("cf-access-jwt-assertion");
  if (!token) return null;
  try {
    return await verifyAccessJwt(token, domain, aud);
  } catch (err) {
    console.error("[admin] Access token check failed", err);
    return null;
  }
}
