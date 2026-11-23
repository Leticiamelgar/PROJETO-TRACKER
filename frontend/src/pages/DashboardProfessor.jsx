import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Dashboard.css";

import logoGB from "../assets/logo.png";

export default function DashboardProfessor() {
  const [alunos, setAlunos] = useState([]);
  const [presencasHoje, setPresencasHoje] = useState(0);
  const navigate = useNavigate();

  const buscarDadosPainel = async () => {
    try {
      // Busca a lista de alunos
      const respostaAlunos = await api.get("/alunos/listar");
      setAlunos(respostaAlunos.data);

      // Busca as presenças de hoje
      const respostaEstatisticas = await api.get("/alunos/estatisticas/hoje");
      setPresencasHoje(respostaEstatisticas.data.presencasHoje);
    } catch (err) {
      console.error("Erro ao buscar dados do painel", err);
    }
  };

  useEffect(() => {
    const carregarDadosPainel = async () => {
      try {
        // Busca a lista de alunos
        const respostaAlunos = await api.get("/alunos/listar");
        setAlunos(respostaAlunos.data);

        // Busca as presenças de hoje
        const respostaEstatisticas = await api.get("/alunos/estatisticas/hoje");
        setPresencasHoje(respostaEstatisticas.data.presencasHoje);
      } catch (err) {
        console.error("Erro ao buscar dados do painel", err);
      }
    };

    carregarDadosPainel();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("@JJTrack:usuario");
    navigate("/");
  };

  const handleDarPresenca = async (id, nome) => {
    try {
      await api.post(`/alunos/registrar-presenca/${id}`);
      alert(`✅ Presença registrada para ${nome}!`);
      // Atualiza a lista e os cards automaticamente
      buscarDadosPainel();
    } catch (error) {
      console.error("Erro ao registrar presença", error);
      alert("Erro ao tentar registrar a presença.");
    }
  };

  // Matemática dos cards dinâmicos
  const totalAlunos = alunos.length;
  const faltasHoje = Math.max(0, totalAlunos - presencasHoje); // Evita número negativo

  return (
    <div className="dashboard-container">
      {/* HEADER E MENU */}
      <header className="top-header">
        <button className="btn-sair" onClick={handleLogout}>
          Sair
        </button>

        <div className="logo-container">
          <img src={logoGB} alt="Logo Gracie Barra" className="logo-img" />
          <h2>Gracie Barra - Centro</h2>
        </div>

        <nav className="nav-menu">
          <button className="nav-item active">Início</button>
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
          <button
            className="nav-item"
            onClick={() => navigate("/professor/alunos")}
          >
            Alunos
          </button>
        </nav>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="main-content">
        <div className="cards-row">
          <div className="card">
            <h3>Total de alunos</h3>
            <p className="value">{totalAlunos}</p>
          </div>

          <div className="card">
            <h3>Presenças Hoje</h3>
            <p className="value" style={{ color: "#27ae60" }}>
              {presencasHoje}
            </p>
          </div>

          <div className="card">
            <h3>Faltas</h3>
            <p className="value" style={{ color: "#d32f2f" }}>
              {faltasHoje}
            </p>
          </div>
        </div>

        {/* LISTA DE CHAMADA DIGITAL */}
        <div
          style={{
            marginTop: "2rem",
            background: "#fff",
            padding: "2rem",
            borderRadius: "15px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
            width: "100%",
            maxWidth: "800px",
            alignSelf: "center",
          }}
        >
          <h2
            style={{
              marginBottom: "1.5rem",
              textAlign: "center",
              color: "#333",
            }}
          >
            Lista de Chamada
          </h2>

          {alunos.length > 0 ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {alunos.map((aluno) => (
                <div
                  key={aluno.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "1rem",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <strong style={{ fontSize: "1.1rem", color: "#1a1a1a" }}>
                      {aluno.nome}
                    </strong>
                    <span style={{ fontSize: "0.85rem", color: "#666" }}>
                      Faixa {aluno.faixa} - {aluno.grau} graus
                    </span>
                  </div>

                  <button
                    onClick={() => handleDarPresenca(aluno.id, aluno.nome)}
                    style={{
                      background: "#27ae60",
                      color: "white",
                      border: "none",
                      padding: "0.6rem 1.2rem",
                      borderRadius: "20px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      transition: "background 0.2s ease-in-out",
                    }}
                    onMouseOver={(e) => (e.target.style.background = "#219653")}
                    onMouseOut={(e) => (e.target.style.background = "#27ae60")}
                  >
                    Dar Presença
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: "center", color: "#666" }}>
              Nenhum aluno matriculado ainda.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}