import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Alunos from "../pages/Alunos";
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

const alunosMock = [
  {
    id: 1,
    nome: "Rafael Costa",
    email: "rafael@gb.com",
    data_nascimento: "1995-03-10",
    data_ultima_graduacao: "2024-06-01",
    faixa: "Azul",
    grau: "2",
    genero: "Masculino",
  },
  {
    id: 2,
    nome: "Beatriz Lima",
    email: "beatriz@gb.com",
    data_nascimento: "1998-07-15",
    data_ultima_graduacao: "2025-01-10",
    faixa: "Roxa",
    grau: "1",
    genero: "Feminino",
  },
  {
    id: 3,
    nome: "Lucas Juvenil",
    email: "lucas@gb.com",
    data_nascimento: "2016-05-20", // < 16 anos em 2026 -> coluna Juvenil
    data_ultima_graduacao: "2025-05-01",
    faixa: "Branca",
    grau: "3",
    genero: "Masculino",
  },
];

function preencherFormulario(container, dados) {
  const textInputs = container.querySelectorAll('input[type="text"]');
  const emailInput = container.querySelector('input[type="email"]');
  const dateInputs = container.querySelectorAll('input[type="date"]');
  const selects = container.querySelectorAll("select");

  fireEvent.change(textInputs[0], { target: { value: dados.nome } });
  if (dados.email && !emailInput.disabled) {
    fireEvent.change(emailInput, { target: { value: dados.email } });
  }
  fireEvent.change(dateInputs[0], { target: { value: dados.dataNascimento } });
  fireEvent.change(dateInputs[1], { target: { value: dados.ultimaGraduacao } });
  fireEvent.change(selects[0], { target: { value: dados.faixa } });
  fireEvent.change(selects[1], { target: { value: dados.grau } });

  const radioGenero = screen.getByRole("radio", { name: dados.genero });
  fireEvent.click(radioGenero);
}

describe("Interface - Tela de Alunos (Alunos.jsx)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  it("deve listar e categorizar alunos nas colunas Homem, Mulher e Juvenil", async () => {
    api.get.mockResolvedValueOnce({ data: alunosMock });

    render(
      <MemoryRouter>
        <Alunos />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Rafael Costa")).toBeInTheDocument();
    expect(screen.getByText("Beatriz Lima")).toBeInTheDocument();
    expect(screen.getByText("Lucas Juvenil")).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Homem" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Mulher" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Juvenil" })).toBeInTheDocument();
  });

  it("deve cadastrar um novo aluno, limpar o formulário e recarregar a lista", async () => {
    api.get
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [alunosMock[0]] });
    api.post.mockResolvedValueOnce({ data: { id: 1 } });
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    const { container } = render(
      <MemoryRouter>
        <Alunos />
      </MemoryRouter>,
    );

    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(1));

    preencherFormulario(container, {
      nome: "Rafael Costa",
      email: "rafael@gb.com",
      dataNascimento: "1995-03-10",
      ultimaGraduacao: "2024-06-01",
      faixa: "Azul",
      grau: "2",
      genero: "Masculino",
    });

    fireEvent.click(screen.getByRole("button", { name: "Salvar Cadastro" }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/alunos/cadastrar", {
        nome: "Rafael Costa",
        email: "rafael@gb.com",
        dataNascimento: "1995-03-10",
        ultimaGraduacao: "2024-06-01",
        faixa: "Azul",
        grau: "2",
        genero: "Masculino",
      });
    });

    expect(alertSpy).toHaveBeenCalledWith("Aluno cadastrado com sucesso!");
    expect(await screen.findByText("Rafael Costa")).toBeInTheDocument();
  });

  it("deve editar um aluno existente, permitir cancelar edição e salvar alterações", async () => {
    const user = userEvent.setup();
    api.get
      .mockResolvedValueOnce({ data: alunosMock })
      .mockResolvedValueOnce({ data: alunosMock });
    api.put.mockResolvedValueOnce({ data: { ok: true } });
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    const { container } = render(
      <MemoryRouter>
        <Alunos />
      </MemoryRouter>,
    );

    await screen.findByText("Rafael Costa");

    const botoesEditar = screen.getAllByRole("button", { name: "Editar" });
    await user.click(botoesEditar[0]);

    expect(
      screen.getByRole("heading", { name: "Editando Aluno" }),
    ).toBeInTheDocument();
    expect(container.querySelector('input[type="email"]')).toBeDisabled();

    // Testa botão Cancelar e limpa formulário
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(
      screen.getByRole("heading", { name: "Cadastro de Aluno" }),
    ).toBeInTheDocument();

    // Abre edição novamente e salva alterações
    await user.click(screen.getAllByRole("button", { name: "Editar" })[0]);
    const textInputs = container.querySelectorAll('input[type="text"]');
    fireEvent.change(textInputs[0], { target: { value: "Rafael Costa Atualizado" } });

    await user.click(screen.getByRole("button", { name: "Salvar Alterações" }));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(
        "/alunos/1",
        expect.objectContaining({ nome: "Rafael Costa Atualizado" }),
      );
    });
    expect(alertSpy).toHaveBeenCalledWith("Alterações salvas com sucesso!");
  });

  it("deve excluir um aluno após confirmação", async () => {
    const user = userEvent.setup();
    api.get
      .mockResolvedValueOnce({ data: alunosMock })
      .mockResolvedValueOnce({ data: alunosMock.slice(1) });
    api.delete.mockResolvedValueOnce({ data: { ok: true } });
    vi.spyOn(window, "confirm").mockReturnValueOnce(true);

    render(
      <MemoryRouter>
        <Alunos />
      </MemoryRouter>,
    );

    await screen.findByText("Rafael Costa");

    const botoesExcluir = screen.getAllByRole("button", { name: "Excluir" });
    await user.click(botoesExcluir[0]);

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith("/alunos/1");
    });
    expect(api.get).toHaveBeenCalledTimes(2);
  });

  it("deve exibir mensagem de erro da API ao falhar ao salvar", async () => {
    api.get.mockResolvedValueOnce({ data: [] });
    api.post.mockRejectedValueOnce({
      response: { data: { error: "E-mail já cadastrado." } },
    });
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    const { container } = render(
      <MemoryRouter>
        <Alunos />
      </MemoryRouter>,
    );

    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(1));

    preencherFormulario(container, {
      nome: "Teste Erro",
      email: "erro@gb.com",
      dataNascimento: "1995-03-10",
      ultimaGraduacao: "2024-06-01",
      faixa: "Azul",
      grau: "1",
      genero: "Masculino",
    });

    fireEvent.click(screen.getByRole("button", { name: "Salvar Cadastro" }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("E-mail já cadastrado.");
    });
  });

  it("deve realizar logout e navegar para /", async () => {
    const user = userEvent.setup();
    localStorage.setItem("@JJTrack:usuario", JSON.stringify({ id: 1 }));
    api.get.mockResolvedValueOnce({ data: [] });

    render(
      <MemoryRouter>
        <Alunos />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "Sair" }));

    expect(localStorage.getItem("@JJTrack:usuario")).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});