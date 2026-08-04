/**
 * Returns a fetch-compatible function that transparently adds WhiteBit HMAC
 * authentication headers (X-TXC-PAYLOAD, X-TXC-SIGNATURE) to every POST
 * request before it is sent. Works in Node.js and browser environments.
 *
 * Usage:
 *   import { createHmacFetch } from "@whitebit/sdk/auth";
 *
 *   const client = new WhitebitApiClient({
 *     apiKey: "YOUR_API_KEY",
 *     txcPayload: "",
 *     txcSignature: "",
 *     fetch: createHmacFetch("YOUR_API_SECRET"),
 *   });
 */
export function createHmacFetch(apiSecret: string): typeof fetch {
    return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        if (init?.method?.toUpperCase() !== "POST" || !init?.body) {
            return fetch(input, init);
        }

        const rawBody = typeof init.body === "string" ? init.body : String(init.body);
        let body: Record<string, unknown>;
        try {
            body = JSON.parse(rawBody);
        } catch {
            return fetch(input, init);
        }

        const url =
            typeof input === "string"
                ? input
                : input instanceof URL
                  ? input.href
                  : (input as Request).url;

        const path = new URL(url).pathname;

        if (!path.startsWith("/api/v4/")) {
            return fetch(input, init);
        }

        // request/nonce: fill if falsy, not just if absent. Some endpoints'
        // generated request types declare request/nonce as required (OpenAPI
        // marks them required for the wire contract, since they're mandatory
        // for non-SDK callers), so they're always serialized as their zero
        // value ("", 0) when the caller doesn't set them — which an "== null"
        // presence check would never catch. "" and 0 are never legitimate
        // caller-supplied values for these two fields, so treating them as
        // absent is safe and still lets an explicitly-set nonce survive.
        if (!body["request"]) body["request"] = path;
        if (!body["nonce"]) body["nonce"] = Date.now();
        // nonceWindow is genuinely optional in every spec and defaults to
        // false server-side — an explicit `nonceWindow: false` from the
        // caller must survive, so only fill it in when the key is missing.
        if (body["nonceWindow"] == null) body["nonceWindow"] = true;

        const serialized = JSON.stringify(body);
        const payload    = encodeBase64(serialized);
        const signature  = await hmacSha512Hex(apiSecret, payload);

        const headers = new Headers(init.headers);
        headers.set("X-TXC-PAYLOAD", payload);
        headers.set("X-TXC-SIGNATURE", signature);

        return fetch(input, {
            ...init,
            body: serialized,
            headers,
        });
    };
}

function encodeBase64(input: string): string {
    if (typeof Buffer !== "undefined") {
        return Buffer.from(input, "utf8").toString("base64");
    }
    const bytes = new TextEncoder().encode(input);
    let binary  = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
}

async function hmacSha512Hex(secret: string, message: string): Promise<string> {
    // Node.js path
    if (typeof process !== "undefined" && process.versions?.node) {
        const { createHmac } = await import("crypto");
        return createHmac("sha512", secret).update(message).digest("hex");
    }

    // Web Crypto path (browser / Deno / Edge)
    const enc     = new TextEncoder();
    const keyMat  = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-512" }, false, ["sign"]);
    const sigBuf  = await crypto.subtle.sign("HMAC", keyMat, enc.encode(message));
    return Array.from(new Uint8Array(sigBuf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}
