import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { auth, errorMessage, request, ticketQuery } from "./api";

beforeEach(() => {
  const values = new Map();
  vi.stubGlobal("sessionStorage", {
    getItem: (key) => values.get(key),
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  });
  vi.stubGlobal("window", { dispatchEvent: vi.fn() });
});
afterEach(() => vi.unstubAllGlobals());
describe("contrato de integração", () => {
  it("combina busca e status nos grupos documentados e aplica o offset", () => {
    const query = new URLSearchParams(
      ticketQuery({ search: "senha", status: "open", page: 2 }),
    );
    expect(query.get("offset")).toBe("20");
    expect(query.get("limit")).toBe("10");
    expect(JSON.parse(query.get("filters"))).toEqual({
      and: [{ column: "status", op: "eq", value: "open" }],
      or: [
        { column: "title", op: "ilike", value: "senha" },
        { column: "description", op: "ilike", value: "senha" },
      ],
    });
  });
  it("envia autenticação e somente o corpo informado", async () => {
    auth.set("token-teste");
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ type: "success", data: { id: 2 } }),
    });
    vi.stubGlobal("fetch", fetch);
    await request("/tickets", {
      method: "POST",
      data: { title: "Teste", description: "Descrição", status: "open" },
    });
    expect(fetch.mock.calls[0][0]).toBe("/api/v2/tickets");
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe(
      "Bearer token-teste",
    );
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({
      title: "Teste",
      description: "Descrição",
      status: "open",
    });
  });
  it("encerra uma sessão expirada e informa o erro da API", async () => {
    auth.set("expirado");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ detail: "Token expirado" }),
      }),
    );
    await expect(request("/me")).rejects.toThrow("Token expirado");
    expect(auth.get()).toBe("");
    expect(window.dispatchEvent).toHaveBeenCalledOnce();
  });
  it("trata envelopes de erro mesmo com HTTP 200", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ type: "error", message: "Sem permissão" }),
      }),
    );
    await expect(request("/tickets/1", { method: "DELETE" })).rejects.toThrow(
      "Sem permissão",
    );
  });
  it("apresenta erros de validação sem incluir o valor enviado", () => {
    expect(
      errorMessage(
        {
          detail: [
            { loc: ["body", "title"], msg: "Field required", input: "segredo" },
          ],
        },
        422,
      ),
    ).toBe("title: Field required");
  });
});
