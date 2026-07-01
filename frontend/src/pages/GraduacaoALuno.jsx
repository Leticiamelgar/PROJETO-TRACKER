import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./DashboardAluno.css";
import logoGB from "../assets/logo.png";

export default function GraduacaoAluno() {
  const navigate = useNavigate();
  const [alunoDb, setAlunoDb] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // Regra de tempo igual à do professor
  const getTempoNecessario = (faixa, grau) => {
    if (faixa === "Branca") return 12;
    if (faixa === "Azul") return 24;
    if (faixa === "Roxa") return 18;
    if (faixa === "Marrom") return 18;
    if (faixa === "Preta") return parseInt(grau) >= 4 ? 60 : 36;
    return 12;
  };

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
        // Log para debug caso os dados não apareçam na tela
        console.log("Dados recebidos do banco:", response.data);
        setAlunoDb(response.data);
      } catch (error) {
        console.error("Erro ao carregar dados do aluno:", error);
      } finally {
        setCarregando(false);
      }
    };

    fetchDadosAluno();
  }, [navigate]);

  if (carregando)
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
  if (!alunoDb)
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

  // --- CÁLCULOS DE TEMPO (IDÊNTICO AO ADMIN) ---
  const ultima = new Date(alunoDb.data_ultima_graduacao);
  const tempoNecessario = getTempoNecessario(alunoDb.faixa, alunoDb.grau);

  // Data Prevista
  const dataPrevista = new Date(ultima);
  dataPrevista.setMonth(ultima.getMonth() + tempoNecessario);

  // Dias Restantes
  const hoje = new Date();
  const diffTime = dataPrevista - hoje;
  const diasRestantes = Math.max(
    0,
    Math.ceil(diffTime / (1000 * 60 * 60 * 24)),
  );

  // Porcentagem para a barra (baseado no tempo decorrido vs total)
  const mesesDecorridos =
    (hoje.getFullYear() - ultima.getFullYear()) * 12 +
    (hoje.getMonth() - ultima.getMonth());
  const progressoPorcentagem = Math.min(
    100,
    Math.max(0, Math.floor((mesesDecorridos / tempoNecessario) * 100)),
  );

  return (
    <div className="aluno-container">
      <header className="aluno-header">
        <button
          className="btn-sair-aluno"
          onClick={() => {
            localStorage.removeItem("@JJTrack:usuario");
            navigate("/");
          }}
        >
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
        {/* CARD DA FAIXA */}
        <div className="aluno-card" style={{ padding: "2rem" }}>
          <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>🥋</div>
          <h2 style={{ margin: 0, textAlign: "center", fontSize: "1.5rem" }}>
            Faixa {alunoDb.faixa} <br />
            <span style={{ fontSize: "1.2rem", color: "#666" }}>
              {alunoDb.grau} graus
            </span>
          </h2>
        </div>

        {/* CARD DE PREVISÃO */}
        <div className="aluno-card" style={{ padding: "2rem" }}>
          <h3>Previsão de graduação</h3>

          <div
            className="graduacao-aulas"
            style={{ fontSize: "2rem", color: "#c62828" }}
          >
            {dataPrevista.toLocaleDateString("pt-BR")}
          </div>
          <div className="graduacao-texto">Data estimada</div>

          <div
            style={{
              marginTop: "1rem",
              fontSize: "1rem",
              fontWeight: "bold",
              color: "#333",
            }}
          >
            {diasRestantes > 0
              ? `${diasRestantes} dias restantes`
              : "Apto para graduação!"}
          </div>

          <div
            className="aluno-progress-container"
            style={{ marginTop: "1rem" }}
          >
            <div
              className="aluno-progress-fill"
              style={{
                width: `${progressoPorcentagem}%`,
                backgroundColor:
                  progressoPorcentagem >= 100 ? "#27ae60" : "#ff0000",
              }}
            ></div>
          </div>
        </div>
      </main>
    </div>
  );
}
