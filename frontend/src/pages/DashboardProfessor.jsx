import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Dashboard.css";

import logoGB from "../assets/logo.png";

export default function DashboardProfessor() {
  const [alunos, setAlunos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    buscarAlunos();
  }, []);

  const buscarAlunos = async () => {
    try {
      const resposta = await api.get("/alunos/listar");
      setAlunos(resposta.data);
    } catch (err) {
      console.error("Erro ao buscar alunos", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("@JJTrack:usuario");
    navigate("/");
  };

  // Função para dar presença ao clicar no botão
  const handleDarPresenca = async (id, nome) => {
    try {
      await api.post(`/alunos/registrar-presenca/${id}`);
      alert(`✅ Presença registrada para ${nome}!`);
      // Opcional: Atualiza a lista para refletir os números reais caso queira
      buscarAlunos();
    } catch (error) {
      console.error("Erro ao registrar presença", error);
      alert("Erro ao tentar registrar a presença.");
    }
  };

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
            <p className="value">{alunos.length}</p>
          </div>

          <div className="card">
            <h3>Presenças Hoje</h3>
            <p className="value">8</p>{" "}
            {/* Fixo por enquanto, conectaremos depois */}
          </div>

          <div className="card">
            <h3>Faltas</h3>
            <p className="value">2</p>{" "}
            {/* Fixo por enquanto, conectaremos depois */}
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
