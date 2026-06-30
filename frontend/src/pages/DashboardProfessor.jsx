import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Dashboard.css";

// IMPORTANTE: Coloque a logo do Figma dentro da pasta frontend/src/assets/
// e descomente a linha abaixo quando for usar a imagem real:
import logoGB from "../assets/logo.png";

export default function DashboardProfessor() {
  const [alunos, setAlunos] = useState([]);
  const navigate = useNavigate();

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
          {/* CORREÇÃO AQUI: Adicionado o onClick apontando para a nova rota */}
          <button
            className="nav-item"
            onClick={() => navigate("/professor/agenda")}
          >
            Agenda
          </button>
          <button className="nav-item">Graduações</button>
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

        <button
          className="btn-qr"
          onClick={() => alert("Em breve: Geração de QR Code!")}
        >
          Gerar QR-Code
        </button>
      </main>
    </div>
  );
}
