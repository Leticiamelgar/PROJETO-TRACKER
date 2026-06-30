import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Dashboard.css";
import QRCode from 'react-qr-code'; 

import logoGB from "../assets/logo.png";

export default function DashboardProfessor() {
  const [alunos, setAlunos] = useState([]);
  const navigate = useNavigate();

  // Estados do Modal do QR Code
  const [modalAberto, setModalAberto] = useState(false);
  const [qrToken, setQrToken] = useState('');

  useEffect(() => {
    const buscarAlunos = async () => {
      try {
        const resposta = await api.get("/alunos/listar");
        setAlunos(resposta.data);
      } catch (err) {
        console.error("Erro ao buscar alunos", err);
      }
    };
    buscarAlunos();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("@JJTrack:usuario");
    navigate("/");
  };

  // Função que gera o token e abre a tela do QR Code
  const handleGerarQRCode = () => {
    const tokenTemporario = `sessao-treino-${Date.now()}`;
    setQrToken(tokenTemporario);
    setModalAberto(true);
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
          <button className="nav-item" onClick={() => navigate("/professor/agenda")}>
            Agenda
          </button>
          <button className="nav-item" onClick={() => navigate("/professor/graduacoes")}>
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

      {/* CONTEÚDO PRINCIPAL (CARDS E QR CODE) */}
      <main className="main-content">
        <div className="cards-row">
          <div className="card">
            <h3>Total de alunos</h3>
            <p className="value">{alunos.length}</p>
          </div>

          <div className="card">
            <h3>Presenças Hoje</h3>
            <p className="value">8</p> {/* Fixo por enquanto */}
          </div>

          <div className="card">
            <h3>Faltas</h3>
            <p className="value">2</p> {/* Fixo por enquanto */}
          </div>
        </div>

        {/* BOTÃO ATUALIZADO */}
        <button
          className="btn-qr btn-gerar-qrcode" 
          onClick={handleGerarQRCode}
        >
          Gerar QR-Code
        </button>
      </main>

      {/* JANELA FLUTUANTE (MODAL) DO QR CODE */}
      {modalAberto && (
        <div className="modal-overlay" onClick={() => setModalAberto(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Escaneie para registrar presença</h3>
            
            <QRCode value={qrToken} size={250} fgColor="#000000" bgColor="#FFFFFF" />
            
            <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '1rem' }}>Token válido para a aula atual.</p>
            
            <button className="btn-fechar-modal" onClick={() => setModalAberto(false)}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}