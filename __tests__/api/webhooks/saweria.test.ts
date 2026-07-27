import crypto from "crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  insert: vi.fn(),
  from: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ from: mocks.from }),
}));

import { POST } from "@/app/api/webhooks/saweria/route";

const SECRET = "saweria-test-secret";

function createRequest(
  payload: unknown,
  options: { signature?: string; url?: string } = {}
) {
  const rawBody = JSON.stringify(payload);
  const signature =
    options.signature ??
    crypto.createHmac("sha256", SECRET).update(rawBody).digest("hex");

  return new Request(options.url ?? "http://localhost/api/webhooks/saweria", {
    method: "POST",
    headers: { "x-saweria-signature": signature },
    body: rawBody,
  });
}

describe("Saweria webhook", () => {
  beforeEach(() => {
    vi.stubEnv("SAWERIA_WEBHOOK_SECRET", SECRET);
    mocks.insert.mockResolvedValue({ error: null });
    mocks.from.mockReturnValue({ insert: mocks.insert });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("fail-closed ketika webhook secret belum dikonfigurasi", async () => {
    vi.stubEnv("SAWERIA_WEBHOOK_SECRET", "");

    const response = await POST(createRequest({ id: "donation-1", amount_raw: 50_000 }));

    expect(response.status).toBe(503);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("menolak request tanpa signature meskipun query secret benar", async () => {
    const response = await POST(
      new Request(`http://localhost/api/webhooks/saweria?secret=${SECRET}`, {
        method: "POST",
        body: JSON.stringify({ id: "donation-1", amount_raw: 50_000 }),
      })
    );

    expect(response.status).toBe(401);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("menolak signature yang tidak valid", async () => {
    const response = await POST(
      createRequest(
        { id: "donation-1", amount_raw: 50_000 },
        { signature: "0".repeat(64) }
      )
    );

    expect(response.status).toBe(401);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("menolak nominal tidak valid atau melewati batas", async () => {
    const response = await POST(
      createRequest({ id: "donation-1", amount_raw: 1_000_000_001 })
    );

    expect(response.status).toBe(400);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("menyimpan payload valid setelah signature raw body terverifikasi", async () => {
    const response = await POST(
      createRequest({
        id: "donation-1",
        donator_name: "Fauzan",
        amount_raw: 50_000,
        message: "Semangat",
      })
    );

    expect(response.status).toBe(200);
    expect(mocks.from).toHaveBeenCalledWith("supporters");
    expect(mocks.insert).toHaveBeenCalledWith({
      name: "Fauzan",
      amount: 50_000,
      message: "Semangat",
      tier: "silver",
      source: "saweria",
      provider_event_id: "donation-1",
    });
  });

  it("mengabaikan error duplikasi transaksi dari database", async () => {
    mocks.insert.mockResolvedValueOnce({ error: { code: '23505' } });
    
    const response = await POST(
      createRequest({
        id: "donation-2",
        amount_raw: 50_000,
      })
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toBe("Duplicate donation ignored");
  });

  it("menolak payload yang melewati replay window berdasarkan created_at", async () => {
    const pastDate = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    
    const response = await POST(
      createRequest({
        id: "donation-replay",
        amount_raw: 50_000,
        created_at: pastDate,
      })
    );

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Replay window exceeded");
    expect(mocks.from).not.toHaveBeenCalled();
  });
});
