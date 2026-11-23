import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Login from "../pages/Login";
import api from "../services/api";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const atual = await vi.importActual("react-router-dom");
  return {
    ...atual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../services/api", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("Interface - Tela de Login (Login.jsx)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("deve renderizar os campos de e-mail, senha, perfil e botão entrar", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    expect(screen.getByText("Jiu-Jitsu Track")).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/perfil/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
  });

  it("deve autenticar um Professor, salvar no localStorage e redirecionar para /professor", async () => {
    const user = userEvent.setup();
    const dadosProfessor = {
      id: 1,
      nome: "Mestre Carlos",
      email: "mestre@academia.com",
      perfil: "Professor",
    };

    api.post.mockResolvedValueOnce({ data: dadosProfessor });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/e-mail/i), "mestre@academia.com");
    await user.type(screen.getByLabelText(/senha/i), "123456");
    await user.selectOptions(screen.getByLabelText(/perfil/i), "Professor");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/login", {
        email: "mestre@academia.com",
        senha: "123456",
        perfil: "Professor",
      });
      expect(JSON.parse(localStorage.getItem("@JJTrack:usuario"))).toEqual(
        dadosProfessor,
      );
      expect(mockNavigate).toHaveBeenCalledWith("/professor");
    });
  });

  it("deve redirecionar para /aluno quando o perfil autenticado for Aluno", async () => {
    const user = userEvent.setup();
    const dadosAluno = {
      id: 2,
      nome: "João Silva",
      email: "joao@academia.com",
      perfil: "Aluno",
    };

    api.post.mockResolvedValueOnce({ data: dadosAluno });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/e-mail/i), "joao@academia.com");
    await user.type(screen.getByLabelText(/senha/i), "123456");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/aluno");
    });
  });

  it("deve exibir a mensagem de erro retornada pela API quando o login falhar", async () => {
    const user = userEvent.setup();
    api.post.mockRejectedValueOnce({
      response: { data: { error: "Senha incorreta." } },
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/e-mail/i), "joao@academia.com");
    await user.type(screen.getByLabelText(/senha/i), "errada");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    expect(await screen.findByText("Senha incorreta.")).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("deve exibir mensagem padrão quando ocorrer falha de rede sem resposta da API", async () => {
    const user = userEvent.setup();
    api.post.mockRejectedValueOnce(new Error("Network Error"));

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/e-mail/i), "joao@academia.com");
    await user.type(screen.getByLabelText(/senha/i), "123456");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    expect(
      await screen.findByText("Erro ao tentar realizar o login."),
    ).toBeInTheDocument();
  });
});