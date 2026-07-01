import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./DashboardAluno.css";
import logoGB from "../assets/logo.png";

export default function DashboardAluno() {
  const navigate = useNavigate();
  const [dados, setDados] = useState(null);

  // Lista simulada por enquanto (até conectarmos a tabela de presenças do banco)
  const historicoPresenca = ["18/05", "15/05", "13/05"];

  useEffect(() => {
    const usuarioLogado = localStorage.getItem("@JJTrack:usuario");
    if (!usuarioLogado) {
      navigate("/");
    } else {
      setDados(JSON.parse(usuarioLogado));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("@JJTrack:usuario");
    navigate("/");
  };

  const handleLerQRCode = () => {
    // Aqui entrará a lógica de abrir a câmera futuramente
    alert("Câmera aberta! Posicione o QR Code gerado pelo professor.");
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
        <button className="btn-ler-qr" onClick={handleLerQRCode}>
          Ler QR code
        </button>

        <div className="aluno-card">
          <h3>Histórico de presença</h3>

          <div style={{ width: "100%" }}>
            {historicoPresenca.map((data, index) => (
              <div className="presenca-item" key={index}>
                <span>{data}</span>
                <span className="icone-check">✔</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
