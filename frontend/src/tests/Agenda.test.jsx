import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Agenda from "../pages/Agenda";
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
    put: vi.fn(),
    delete: vi.fn(),
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
    dia_semana: "Quarta",
    horario: "19:30",
    tipo_aula: "NO-GI",
  },
];

describe("Interface - Tela de Agenda (Agenda.jsx)", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    api.get.mockReset();
    api.post.mockReset();
    api.put.mockReset();
    api.delete.mockReset();
    localStorage.clear();
    localStorage.setItem(
      "@JJTrack:usuario",
      JSON.stringify({ id: 1, perfil: "Professor" }),
    );
  });

  it("deve redirecionar para / quando não houver usuário autenticado", () => {
    localStorage.removeItem("@JJTrack:usuario");
    api.get.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <Agenda />
      </MemoryRouter>,
    );

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("deve carregar e exibir os horários distribuídos pelos dias da semana", async () => {
    api.get.mockResolvedValue({ data: agendaMock });

    render(
      <MemoryRouter>
        <Agenda />
      </MemoryRouter>,
    );

    expect(await screen.findByText("18:00")).toBeInTheDocument();
    expect(
      screen.getByText("GB 1 e 2", { selector: ".aula-tipo" }),
    ).toBeInTheDocument();
    expect(screen.getByText("19:30")).toBeInTheDocument();
    expect(
      screen.getByText("NO-GI", { selector: ".aula-tipo" }),
    ).toBeInTheDocument();
  });

  it("deve adicionar um novo horário, limpar o formulário e recarregar a agenda", async () => {
    const user = userEvent.setup();
    api.get
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValue({ data: [agendaMock[0]] });
    api.post.mockResolvedValue({ data: { id: 1 } });

    const { container } = render(
      <MemoryRouter>
        <Agenda />
      </MemoryRouter>,
    );

    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(1));

    const selects = container.querySelectorAll("select");
    const timeInput = container.querySelector('input[type="time"]');

    await user.selectOptions(selects[0], "Segunda");
    fireEvent.change(timeInput, { target: { value: "18:00" } });
    await user.selectOptions(selects[1], "GB 1 e 2");

    await user.click(screen.getByRole("button", { name: "Adicionar" }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/agenda/cadastrar", {
        dia_semana: "Segunda",
        horario: "18:00",
        tipo_aula: "GB 1 e 2",
      });
    });

    expect(await screen.findByText("18:00")).toBeInTheDocument();
  });

  it("deve editar um horário existente e enviar atualização via PUT", async () => {
    const user = userEvent.setup();
    api.get.mockResolvedValue({ data: agendaMock });
    api.put.mockResolvedValue({ data: { ok: true } });

    const { container } = render(
      <MemoryRouter>
        <Agenda />
      </MemoryRouter>,
    );

    await screen.findByText("18:00");

    const botoesEditar = screen.getAllByRole("button", { name: "Editar" });
    await user.click(botoesEditar[0]);

    expect(
      screen.getByRole("heading", { name: "Editar Horário" }),
    ).toBeInTheDocument();
    const timeInput = container.querySelector('input[type="time"]');
    fireEvent.change(timeInput, { target: { value: "18:30" } });

    await user.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith("/agenda/1", {
        dia_semana: "Segunda",
        horario: "18:30",
        tipo_aula: "GB 1 e 2",
      });
    });
  });

  it("deve excluir um horário após confirmação", async () => {
    const user = userEvent.setup();
    api.get
      .mockResolvedValueOnce({ data: agendaMock })
      .mockResolvedValue({ data: agendaMock.slice(1) });
    api.delete.mockResolvedValue({ data: { ok: true } });
    vi.spyOn(window, "confirm").mockReturnValueOnce(true);

    render(
      <MemoryRouter>
        <Agenda />
      </MemoryRouter>,
    );

    await screen.findByText("18:00");

    const botoesExcluir = screen.getAllByRole("button", { name: "X" });
    await user.click(botoesExcluir[0]);

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith("/agenda/1");
    });
  });

  it("deve realizar logout limpando a sessão e navegando para /", async () => {
    const user = userEvent.setup();
    api.get.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <Agenda />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "Sair" }));

    expect(localStorage.getItem("@JJTrack:usuario")).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});