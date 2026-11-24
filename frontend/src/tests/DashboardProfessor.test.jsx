import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import DashboardProfessor from "../pages/DashboardProfessor";
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
    post: vi.fn(),
  },
}));

const alunosMock = [
  { id: 1, nome: "Ana Paula", faixa: "Azul", grau: 2 },
  { id: 2, nome: "Bruno Rocha", faixa: "Branca", grau: 3 },
];

function mockPainel(alunos = alunosMock, presencasHoje = 1) {
  api.get.mockImplementation((url) => {
    if (url === "/alunos/listar") {
      return Promise.resolve({ data: alunos });
    }
    if (url === "/alunos/estatisticas/hoje") {
      return Promise.resolve({ data: { presencasHoje } });
    }
    return Promise.resolve({ data: [] });
  });
}

describe("Interface - Painel do Professor (DashboardProfessor.jsx)", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    api.get.mockReset();
    api.post.mockReset();
    localStorage.clear();
  });

  it("deve carregar e exibir os cards de total de alunos, presenças hoje e faltas", async () => {
    mockPainel(alunosMock, 1);

    render(
      <MemoryRouter>
        <DashboardProfessor />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Ana Paula")).toBeInTheDocument();
    expect(screen.getByText("Bruno Rocha")).toBeInTheDocument();

    expect(screen.getByText("Total de alunos").nextElementSibling).toHaveTextContent("2");
    expect(screen.getByText("Presenças Hoje").nextElementSibling).toHaveTextContent("1");
    expect(screen.getByText("Faltas").nextElementSibling).toHaveTextContent("1");
  });

  it("deve evitar número negativo nas faltas quando presenças excederem o total", async () => {
    mockPainel([alunosMock[0]], 3);

    render(
      <MemoryRouter>
        <DashboardProfessor />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Ana Paula")).toBeInTheDocument();
    expect(screen.getByText("Faltas").nextElementSibling).toHaveTextContent("0");
  });

  it("deve exibir mensagem quando não houver alunos matriculados", async () => {
    mockPainel([], 0);

    render(
      <MemoryRouter>
        <DashboardProfessor />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText("Nenhum aluno matriculado ainda."),
    ).toBeInTheDocument();
  });

  it("deve registrar presença, exibir alerta de sucesso e atualizar o painel", async () => {
    const user = userEvent.setup();
    mockPainel(alunosMock, 1);
    api.post.mockResolvedValueOnce({ data: { ok: true } });
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(
      <MemoryRouter>
        <DashboardProfessor />
      </MemoryRouter>,
    );

    await screen.findByText("Ana Paula");

    // Após o POST, passa a retornar 2 presenças hoje
    mockPainel(alunosMock, 2);

    const botoesPresenca = screen.getAllByRole("button", { name: "Dar Presença" });
    await user.click(botoesPresenca[0]);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/alunos/registrar-presenca/1");
    });
    expect(alertSpy).toHaveBeenCalledWith("✅ Presença registrada para Ana Paula!");
    await waitFor(() => {
      expect(screen.getByText("Presenças Hoje").nextElementSibling).toHaveTextContent("2");
    });
  });

  it("deve exibir alerta de erro quando falhar ao registrar presença", async () => {
    const user = userEvent.setup();
    mockPainel(alunosMock, 1);
    api.post.mockRejectedValueOnce(new Error("Falha na API"));
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(
      <MemoryRouter>
        <DashboardProfessor />
      </MemoryRouter>,
    );

    await screen.findByText("Ana Paula");

    const botoesPresenca = screen.getAllByRole("button", { name: "Dar Presença" });
    await user.click(botoesPresenca[0]);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Erro ao tentar registrar a presença.",
      );
    });
  });

  it("deve navegar pelo menu superior e realizar logout", async () => {
    const user = userEvent.setup();
    mockPainel([], 0);
    localStorage.setItem("@JJTrack:usuario", JSON.stringify({ id: 1 }));

    render(
      <MemoryRouter>
        <DashboardProfessor />
      </MemoryRouter>,
    );

    await screen.findByText("Nenhum aluno matriculado ainda.");

    await user.click(screen.getByRole("button", { name: "Agenda" }));
    expect(mockNavigate).toHaveBeenCalledWith("/professor/agenda");

    await user.click(screen.getByRole("button", { name: "Graduações" }));
    expect(mockNavigate).toHaveBeenCalledWith("/professor/graduacoes");

    await user.click(screen.getByRole("button", { name: "Alunos" }));
    expect(mockNavigate).toHaveBeenCalledWith("/professor/alunos");

    const btnPresencaHover = screen.queryAllByRole("button", { name: "Dar Presença" });
    if (btnPresencaHover[0]) {
      fireEvent.mouseOver(btnPresencaHover[0]);
      fireEvent.mouseOut(btnPresencaHover[0]);
    }

    await user.click(screen.getByRole("button", { name: "Sair" }));
    expect(localStorage.getItem("@JJTrack:usuario")).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});