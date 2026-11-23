const request = require("supertest");

jest.mock("../../src/config/db", () => ({
  query: jest.fn(),
}));

const db = require("../../src/config/db");
const app = require("../../src/app");

describe("Integração - Autenticação (/api/auth/login)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("deve retornar 400 quando faltarem campos obrigatórios", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "prof@academia.com",
    });

    expect(res.status).toBe(400);
  });

  test("deve retornar 401 quando utilizador ou perfil não forem encontrados", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).post("/api/auth/login").send({
      email: "naoexiste@academia.com",
      senha: "123",
      perfil: "Professor",
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("E-mail ou perfil incorretos.");
  });

  test("deve retornar 401 quando a senha estiver incorreta", async () => {
    db.query.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          nome: "Mestre",
          email: "mestre@academia.com",
          senha: "correta",
          perfil: "Professor",
        },
      ],
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "mestre@academia.com",
      senha: "errada",
      perfil: "Professor",
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Senha incorreta.");
  });

  test("deve retornar 200 e os dados do utilizador sem expor a senha no login válido", async () => {
    db.query.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          nome: "Mestre",
          email: "mestre@academia.com",
          senha: "123",
          perfil: "Professor",
        },
      ],
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "mestre@academia.com",
      senha: "123",
      perfil: "Professor",
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 1,
      nome: "Mestre",
      email: "mestre@academia.com",
      perfil: "Professor",
    });
    expect(res.body.senha).toBeUndefined();
  });
});