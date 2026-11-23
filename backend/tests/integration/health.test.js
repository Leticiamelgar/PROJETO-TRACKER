const request = require("supertest");

jest.mock("../../src/config/db", () => ({
  query: jest.fn(),
}));

const db = require("../../src/config/db");
const app = require("../../src/app");

describe("Integração - Rota de Saúde do Banco (/api/teste-banco)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("deve retornar status 200 e a hora do banco quando a conexão funciona", async () => {
    const horaSimulada = "2026-11-23T14:00:00.000Z";
    db.query.mockResolvedValueOnce({ rows: [{ now: horaSimulada }] });

    const resposta = await request(app).get("/api/teste-banco");

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual({
      status: "OK",
      horaBanco: horaSimulada,
    });
    expect(db.query).toHaveBeenCalledWith("SELECT NOW()");
  });

  test("deve retornar status 500 quando ocorre falha na conexão com o banco", async () => {
    db.query.mockRejectedValueOnce(new Error("Falha de conexão"));

    const resposta = await request(app).get("/api/teste-banco");

    expect(resposta.status).toBe(500);
    expect(resposta.body).toEqual({
      error: "Erro ao conectar no banco.",
    });
  });
});