const {
  validarEmail,
  validarCadastroAluno,
  validarLogin,
  validarCadastroAgenda,
} = require("../../src/services/validacaoService");

describe("Testes Unitários - Serviço de Validação", () => {
  test("deve validar formatos de e-mail corretamente", () => {
    expect(validarEmail("aluno@academia.com")).toBe(true);
    expect(validarEmail("email-invalido")).toBe(false);
    expect(validarEmail("")).toBe(false);
    expect(validarEmail(123)).toBe(false);
  });

  test("deve aceitar um cadastro de aluno válido", () => {
    const res = validarCadastroAluno({
      nome: "Carlos Silva",
      email: "carlos@academia.com",
      faixa: "Branca",
      grau: 2,
    });
    expect(res).toEqual({ valido: true });
  });

  test("deve rejeitar cadastro com nome curto, e-mail, faixa ou grau inválidos", () => {
    expect(validarCadastroAluno({ nome: "A", email: "a@b.com" }).valido).toBe(false);
    expect(validarCadastroAluno({ nome: "Ana", email: "invalido" }).valido).toBe(false);
    expect(
      validarCadastroAluno({ nome: "Ana", email: "ana@b.com", faixa: "Laranja" }).valido
    ).toBe(false);
    expect(
      validarCadastroAluno({ nome: "Ana", email: "ana@b.com", faixa: "Azul", grau: 6 }).valido
    ).toBe(false);
  });

  test("deve validar campos obrigatórios do login", () => {
    expect(validarLogin({ email: "a@b.com", senha: "123", perfil: "Aluno" }).valido).toBe(true);
    expect(validarLogin({ email: "a@b.com", senha: "", perfil: "Aluno" }).valido).toBe(false);
  });

  test("deve validar campos obrigatórios da agenda", () => {
    expect(
      validarCadastroAgenda({
        dia_semana: "Segunda",
        horario: "19:00",
        tipo_aula: "Gi",
      }).valido
    ).toBe(true);
    expect(validarCadastroAgenda({ dia_semana: "Segunda" }).valido).toBe(false);
  });
});