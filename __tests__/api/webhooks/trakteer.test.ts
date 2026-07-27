import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  insert: vi.fn(),
  from: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ from: mocks.from }),
}));

import { POST } from "@/app/api/webhooks/trakteer/route";

const SECRET = "trakteer-test-secret";

function createRequest(
  payload: unknown,
  options: { token?: string; includeToken?: boolean } = {}
) {
  const headers = new Headers({ "content-type": "application/json" });
  if (options.includeToken !== false) {
    headers.set("x-trakteer-token", options.token ?? SECRET);
  }

  return new Request("http://localhost/api/webhooks/trakteer", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
}

describe("Trakteer webhook", () => {
  beforeEach(() => {
    vi.stubEnv("TRAKTEER_WEBHOOK_SECRET", SECRET);
    mocks.insert.mockResolvedValue({ error: null });
    mocks.from.mockReturnValue({ insert: mocks.insert });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("fail-closed ketika webhook secret belum dikonfigurasi", async () => {
    vi.stubEnv("TRAKTEER_WEBHOOK_SECRET", "");

    const response = await POST(createRequest({ transaction_id: "trx-1", net_amount: 50_000 }));

    expect(response.status).toBe(503);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("menolak body key sebagai pengganti header token", async () => {
    const response = await POST(
      createRequest(
        { transaction_id: "trx-1", net_amount: 50_000, key: SECRET },
        { includeToken: false }
      )
    );

    expect(response.status).toBe(401);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("menolak token yang tidak valid", async () => {
    const response = await POST(
      createRequest(
        { transaction_id: "trx-1", net_amount: 50_000 },
        { token: "invalid-token" }
      )
    );

    expect(response.status).toBe(401);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("menolak payload tanpa transaction ID", async () => {
    const response = await POST(createRequest({ net_amount: 50_000 }));

    expect(response.status).toBe(400);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("menolak nominal yang melewati batas", async () => {
    const response = await POST(
      createRequest({ transaction_id: "trx-1", net_amount: 1_000_000_001 })
    );

    expect(response.status).toBe(400);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("menyimpan payload valid dengan header token", async () => {
    const response = await POST(
      createRequest({
        transaction_id: "trx-1",
        supporter_name: "Fauzan",
        net_amount: 100_000,
        supporter_message: "Semangat",
      })
    );

    expect(response.status).toBe(200);
    expect(mocks.from).toHaveBeenCalledWith("supporters");
    expect(mocks.insert).toHaveBeenCalledWith({
      name: "Fauzan",
      amount: 100_000,
      message: "Semangat",
      tier: "gold",
      source: "trakteer",
      provider_event_id: "trx-1",
    });
  });

  it("mengabaikan error duplikasi transaksi dari database", async () => {
    mocks.insert.mockResolvedValueOnce({ error: { code: '23505' } });
    
    const response = await POST(
      createRequest({
        transaction_id: "trx-2",
        net_amount: 50_000,
      })
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toBe("Duplicate donation ignored");
  });

  it("menolak payload yang melewati replay window berdasarkan payment_date", async () => {
    const pastDate = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    
    const response = await POST(
      createRequest({
        transaction_id: "trx-replay",
        net_amount: 50_000,
        payment_date: pastDate,
      })
    );

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Replay window exceeded");
    expect(mocks.from).not.toHaveBeenCalled();
  });
});
