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

  // Estado da lista de alunos
  const [listaAlunos, setListaAlunos] = useState([]);

  // Busca os alunos na API
  const fetchAlunos = async () => {
    try {
      const response = await api.get("/alunos/listar");
      setListaAlunos(response.data);
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
    }
  };

  // Carrega a lista ao abrir a tela
  useEffect(() => {
    fetchAlunos();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("@JJTrack:usuario");
    navigate("/");
  };

  const handleCadastrar = async (e) => {
    e.preventDefault();

    try {
      await api.post("/alunos/cadastrar", {
        nome,
        email,
        dataNascimento,
        ultimaGraduacao,
        faixa,
        grau,
        genero,
      });

      alert("Aluno cadastrado com sucesso no tatame! A senha padrão é 123456.");

      // Limpa os campos
      setNome("");
      setEmail("");
      setDataNascimento("");
      setUltimaGraduacao("");
      setFaixa("");
      setGrau("");
      setGenero("");

      // Atualiza a lista exibida nas colunas
      fetchAlunos();
    } catch (err) {
      alert(err.response?.data?.error || "Erro ao cadastrar aluno.");
    }
  };

  // Helpers para formatar dados e calcular idade
  const calcularIdade = (dataString) => {
    const hoje = new Date();
    const nascimento = new Date(dataString);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const formatarData = (dataString) => {
    if (!dataString) return "";
    const data = new Date(dataString);
    data.setMinutes(data.getMinutes() + data.getTimezoneOffset());
    return data.toLocaleDateString("pt-BR");
  };

  // Filtragem para as colunas (corte de 16 anos para Juvenil)
  const alunosJuvenil = listaAlunos.filter(
    (a) => calcularIdade(a.data_nascimento) < 16,
  );
  const alunosHomens = listaAlunos.filter(
    (a) => calcularIdade(a.data_nascimento) >= 16 && a.genero === "Masculino",
  );
  const alunosMulheres = listaAlunos.filter(
    (a) => calcularIdade(a.data_nascimento) >= 16 && a.genero === "Feminino",
  );

  // Componente interno para o Card
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
        <button className="btn-acao">Editar</button>
        <button className="btn-acao">Excluir</button>
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
          <button className="nav-item">Agenda</button>
          <button className="nav-item">Graduações</button>
          <button className="nav-item active">Alunos</button>
        </nav>
      </header>

      <div className="alunos-content">
        <div className="form-card">
          <h2>Cadastro de Aluno</h2>

          <form onSubmit={handleCadastrar}>
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label>Nome Completo</label>
              <input
                type="text"
                placeholder="Digite o nome do aluno"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label>E-mail</label>
              <input
                type="email"
                placeholder="Digite o e-mail do aluno"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                <label className="radio-item">
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
                <label className="radio-item">
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

            <button type="submit" className="btn-submit">
              Salvar Cadastro
            </button>
          </form>
        </div>

        <div className="categorias-container">
          <div className="categoria-coluna">
            <h3>Homem</h3>
            {alunosHomens.length > 0 ? (
              alunosHomens.map((aluno) => (
                <RenderCardAluno key={aluno.id} aluno={aluno} />
              ))
            ) : (
              <p
                style={{
                  textAlign: "center",
                  fontSize: "0.85rem",
                  color: "#666",
                }}
              >
                Nenhum aluno cadastrado.
              </p>
            )}
          </div>

          <div className="categoria-coluna">
            <h3>Mulher</h3>
            {alunosMulheres.length > 0 ? (
              alunosMulheres.map((aluno) => (
                <RenderCardAluno key={aluno.id} aluno={aluno} />
              ))
            ) : (
              <p
                style={{
                  textAlign: "center",
                  fontSize: "0.85rem",
                  color: "#666",
                }}
              >
                Nenhuma aluna cadastrada.
              </p>
            )}
          </div>

          <div className="categoria-coluna">
            <h3>Juvenil</h3>
            {alunosJuvenil.length > 0 ? (
              alunosJuvenil.map((aluno) => (
                <RenderCardAluno key={aluno.id} aluno={aluno} />
              ))
            ) : (
              <p
                style={{
                  textAlign: "center",
                  fontSize: "0.85rem",
                  color: "#666",
                }}
              >
                Nenhum aluno juvenil cadastrado.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
