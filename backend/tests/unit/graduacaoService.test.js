const {
  calcularProximaGraduacao,
  validarFaixa,
  validarGrau,
} = require("../../src/services/graduacaoService");

describe("Testes Unitários - Serviço de Graduação", () => {
  describe("validarFaixa (Particionamento de Equivalência)", () => {
    test("deve aceitar todas as faixas oficiais", () => {
      expect(validarFaixa("Branca")).toBe(true);
      expect(validarFaixa("Azul")).toBe(true);
      expect(validarFaixa("Roxa")).toBe(true);
      expect(validarFaixa("Marrom")).toBe(true);
      expect(validarFaixa("Preta")).toBe(true);
    });

    test("deve rejeitar faixas inexistentes ou tipos inválidos", () => {
      expect(validarFaixa("Verde")).toBe(false);
      expect(validarFaixa("branca")).toBe(false);
      expect(validarFaixa("")).toBe(false);
      expect(validarFaixa(null)).toBe(false);
    });
  });

  describe("validarGrau (Análise de Valor Limite: 0 a 4)", () => {
    test("deve aceitar valores nos limites válidos (0 e 4) e intermédios", () => {
      expect(validarGrau(0)).toBe(true);
      expect(validarGrau(2)).toBe(true);
      expect(validarGrau(4)).toBe(true);
      expect(validarGrau("3")).toBe(true);
    });

    test("deve rejeitar valores fora dos limites (-1 e 5), decimais e vazios", () => {
      expect(validarGrau(-1)).toBe(false);
      expect(validarGrau(5)).toBe(false);
      expect(validarGrau(2.5)).toBe(false);
      expect(validarGrau("")).toBe(false);
      expect(validarGrau(null)).toBe(false);
    });
  });

  describe("calcularProximaGraduacao (Promoção e Reset de Grau)", () => {
    test("deve promover cada faixa na sequência correta e reiniciar o grau para 0", () => {
      expect(calcularProximaGraduacao("Branca")).toEqual({
        sucesso: true,
        novaFaixa: "Azul",
        novoGrau: 0,
      });
      expect(calcularProximaGraduacao("Azul")).toEqual({
        sucesso: true,
        novaFaixa: "Roxa",
        novoGrau: 0,
      });
      expect(calcularProximaGraduacao("Roxa")).toEqual({
        sucesso: true,
        novaFaixa: "Marrom",
        novoGrau: 0,
      });
      expect(calcularProximaGraduacao("Marrom")).toEqual({
        sucesso: true,
        novaFaixa: "Preta",
        novoGrau: 0,
      });
    });

    test("deve impedir a promoção quando o aluno já está na faixa máxima (Preta)", () => {
      expect(calcularProximaGraduacao("Preta")).toEqual({
        sucesso: false,
        erro: "Aluno já possui a faixa máxima (Preta).",
      });
    });

    test("deve devolver erro para uma faixa inválida", () => {
      expect(calcularProximaGraduacao("Cinza")).toEqual({
        sucesso: false,
        erro: "Faixa atual inválida.",
      });
    });
  });
});