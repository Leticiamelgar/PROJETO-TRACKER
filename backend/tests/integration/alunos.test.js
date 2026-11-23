const request = require("supertest");

jest.mock("../../src/config/db", () => ({
  query: jest.fn(),
}));

const db = require("../../src/config/db");
const app = require("../../src/app");

describe("Integração - Rotas de Alunos (/api/alunos)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("GET /api/alunos/listar deve retornar a lista de alunos", async () => {
    const listaMock = [
      { id: 1, nome: "João", faixa: "Branca", grau: 2, total_presencas: "5" },
    ];
    db.query.mockResolvedValueOnce({ rows: listaMock });

    const res = await request(app).get("/api/alunos/listar");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(listaMock);
  });

  test("POST /api/alunos/cadastrar deve retornar 400 se o e-mail já estiver cadastrado", async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 10 }] });

    const res = await request(app).post("/api/alunos/cadastrar").send({
      nome: "Maria",
      email: "maria@academia.com",
      faixa: "Branca",
      grau: 0,
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Este e-mail já está cadastrado.");
  });

  test("POST /api/alunos/cadastrar deve matricular um aluno válido e retornar 201", async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 15 }] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app).post("/api/alunos/cadastrar").send({
      nome: "Maria",
      email: "maria@academia.com",
      dataNascimento: "2000-05-10",
      ultimaGraduacao: "2026-01-01",
      faixa: "Branca",
      grau: 0,
      genero: "Feminino",
    });

    expect(res.status).toBe(201);
    expect(res.body.mensagem).toBe("Aluno matriculado com sucesso!");
  });

  test("PUT /api/alunos/graduar/:id deve promover a faixa e reiniciar o grau para 0", async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ faixa: "Branca", grau: 4 }] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app).put("/api/alunos/graduar/15");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      mensagem: "Faixa atualizada e graus resetados com sucesso!",
      novaFaixa: "Azul",
    });
    expect(db.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("grau = $2"),
      ["Azul", 0, "15"]
    );
  });

  test("PUT /api/alunos/graduar/:id deve retornar 400 para aluno na faixa Preta", async () => {
    db.query.mockResolvedValueOnce({ rows: [{ faixa: "Preta", grau: 2 }] });

    const res = await request(app).put("/api/alunos/graduar/15");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Aluno já possui a faixa máxima (Preta).");
  });

  test("PUT /api/alunos/graduar/:id deve retornar 404 para aluno inexistente", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).put("/api/alunos/graduar/999");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Aluno não encontrado.");
  });

  test("POST /api/alunos/registrar-presenca/:id deve registar presença e retornar 201", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).post("/api/alunos/registrar-presenca/15");

    expect(res.status).toBe(201);
    expect(res.body.mensagem).toBe("Presença registrada com sucesso!");
  });

  test("GET /api/alunos/estatisticas/hoje deve retornar o total numérico de presenças do dia", async () => {
    db.query.mockResolvedValueOnce({ rows: [{ presencas_hoje: "7" }] });

    const res = await request(app).get("/api/alunos/estatisticas/hoje");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ presencasHoje: 7 });
  });
});