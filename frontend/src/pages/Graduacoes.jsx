import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import "./Graduacoes.css";
import logoGB from "../assets/logo.png";
import iconeLupa from "../assets/busca.png";
import iconeFiltro from "../assets/filtro.png";

export default function Graduacoes() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState("Todos");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const alunosMock = [
    {
      id: 1,
      nome: "Gustavo Peregrino",
      faixa: "Branca",
      graus: 4,
      progresso: 85,
      apto: true,
    },
    {
      id: 2,
      nome: "Exemplo Aluno",
      faixa: "Azul",
      graus: 1,
      progresso: 40,
      apto: false,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("@JJTrack:usuario");
    navigate("/");
  };

  const filtros = [
    "Todos",
    "Aptos",
    "Não Aptos",
    "Branca",
    "Azul",
    "Roxa",
    "Marrom",
    "Preta",
  ];

  return (
    <div className="dashboard-container">
      <header className="top-header">
        <button className="btn-sair" onClick={handleLogout}>
          Sair
        </button>
        <div className="logo-container">
          <img src={logoGB} alt="Logo Gracie Barra" className="logo-img" />
          <h2>Gracie Barra - Centro</h2>
        </div>
        <nav className="nav-menu">
          <button className="nav-item" onClick={() => navigate("/professor")}>
            Início
          </button>
          <button
            className="nav-item"
            onClick={() => navigate("/professor/agenda")}
          >
            Agenda
          </button>
          <button className="nav-item active">Graduações</button>
          <button
            className="nav-item"
            onClick={() => navigate("/professor/alunos")}
          >
            Alunos
          </button>
        </nav>
      </header>

      <div className="graduacoes-content">
        <div className="search-container">
          <div className="search-input-wrapper">
            <img src={iconeLupa} alt="Buscar" className="search-icon" />
            <input
              type="text"
              placeholder="Buscar Aluno..."
              className="search-input"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <img
            src={iconeFiltro}
            alt="Filtrar"
            className="filter-icon"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          />
        </div>

        {mostrarFiltros && (
          <div className="filters-row">
            {filtros.map((filtro) => (
              <button
                key={filtro}
                className={`btn-filter ${filtroAtivo === filtro ? "active" : ""}`}
                onClick={() => setFiltroAtivo(filtro)}
              >
                {filtro}
              </button>
            ))}
          </div>
        )}

        <div className="graduacoes-container">
          <h2>Acompanhamento de progresso</h2>
          {alunosMock.map((aluno, index) => (
            <div className="progress-card" key={index}>
              <div className="student-info">
                <h4>{aluno.nome}</h4>
                <p>
                  Faixa {aluno.faixa} - {aluno.graus} Graus
                </p>
                {aluno.apto && (
                  <>
                    <span className="badge-status">Apto</span>
                    <button
                      className="badge-action"
                      onClick={() => alert("Graduação realizada!")}
                    >
                      Graduar
                    </button>
                  </>
                )}
              </div>
              <div className="progress-bar-wrapper">
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${aluno.progresso}%` }}
                  ></div>
                </div>
                <span className="progress-percentage">{aluno.progresso}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
