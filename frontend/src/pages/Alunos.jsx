import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Dashboard.css";
import "./Alunos.css";
import logoGB from "../assets/logo.png";

export default function Alunos() {
  const navigate = useNavigate();

  // Estados do formulário
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [ultimaGraduacao, setUltimaGraduacao] = useState("");
  const [faixa, setFaixa] = useState("");
  const [grau, setGrau] = useState("");
  const [genero, setGenero] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [listaAlunos, setListaAlunos] = useState([]);

  const fetchAlunos = async () => {
    try {
      const response = await api.get("/alunos/listar");
      setListaAlunos(response.data);
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
    }
  };

  useEffect(() => {
    fetchAlunos();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("@JJTrack:usuario");
    navigate("/");
  };

  const limparFormulario = () => {
    setNome("");
    setEmail("");
    setDataNascimento("");
    setUltimaGraduacao("");
    setFaixa("");
    setGrau("");
    setGenero("");
    setEditandoId(null);
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    const dadosAluno = {
      nome,
      email,
      dataNascimento,
      ultimaGraduacao,
      faixa,
      grau,
      genero,
    };

    try {
      if (editandoId) {
        await api.put(`/alunos/${editandoId}`, dadosAluno);
        alert("Alterações salvas com sucesso!");
      } else {
        await api.post("/alunos/cadastrar", dadosAluno);
        alert("Aluno cadastrado com sucesso!");
      }
      limparFormulario();
      fetchAlunos();
    } catch (err) {
      alert(err.response?.data?.error || "Erro ao processar a requisição.");
    }
  };

  const handleExcluir = async (id) => {
    if (window.confirm("Tem certeza que deseja remover este aluno?")) {
      try {
        await api.delete(`/alunos/${id}`);
        fetchAlunos();
      } catch (error) {
        alert("Erro ao excluir aluno.");
      }
    }
  };

  const handleEditar = (aluno) => {
    const formatarParaInput = (dataString) => {
      if (!dataString) return "";
      const data = new Date(dataString);
      data.setMinutes(data.getMinutes() + data.getTimezoneOffset());
      return data.toISOString().split("T")[0];
    };

    setEditandoId(aluno.id);
    setNome(aluno.nome);
    setEmail(aluno.email);
    setDataNascimento(formatarParaInput(aluno.data_nascimento));
    setUltimaGraduacao(formatarParaInput(aluno.data_ultima_graduacao));
    setFaixa(aluno.faixa);
    setGrau(aluno.grau);
    setGenero(aluno.genero);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Funções Auxiliares
  const calcularIdade = (dataString) => {
    const hoje = new Date();
    const nascimento = new Date(dataString);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) idade--;
    return idade;
  };

  const formatarData = (dataString) => {
    if (!dataString) return "";
    const data = new Date(dataString);
    data.setMinutes(data.getMinutes() + data.getTimezoneOffset());
    return data.toLocaleDateString("pt-BR");
  };

  const alunosJuvenil = listaAlunos.filter(
    (a) => calcularIdade(a.data_nascimento) < 16,
  );
  const alunosHomens = listaAlunos.filter(
    (a) => calcularIdade(a.data_nascimento) >= 16 && a.genero === "Masculino",
  );
  const alunosMulheres = listaAlunos.filter(
    (a) => calcularIdade(a.data_nascimento) >= 16 && a.genero === "Feminino",
  );

  const RenderCardAluno = ({ aluno }) => (
    <div className="aluno-card" key={aluno.id}>
      <div className="nome">{aluno.nome}</div>
      <p>
        <strong>Nascimento:</strong> {formatarData(aluno.data_nascimento)}
      </p>
      <p>
        <strong>Últ. Graduação:</strong>{" "}
        {formatarData(aluno.data_ultima_graduacao)}
      </p>
      <p>
        <strong>Faixa:</strong> {aluno.faixa}
      </p>
      <p>
        <strong>Grau:</strong> {aluno.grau}
      </p>
      <div className="aluno-acoes">
        <button className="btn-acao" onClick={() => handleEditar(aluno)}>
          Editar
        </button>
        <button className="btn-acao" onClick={() => handleExcluir(aluno.id)}>
          Excluir
        </button>
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <header className="top-header">
        <button className="btn-sair" onClick={handleLogout}>
          Sair
        </button>
        <div className="logo-container">
          <img src={logoGB} alt="Logo Gracie Barra" className="logo-img" />
          <h2>Gracie Barra - Centro</h2>
        </div>
        <nav className="nav-menu">
          <button className="nav-item" onClick={() => navigate("/professor")}>
            Início
          </button>
          <button
            className="nav-item"
            onClick={() => navigate("/professor/agenda")}
          >
            Agenda
          </button>
          <button
            className="nav-item"
            onClick={() => navigate("/professor/graduacoes")}
          >
            Graduações
          </button>
          <button className="nav-item active">Alunos</button>
        </nav>
      </header>

      <div className="alunos-content">
        <div className="form-card">
          <h2>{editandoId ? "Editando Aluno" : "Cadastro de Aluno"}</h2>
          <form onSubmit={handleSalvar}>
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label>Nome Completo</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label>E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!!editandoId}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Data de Nascimento</label>
                <input
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Última Graduação</label>
                <input
                  type="date"
                  value={ultimaGraduacao}
                  onChange={(e) => setUltimaGraduacao(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Faixa</label>
                <select
                  value={faixa}
                  onChange={(e) => setFaixa(e.target.value)}
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="Branca">Branca</option>
                  <option value="Azul">Azul</option>
                  <option value="Roxa">Roxa</option>
                  <option value="Marrom">Marrom</option>
                  <option value="Preta">Preta</option>
                </select>
              </div>
              <div className="form-group">
                <label>Grau</label>
                <select
                  value={grau}
                  onChange={(e) => setGrau(e.target.value)}
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Gênero:</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="genero"
                    value="Masculino"
                    checked={genero === "Masculino"}
                    onChange={(e) => setGenero(e.target.value)}
                    required
                  />{" "}
                  Masculino
                </label>
                <label>
                  <input
                    type="radio"
                    name="genero"
                    value="Feminino"
                    checked={genero === "Feminino"}
                    onChange={(e) => setGenero(e.target.value)}
                    required
                  />{" "}
                  Feminino
                </label>
              </div>
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
              <button type="submit" className="btn-submit">
                {editandoId ? "Salvar Alterações" : "Salvar Cadastro"}
              </button>
              {editandoId && (
                <button
                  type="button"
                  className="btn-submit"
                  onClick={limparFormulario}
                  style={{ backgroundColor: "#666" }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="categorias-container">
          <div className="categoria-coluna">
            <h3>Homem</h3>
            {alunosHomens.map((a) => (
              <RenderCardAluno key={a.id} aluno={a} />
            ))}
          </div>
          <div className="categoria-coluna">
            <h3>Mulher</h3>
            {alunosMulheres.map((a) => (
              <RenderCardAluno key={a.id} aluno={a} />
            ))}
          </div>
          <div className="categoria-coluna">
            <h3>Juvenil</h3>
            {alunosJuvenil.map((a) => (
              <RenderCardAluno key={a.id} aluno={a} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
