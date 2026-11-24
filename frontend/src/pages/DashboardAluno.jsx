import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./DashboardAluno.css";
import logoGB from "../assets/Logo.png";

export default function DashboardAluno() {
  const navigate = useNavigate();
  const [historicoPresenca, setHistoricoPresenca] = useState([]);

  useEffect(() => {
    const usuarioLogado = localStorage.getItem("@JJTrack:usuario");
    if (!usuarioLogado) {
      navigate("/");
      return;
    }

    const dadosUsuario = JSON.parse(usuarioLogado);

    const fetchPresencas = async () => {
      try {
        const response = await api.get(`/alunos/presencas/${dadosUsuario.id}`);
        setHistoricoPresenca(response.data);
      } catch (error) {
        console.error("Erro ao buscar histórico:", error);
      }
    };

    fetchPresencas();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("@JJTrack:usuario");
    navigate("/");
  };

  const formatarDataHora = (dataString) => {
    const data = new Date(dataString);
    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    return `${dia}/${mes}`;
  };

  return (
    <div className="aluno-container">
      <header className="aluno-header">
        <button className="btn-sair-aluno" onClick={handleLogout}>
          Sair
        </button>
        <img src={logoGB} alt="Gracie Barra" className="aluno-logo" />
        <nav className="aluno-nav">
          <button className="aluno-nav-btn active">Início</button>
          <button
            className="aluno-nav-btn"
            onClick={() => navigate("/aluno/agenda")}
          >
            Agenda
          </button>
          <button
            className="aluno-nav-btn"
            onClick={() => navigate("/aluno/graduacao")}
          >
            Graduação
          </button>
        </nav>
      </header>

      <main className="aluno-content">
        {/* Removido o botão de Ler QR Code, a tela fica mais limpa e direta */}

        <div className="aluno-card" style={{ marginTop: "1rem" }}>
          <h3>Histórico de presença</h3>

          <div style={{ width: "100%" }}>
            {historicoPresenca.length > 0 ? (
              historicoPresenca.map((presenca, index) => (
                <div className="presenca-item" key={index}>
                  <span>{formatarDataHora(presenca.data_hora)}</span>
                  <span className="icone-check">✔</span>
                </div>
              ))
            ) : (
              <p style={{ textAlign: "center", color: "#666" }}>
                Nenhuma presença registrada ainda.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
