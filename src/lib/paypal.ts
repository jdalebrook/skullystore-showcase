const PAYPAL_API_BASE =
  process.env.PAYPAL_API_BASE ?? "https://api-m.sandbox.paypal.com";

async function getAccessToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error("No se pudo autenticar con PayPal.");
  }

  const data: { access_token: string } = await response.json();
  return data.access_token;
}

export async function createPayPalOrder(
  totalCents: number,
  currency: string
): Promise<{ id: string }> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: (totalCents / 100).toFixed(2),
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error("No se pudo crear el pedido en PayPal.");
  }

  return response.json();
}

type PayPalCaptureResult = {
  id: string;
  status: string;
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{ id: string }>;
    };
  }>;
};

export async function capturePayPalOrder(
  paypalOrderId: string
): Promise<PayPalCaptureResult> {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${paypalOrderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("No se pudo capturar el pago en PayPal.");
  }

  return response.json();
}

type WebhookHeaders = {
  transmissionId: string;
  transmissionTime: string;
  certUrl: string;
  authAlgo: string;
  transmissionSig: string;
};

// Confirma que un webhook viene de verdad de PayPal (y no de alguien que
// simplemente hace POST a la URL con un payload inventado) usando la propia
// API de verificación de PayPal -- ver
// https://developer.paypal.com/api/rest/webhooks/rest/#link-verifywebhooksignature.
export async function verifyPayPalWebhookSignature(
  headers: WebhookHeaders,
  webhookId: string,
  event: unknown
): Promise<boolean> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transmission_id: headers.transmissionId,
      transmission_time: headers.transmissionTime,
      cert_url: headers.certUrl,
      auth_algo: headers.authAlgo,
      transmission_sig: headers.transmissionSig,
      webhook_id: webhookId,
      webhook_event: event,
    }),
  });

  if (!response.ok) return false;

  const data: { verification_status?: string } = await response.json();
  return data.verification_status === "SUCCESS";
}
