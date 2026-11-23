import { describe, it, expect } from "vitest";
import {
  getTempoNecessario,
  calcularProgresso,
  calcularDataPrevista,
  calcularDiasRestantes,
} from "../utils/graduacaoUtils";

describe("Utilitários de Graduação (Front-End)", () => {
  it("deve retornar o tempo mínimo em meses correto para cada faixa", () => {
    expect(getTempoNecessario("Branca", 0)).toBe(12);
    expect(getTempoNecessario("Azul", 2)).toBe(24);
    expect(getTempoNecessario("Roxa", 1)).toBe(18);
    expect(getTempoNecessario("Marrom", 3)).toBe(18);
    expect(getTempoNecessario("Preta", 2)).toBe(36);
    expect(getTempoNecessario("Preta", 4)).toBe(60);
    expect(getTempoNecessario("Desconhecida", 0)).toBe(12);
  });

  it("deve calcular 50% de progresso e apto=false na metade do tempo", () => {
    const aluno = {
      faixa: "Branca",
      grau: 2,
      data_ultima_graduacao: "2026-01-15T12:00:00",
    };
    const referencia = new Date("2026-07-15T12:00:00");

    expect(calcularProgresso(aluno, referencia)).toEqual({
      progresso: 50,
      apto: false,
    });
  });

  it("deve limitar o progresso em 100% e marcar como apto quando atingir o tempo", () => {
    const aluno = {
      faixa: "Branca",
      grau: 4,
      data_ultima_graduacao: "2024-01-15T12:00:00",
    };
    const referencia = new Date("2026-07-15T12:00:00");

    expect(calcularProgresso(aluno, referencia)).toEqual({
      progresso: 100,
      apto: true,
    });
  });

  it("não deve retornar progresso negativo para datas futuras", () => {
    const aluno = {
      faixa: "Azul",
      grau: 0,
      data_ultima_graduacao: "2027-01-15T12:00:00",
    };
    const referencia = new Date("2026-07-15T12:00:00");

    expect(calcularProgresso(aluno, referencia)).toEqual({
      progresso: 0,
      apto: false,
    });
  });

  it("deve calcular corretamente a data prevista e os dias restantes", () => {
    const aluno = {
      faixa: "Branca",
      grau: 0,
      data_ultima_graduacao: "2026-01-15T12:00:00",
    };

    const prevista = calcularDataPrevista(aluno);
    expect(prevista.getFullYear()).toBe(2027);
    expect(prevista.getMonth()).toBe(0); // Janeiro = 0

    const dias = calcularDiasRestantes(
      new Date("2026-11-25T12:00:00"),
      new Date("2026-11-20T12:00:00"),
    );
    expect(dias).toBe(5);
    expect(
      calcularDiasRestantes(
        new Date("2026-11-10T12:00:00"),
        new Date("2026-11-20T12:00:00"),
      ),
    ).toBe(0);
  });
});