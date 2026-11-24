import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./DashboardAluno.css";
import logoGB from "../assets/Logo.png";

export default function AgendaAluno() {
  const navigate = useNavigate();
  const [listaAgenda, setListaAgenda] = useState([]);

  useEffect(() => {
    const fetchAgenda = async () => {
      try {
        const response = await api.get("/agenda/listar");
        setListaAgenda(response.data);
      } catch (error) {
        console.error("Erro ao buscar agenda:", error);
      }
    };
    fetchAgenda();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("@JJTrack:usuario");
    navigate("/");
  };

  const diasDaSemana = [
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ];

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
          <button className="aluno-nav-btn active">Agenda</button>
          <button
            className="aluno-nav-btn"
            onClick={() => navigate("/aluno/graduacao")}
          >
            Graduação
          </button>
        </nav>
      </header>

      <main
        className="aluno-content"
        style={{ maxWidth: "800px", margin: "0 auto" }}
      >
        <div
          className="agenda-grid"
          style={{
            width: "100%",
            marginTop: "1rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            justifyContent: "center",
          }}
        >
          {diasDaSemana.map((dia) => {
            const aulasDoDia = listaAgenda.filter((a) => a.dia_semana === dia);
            return (
              <div
                className="dia-coluna"
                key={dia}
                style={{
                  background: "white",
                  padding: "1rem",
                  borderRadius: "8px",
                  minWidth: "140px",
                  flex: "1",
                }}
              >
                <h3
                  style={{
                    textAlign: "center",
                    borderBottom: "2px solid #ccc",
                    paddingBottom: "0.5rem",
                    margin: "0 0 1rem 0",
                  }}
                >
                  {dia}
                </h3>
                {aulasDoDia.length > 0 ? (
                  aulasDoDia.map((aula) => (
                    <div
                      key={aula.id}
                      style={{
                        border: "1px solid #333",
                        margin: "0.5rem 0",
                        padding: "0.5rem",
                        borderRadius: "4px",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      <div style={{ color: "#c62828" }}>{aula.horario}</div>
                      <div>{aula.tipo_aula}</div>
                    </div>
                  ))
                ) : (
                  <p style={{ textAlign: "center", color: "#999", margin: 0 }}>
                    -
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
