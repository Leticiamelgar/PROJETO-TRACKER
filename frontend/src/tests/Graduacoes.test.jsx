import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Graduacoes from "../pages/Graduacoes";
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
    put: vi.fn(),
  },
}));

// Helper para gerar data ISO N meses atrás a partir de hoje
function mesesAtras(meses) {
  const d = new Date();
  d.setMonth(d.getMonth() - meses);
  return d.toISOString();
}

const alunosMock = [
  {
    id: 1,
    nome: "Carlos Silva",
    faixa: "Azul",
    grau: 4,
    data_ultima_graduacao: mesesAtras(25), // >= 24 meses -> 100% Apto
  },
  {
    id: 2,
    nome: "Mariana Souza",
    faixa: "Branca",
    grau: 2,
    data_ultima_graduacao: mesesAtras(6), // 6/12 meses -> 50% Não Apto
  },
  {
    id: 3,
    nome: "Mestre Ricardo",
    faixa: "Preta",
    grau: 4,
    data_ultima_graduacao: mesesAtras(30), // 30/60 meses -> 50% (regra >= 4º grau)
  },
];

describe("Interface - Tela de Graduações (Graduacoes.jsx)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("deve carregar e exibir alunos com progresso, status Apto e botão Graduar", async () => {
    api.get.mockResolvedValueOnce({ data: alunosMock });

    render(
      <MemoryRouter>
        <Graduacoes />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Carlos Silva")).toBeInTheDocument();
    expect(screen.getByText("Mariana Souza")).toBeInTheDocument();
    expect(screen.getByText("Mestre Ricardo")).toBeInTheDocument();

    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getAllByText("50%")).toHaveLength(2);
    expect(screen.getByText("Apto")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Graduar" })).toBeInTheDocument();
  });

  it("deve filtrar alunos pela busca por nome e exibir mensagem quando vazio", async () => {
    const user = userEvent.setup();
    api.get.mockResolvedValueOnce({ data: alunosMock });

    render(
      <MemoryRouter>
        <Graduacoes />
      </MemoryRouter>,
    );

    await screen.findByText("Carlos Silva");

    const inputBusca = screen.getByPlaceholderText("Buscar Aluno...");
    await user.type(inputBusca, "Mariana");

    expect(screen.getByText("Mariana Souza")).toBeInTheDocument();
    expect(screen.queryByText("Carlos Silva")).not.toBeInTheDocument();

    await user.clear(inputBusca);
    await user.type(inputBusca, "Inexistente");

    expect(screen.getByText("Nenhum aluno encontrado.")).toBeInTheDocument();
  });

  it("deve abrir os filtros e filtrar por Aptos, Não Aptos e por Faixa", async () => {
    const user = userEvent.setup();
    api.get.mockResolvedValueOnce({ data: alunosMock });

    render(
      <MemoryRouter>
        <Graduacoes />
      </MemoryRouter>,
    );

    await screen.findByText("Carlos Silva");

    // Abre barra de filtros clicando no ícone alt="Filtrar"
    await user.click(screen.getByAltText("Filtrar"));

    // Filtra apenas Aptos
    await user.click(screen.getByRole("button", { name: "Aptos" }));
    expect(screen.getByText("Carlos Silva")).toBeInTheDocument();
    expect(screen.queryByText("Mariana Souza")).not.toBeInTheDocument();

    // Filtra Não Aptos
    await user.click(screen.getByRole("button", { name: "Não Aptos" }));
    expect(screen.queryByText("Carlos Silva")).not.toBeInTheDocument();
    expect(screen.getByText("Mariana Souza")).toBeInTheDocument();
    expect(screen.getByText("Mestre Ricardo")).toBeInTheDocument();

    // Filtra por faixa Preta
    await user.click(screen.getByRole("button", { name: "Preta" }));
    expect(screen.getByText("Mestre Ricardo")).toBeInTheDocument();
    expect(screen.queryByText("Mariana Souza")).not.toBeInTheDocument();
  });

  it("deve graduar aluno após confirmação, exibir alerta e recarregar a lista", async () => {
    const user = userEvent.setup();
    api.get
      .mockResolvedValueOnce({ data: alunosMock })
      .mockResolvedValueOnce({ data: alunosMock });
    api.put.mockResolvedValueOnce({ data: { message: "OK" } });

    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValueOnce(true);
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(
      <MemoryRouter>
        <Graduacoes />
      </MemoryRouter>,
    );

    const btnGraduar = await screen.findByRole("button", { name: "Graduar" });
    await user.click(btnGraduar);

    expect(confirmSpy).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith("/alunos/graduar/1");
    });
    expect(alertSpy).toHaveBeenCalledWith("Graduação realizada com sucesso!");
    expect(api.get).toHaveBeenCalledTimes(2);
  });

  it("deve exibir alerta de erro quando a API falhar ao graduar", async () => {
    const user = userEvent.setup();
    api.get.mockResolvedValueOnce({ data: alunosMock });
    api.put.mockRejectedValueOnce(new Error("Erro servidor"));

    vi.spyOn(window, "confirm").mockReturnValueOnce(true);
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(
      <MemoryRouter>
        <Graduacoes />
      </MemoryRouter>,
    );

    const btnGraduar = await screen.findByRole("button", { name: "Graduar" });
    await user.click(btnGraduar);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Erro ao realizar graduação.");
    });
  });

  it("deve realizar logout e redirecionar para a tela inicial", async () => {
    const user = userEvent.setup();
    localStorage.setItem("@JJTrack:usuario", JSON.stringify({ id: 1 }));
    api.get.mockResolvedValueOnce({ data: [] });

    render(
      <MemoryRouter>
        <Graduacoes />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "Sair" }));

    expect(localStorage.getItem("@JJTrack:usuario")).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});