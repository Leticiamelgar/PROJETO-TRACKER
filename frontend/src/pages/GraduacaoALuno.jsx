import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./DashboardAluno.css";
import logoGB from "../assets/logo.png";

export default function GraduacaoAluno() {
  const navigate = useNavigate();
  const [alunoDb, setAlunoDb] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [mensagemErro, setMensagemErro] = useState("");

  useEffect(() => {
    const usuarioLogado = localStorage.getItem("@JJTrack:usuario");
    if (!usuarioLogado) {
      navigate("/");
      return;
    }

    const dados = JSON.parse(usuarioLogado);

    const fetchDadosAluno = async () => {
      try {
        const response = await api.get(`/alunos/${dados.id}`);
        console.log("Dados que chegaram do banco:", response.data); // Isso tem que aparecer no Console (F12)
        setAlunoDb(response.data);
      } catch (error) {
        console.error("Erro na API:", error);
        setMensagemErro("Não foi possível conectar ao banco de dados.");
      } finally {
        setCarregando(false);
      }
    };

    fetchDadosAluno();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("@JJTrack:usuario");
    navigate("/");
  };

  if (carregando) {
    return (
      <div
        style={{
          textAlign: "center",
          marginTop: "50px",
          fontSize: "1.2rem",
          fontWeight: "bold",
        }}
      >
        🥋 Amarrando a faixa... (Carregando)
      </div>
    );
  }

  if (mensagemErro || !alunoDb) {
    return (
      <div
        style={{
          textAlign: "center",
          marginTop: "50px",
          color: "red",
          fontWeight: "bold",
        }}
      >
        {mensagemErro || "Erro ao carregar os dados do aluno."}
      </div>
    );
  }

  // --- MATEMÁTICA DINÂMICA DAS AULAS ---
  const totalPresencas = Number(alunoDb.total_presencas) || 0;

  const calcularAulasNecessarias = (faixa) => {
    if (faixa === "Branca") return 30;
    if (faixa === "Azul") return 45;
    if (faixa === "Roxa") return 55;
    if (faixa === "Marrom") return 65;
    if (faixa === "Preta") return 100;
    return 30;
  };

  const aulasNecessarias = calcularAulasNecessarias(alunoDb.faixa);
  const aulasFaltantes = Math.max(0, aulasNecessarias - totalPresencas);
  const progressoPorcentagem = Math.min(
    100,
    Math.floor((totalPresencas / aulasNecessarias) * 100),
  );

  return (
    <div className="aluno-container">
      <header className="aluno-header">
        <button className="btn-sair-aluno" onClick={handleLogout}>
          Sair
        </button>
        <img src={logoGB} alt="Gracie Barra" className="aluno-logo" />
        <nav className="aluno-nav">
          <button className="aluno-nav-btn" onClick={() => navigate("/aluno")}>
            Início
          </button>
          <button
            className="aluno-nav-btn"
            onClick={() => navigate("/aluno/agenda")}
          >
            Agenda
          </button>
          <button className="aluno-nav-btn active">Graduação</button>
        </nav>
      </header>

      <main className="aluno-content">
        <div className="aluno-card" style={{ padding: "2rem" }}>
          <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>🥋</div>
          <h2 style={{ margin: 0, textAlign: "center", fontSize: "1.5rem" }}>
            Faixa {alunoDb.faixa || "Branca"} <br />
            <span style={{ fontSize: "1.2rem", color: "#666" }}>
              {alunoDb.grau || 0} graus
            </span>
          </h2>
        </div>

        <div className="aluno-card" style={{ padding: "2rem" }}>
          <h3>Progresso para graduação</h3>

          {/* AQUI ESTÁ O NÚMERO DINÂMICO QUE VAI MUDAR SOZINHO */}
          <div className="graduacao-aulas">{aulasFaltantes}</div>
          <div className="graduacao-texto">Aulas restantes</div>

          <div className="aluno-progress-container">
            <div
              className="aluno-progress-fill"
              style={{
                width: `${progressoPorcentagem}%`,
                backgroundColor:
                  progressoPorcentagem >= 100 ? "#27ae60" : "#ff0000",
              }}
            ></div>
          </div>
          <p style={{ marginTop: "10px", fontWeight: "bold" }}>
            {progressoPorcentagem}% ({totalPresencas}/{aulasNecessarias} aulas)
          </p>
        </div>
      </main>
    </div>
  );
}
