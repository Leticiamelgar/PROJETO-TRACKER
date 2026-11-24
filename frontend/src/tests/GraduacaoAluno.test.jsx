import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import GraduacaoAluno from "../pages/GraduacaoALuno";
import api from "../services/api";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../services/api", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("Interface - Tela de Graduação do Aluno (GraduacaoAluno.jsx)", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    api.get.mockReset();
    localStorage.clear();
    localStorage.setItem(
      "@JJTrack:usuario",
      JSON.stringify({ id: 10, perfil: "Aluno" }),
    );
  });

  it("deve redirecionar para / quando não houver usuário autenticado", () => {
    localStorage.removeItem("@JJTrack:usuario");

    render(
      <MemoryRouter>
        <GraduacaoAluno />
      </MemoryRouter>,
    );

    expect(mockNavigate).toHaveBeenCalledWith("/");
    expect(api.get).not.toHaveBeenCalled();
  });

  it("deve carregar e exibir faixa, graus e previsão de graduação do aluno", async () => {
    const hoje = new Date();
    const ultimaGrad = new Date(hoje.getFullYear(), hoje.getMonth() - 6, 1);
    const dataIso = ultimaGrad.toISOString().split("T")[0];

    api.get.mockResolvedValueOnce({
      data: {
        id: 10,
        faixa: "Azul",
        grau: 2,
        data_ultima_graduacao: dataIso,
      },
    });

    render(
      <MemoryRouter>
        <GraduacaoAluno />
      </MemoryRouter>,
    );

    expect(await screen.findByText(/Faixa Azul/i)).toBeInTheDocument();
    expect(screen.getByText(/2 graus/i)).toBeInTheDocument();
    expect(screen.getByText("Previsão de graduação")).toBeInTheDocument();
    expect(screen.getByText("Data estimada")).toBeInTheDocument();
    expect(screen.getByText(/dias restantes/i)).toBeInTheDocument();
  });

  it("deve exibir 'Apto para graduação!' e barra completa quando o prazo for atingido", async () => {
    api.get.mockResolvedValueOnce({
      data: {
        id: 10,
        faixa: "Branca",
        grau: 4,
        data_ultima_graduacao: "2020-01-01",
      },
    });

    const { container } = render(
      <MemoryRouter>
        <GraduacaoAluno />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText("Apto para graduação!"),
    ).toBeInTheDocument();

    const barra = container.querySelector(".aluno-progress-fill");
    expect(barra).toHaveStyle({ width: "100%" });
  });

  it("deve calcular regras de tempo para diferentes faixas e graus", async () => {
    const casos = [
      { faixa: "Roxa", grau: 1, data: "2024-01-01", textoFaixa: /Faixa Roxa/i },
      { faixa: "Marrom", grau: 2, data: "2024-01-01", textoFaixa: /Faixa Marrom/i },
      { faixa: "Preta", grau: 4, data: "2020-01-01", textoFaixa: /Faixa Preta/i },
      { faixa: "Preta", grau: 1, data: "2022-01-01", textoFaixa: /Faixa Preta/i },
      { faixa: "Coral", grau: 0, data: "2024-01-01", textoFaixa: /Faixa Coral/i },
    ];

    for (const caso of casos) {
      api.get.mockResolvedValueOnce({
        data: {
          id: 10,
          faixa: caso.faixa,
          grau: caso.grau,
          data_ultima_graduacao: caso.data,
        },
      });

      const { unmount } = render(
        <MemoryRouter>
          <GraduacaoAluno />
        </MemoryRouter>,
      );

      expect(await screen.findByText(caso.textoFaixa)).toBeInTheDocument();
      unmount();
    }
  });

  it("deve exibir mensagem de erro quando a busca do aluno falhar", async () => {
    api.get.mockRejectedValueOnce(new Error("Erro de rede"));

    render(
      <MemoryRouter>
        <GraduacaoAluno />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText("Erro ao carregar os dados do aluno."),
    ).toBeInTheDocument();
  });

  it("deve navegar entre Início e Agenda e realizar logout ao clicar em Sair", async () => {
    const user = userEvent.setup();
    api.get.mockResolvedValueOnce({
      data: {
        id: 10,
        faixa: "Azul",
        grau: 1,
        data_ultima_graduacao: "2025-06-01",
      },
    });

    render(
      <MemoryRouter>
        <GraduacaoAluno />
      </MemoryRouter>,
    );

    expect(await screen.findByText(/Faixa Azul/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Início" }));
    expect(mockNavigate).toHaveBeenCalledWith("/aluno");

    await user.click(screen.getByRole("button", { name: "Agenda" }));
    expect(mockNavigate).toHaveBeenCalledWith("/aluno/agenda");

    await user.click(screen.getByRole("button", { name: "Sair" }));
    expect(localStorage.getItem("@JJTrack:usuario")).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith("/");

    await waitFor(() => expect(api.get).toHaveBeenCalledWith("/alunos/10"));
  });
});