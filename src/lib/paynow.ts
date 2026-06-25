import crypto from "crypto";

const PAYNOW_URL = "https://www.paynow.co.zw/interface/initiatetransaction";
const PAYNOW_MOBILE_URL = "https://www.paynow.co.zw/interface/remotetransaction";

export interface PaynowInitRequest {
  orderId: string;
  reference: string;
  amount: number;
  email: string;
  description: string;
  returnUrl: string;
  resultUrl: string;
}

export interface PaynowInitResult {
  success: boolean;
  redirectUrl?: string;
  pollUrl?: string;
  error?: string;
  raw?: string;
}

function buildHash(values: Record<string, string>, integrationKey: string): string {
  const str = Object.values(values).join("") + integrationKey;
  return crypto.createHash("sha512").update(str).digest("hex").toUpperCase();
}

function parsePaynowResponse(body: string): Record<string, string> {
  return Object.fromEntries(
    body.split("&").map((pair) => {
      const [k, v] = pair.split("=");
      return [decodeURIComponent(k), decodeURIComponent(v ?? "")];
    })
  );
}

/** Initiate a Paynow hosted web checkout. Returns the redirect URL to open in a new tab. */
export async function initiatePaynowCheckout(req: PaynowInitRequest): Promise<PaynowInitResult> {
  const integrationId = process.env.PAYNOW_INTEGRATION_ID!;
  const integrationKey = process.env.PAYNOW_INTEGRATION_KEY!;

  const fields: Record<string, string> = {
    id: integrationId,
    reference: req.reference,
    amount: req.amount.toFixed(2),
    additionalinfo: req.description,
    returnurl: req.returnUrl,
    resulturl: req.resultUrl,
    status: "Message",
    authemail: req.email,
  };

  fields.hash = buildHash(fields, integrationKey);

  const body = new URLSearchParams(fields).toString();

  const response = await fetch(PAYNOW_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const text = await response.text();
  const parsed = parsePaynowResponse(text);

  if (parsed.status?.toLowerCase() === "ok") {
    return {
      success: true,
      redirectUrl: parsed.browserurl,
      pollUrl: parsed.pollurl,
      raw: text,
    };
  }

  return {
    success: false,
    error: parsed.error ?? parsed.status ?? "Unknown Paynow error",
    raw: text,
  };
}

/** Verify a Paynow webhook/callback hash to ensure it came from Paynow. */
export function verifyPaynowHash(
  params: Record<string, string>,
  integrationKey: string
): boolean {
  const receivedHash = params.hash;
  if (!receivedHash) return false;

  const { hash: _hash, ...rest } = params;
  const computedHash = buildHash(rest, integrationKey);
  return computedHash === receivedHash.toUpperCase();
}
