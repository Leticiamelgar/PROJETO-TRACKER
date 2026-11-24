import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AgendaAluno from "../pages/AgendaAluno";
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

const agendaMock = [
  {
    id: 1,
    dia_semana: "Segunda",
    horario: "18:00",
    tipo_aula: "GB 1 e 2",
  },
  {
    id: 2,
    dia_semana: "Quinta",
    horario: "20:00",
    tipo_aula: "NO-GI",
  },
];

describe("Interface - Agenda do Aluno (AgendaAluno.jsx)", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    api.get.mockReset();
    localStorage.clear();
    localStorage.setItem(
      "@JJTrack:usuario",
      JSON.stringify({ id: 10, perfil: "Aluno" }),
    );
  });

  it("deve carregar e exibir os horários por dia da semana e '-' nos dias sem aula", async () => {
    api.get.mockResolvedValueOnce({ data: agendaMock });

    render(
      <MemoryRouter>
        <AgendaAluno />
      </MemoryRouter>,
    );

    expect(await screen.findByText("18:00")).toBeInTheDocument();
    expect(screen.getByText("GB 1 e 2")).toBeInTheDocument();
    expect(screen.getByText("20:00")).toBeInTheDocument();
    expect(screen.getByText("NO-GI")).toBeInTheDocument();

    // 6 dias na semana, 2 com aula -> 4 colunas com "-"
    expect(screen.getAllByText("-")).toHaveLength(4);
  });

  it("deve manter a grade renderizada mesmo quando a busca da agenda falhar", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    api.get.mockRejectedValueOnce(new Error("Erro de conexão"));

    render(
      <MemoryRouter>
        <AgendaAluno />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/agenda/listar");
    });

    expect(screen.getByText("Segunda")).toBeInTheDocument();
    expect(screen.getByText("Sábado")).toBeInTheDocument();
    expect(screen.getAllByText("-")).toHaveLength(6);

    consoleErrorSpy.mockRestore();
  });

  it("deve navegar entre Início e Graduação e realizar logout ao clicar em Sair", async () => {
    const user = userEvent.setup();
    api.get.mockResolvedValueOnce({ data: [] });

    render(
      <MemoryRouter>
        <AgendaAluno />
      </MemoryRouter>,
    );

    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole("button", { name: "Início" }));
    expect(mockNavigate).toHaveBeenCalledWith("/aluno");

    await user.click(screen.getByRole("button", { name: "Graduação" }));
    expect(mockNavigate).toHaveBeenCalledWith("/aluno/graduacao");

    await user.click(screen.getByRole("button", { name: "Sair" }));
    expect(localStorage.getItem("@JJTrack:usuario")).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});