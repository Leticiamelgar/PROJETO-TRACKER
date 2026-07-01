import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardAluno.css";
import logoGB from "../assets/logo.png";

export default function GraduacaoAluno() {
  const navigate = useNavigate();
  const [dados, setDados] = useState(null);

  // Valores simulados até conectarmos as contagens reais do banco
  const aulasFaltantes = 12;
  const progressoPorcentagem = 75; // Preenche 75% da barra

  useEffect(() => {
    const usuarioLogado = localStorage.getItem("@JJTrack:usuario");
    if (!usuarioLogado) {
      navigate("/");
    } else {
      setDados(JSON.parse(usuarioLogado));
      // Aqui futuramente você fará um api.get(`/alunos/${id}`) para pegar a faixa exata e presenças
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("@JJTrack:usuario");
    navigate("/");
  };

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
        {/* CARD DA FAIXA ATUAL */}
        <div className="aluno-card" style={{ padding: "2rem" }}>
          {/* Placeholder para a imagem da faixa. Você pode colocar as imagens das faixas na pasta assets */}
          <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>🥋</div>
          <h2 style={{ margin: 0, textAlign: "center" }}>
            Faixa Branca 4 graus
          </h2>
        </div>

        {/* CARD DE PROGRESSO */}
        <div className="aluno-card" style={{ padding: "2rem" }}>
          <h3>Progresso para graduação</h3>

          <div className="graduacao-aulas">{aulasFaltantes}</div>
          <div className="graduacao-texto">Aulas restantes</div>

          <div className="aluno-progress-container">
            <div
              className="aluno-progress-fill"
              style={{ width: `${progressoPorcentagem}%` }}
            ></div>
          </div>
        </div>
      </main>
    </div>
  );
}
