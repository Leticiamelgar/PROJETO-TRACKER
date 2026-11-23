const request = require("supertest");

jest.mock("../../src/config/db", () => ({
  query: jest.fn(),
}));

const db = require("../../src/config/db");
const app = require("../../src/app");

describe("Integração - Turmas e Agenda (/api/turmas e /api/agenda)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("POST /api/turmas/cadastrar deve exigir nome_turma (HTTP 400)", async () => {
    const res = await request(app).post("/api/turmas/cadastrar").send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("O nome da turma é obrigatório.");
  });

  test("POST /api/turmas/cadastrar deve criar turma e retornar 201", async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ id: 1, nome_turma: "Adulto Noite" }],
    });

    const res = await request(app)
      .post("/api/turmas/cadastrar")
      .send({ nome_turma: "Adulto Noite" });

    expect(res.status).toBe(201);
    expect(res.body.turma).toEqual({ id: 1, nome_turma: "Adulto Noite" });
  });

  test("DELETE /api/turmas/:id deve retornar 400 ao violar chave estrangeira (código 23503)", async () => {
    const erroFK = new Error("foreign key violation");
    erroFK.code = "23503";
    db.query.mockRejectedValueOnce(erroFK);

    const res = await request(app).delete("/api/turmas/1");

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("vinculada a um horário na agenda");
  });

  test("DELETE /api/turmas/:id deve retornar 404 se a turma não existir", async () => {
    db.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    const res = await request(app).delete("/api/turmas/999");

    expect(res.status).toBe(404);
  });

  test("POST /api/agenda/cadastrar deve retornar 400 se faltarem campos obrigatórios", async () => {
    const res = await request(app).post("/api/agenda/cadastrar").send({
      dia_semana: "Segunda",
    });

    expect(res.status).toBe(400);
  });

  test("POST /api/agenda/cadastrar deve criar aula na agenda e retornar 201", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).post("/api/agenda/cadastrar").send({
      dia_semana: "Segunda",
      horario: "19:00",
      tipo_aula: "Gi",
      turma: 1,
    });

    expect(res.status).toBe(201);
    expect(res.body.mensagem).toBe("Aula adicionada com sucesso!");
  });

  test("DELETE /api/agenda/:id deve retornar 404 para aula inexistente", async () => {
    db.query.mockResolvedValueOnce({ rowCount: 0 });

    const res = await request(app).delete("/api/agenda/999");

    expect(res.status).toBe(404);
  });
});