import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import DashboardAluno from "../pages/DashboardAluno";
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

describe("Interface - Painel do Aluno (DashboardAluno.jsx)", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    api.get.mockReset();
    localStorage.clear();
    localStorage.setItem(
      "@JJTrack:usuario",
      JSON.stringify({ id: 7, perfil: "Aluno" }),
    );
  });

  it("deve redirecionar para / quando não houver usuário autenticado", () => {
    localStorage.removeItem("@JJTrack:usuario");

    render(
      <MemoryRouter>
        <DashboardAluno />
      </MemoryRouter>,
    );

    expect(mockNavigate).toHaveBeenCalledWith("/");
    expect(api.get).not.toHaveBeenCalled();
  });

  it("deve carregar e exibir o histórico de presenças formatado em DD/MM", async () => {
    api.get.mockResolvedValueOnce({
      data: [
        { data_hora: "2026-11-10T18:30:00.000Z" },
        { data_hora: "2026-11-12T18:30:00.000Z" },
      ],
    });

    render(
      <MemoryRouter>
        <DashboardAluno />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Histórico de presença")).toBeInTheDocument();
    expect(screen.getAllByText("✔")).toHaveLength(2);

    const esp1 = new Date("2026-11-10T18:30:00.000Z");
    const esp2 = new Date("2026-11-12T18:30:00.000Z");
    const d1 = `${String(esp1.getDate()).padStart(2, "0")}/${String(esp1.getMonth() + 1).padStart(2, "0")}`;
    const d2 = `${String(esp2.getDate()).padStart(2, "0")}/${String(esp2.getMonth() + 1).padStart(2, "0")}`;

    expect(screen.getByText(d1)).toBeInTheDocument();
    expect(screen.getByText(d2)).toBeInTheDocument();
  });

  it("deve exibir mensagem quando não houver presenças registradas", async () => {
    api.get.mockResolvedValueOnce({ data: [] });

    render(
      <MemoryRouter>
        <DashboardAluno />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText("Nenhuma presença registrada ainda."),
    ).toBeInTheDocument();
  });

  it("deve capturar erro ao buscar o histórico sem quebrar a interface", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    api.get.mockRejectedValueOnce(new Error("Erro na API"));

    render(
      <MemoryRouter>
        <DashboardAluno />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/alunos/presencas/7");
    });

    expect(
      screen.getByText("Nenhuma presença registrada ainda."),
    ).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it("deve navegar entre Agenda e Graduação e realizar logout ao clicar em Sair", async () => {
    const user = userEvent.setup();
    api.get.mockResolvedValueOnce({ data: [] });

    render(
      <MemoryRouter>
        <DashboardAluno />
      </MemoryRouter>,
    );

    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole("button", { name: "Agenda" }));
    expect(mockNavigate).toHaveBeenCalledWith("/aluno/agenda");

    await user.click(screen.getByRole("button", { name: "Graduação" }));
    expect(mockNavigate).toHaveBeenCalledWith("/aluno/graduacao");

    await user.click(screen.getByRole("button", { name: "Sair" }));
    expect(localStorage.getItem("@JJTrack:usuario")).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});