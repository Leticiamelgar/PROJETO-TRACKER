import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Dashboard.css";
import "./Graduacoes.css";
import logoGB from "../assets/logo.png";
import iconeLupa from "../assets/busca.png";
import iconeFiltro from "../assets/filtro.png";

export default function Graduacoes() {
  const navigate = useNavigate();
  const [alunos, setAlunos] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState("Todos");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    fetchAlunos();
  }, []);

  const fetchAlunos = async () => {
    try {
      const response = await api.get("/alunos/listar");
      setAlunos(response.data);
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
    }
  };

  const handleGraduar = async (id) => {
    if (
      window.confirm(
        "Confirmar graduação? O grau será incrementado e a data resetada para hoje.",
      )
    ) {
      try {
        await api.put(`/alunos/graduar/${id}`);
        alert("Graduação realizada com sucesso!");
        fetchAlunos();
      } catch (error) {
        alert("Erro ao realizar graduação.");
      }
    }
  };

  // Lógica unificada para definir o tempo necessário em meses
  const getTempoNecessario = (aluno) => {
    if (aluno.faixa === "Branca") return 12;
    if (aluno.faixa === "Azul") return 24;
    if (aluno.faixa === "Roxa") return 18;
    if (aluno.faixa === "Marrom") return 18;
    if (aluno.faixa === "Preta") return parseInt(aluno.grau) >= 4 ? 60 : 36;
    return 0;
  };

  const calcularProgresso = (aluno) => {
    const hoje = new Date();
    const ultima = new Date(aluno.data_ultima_graduacao);
    const diffMeses =
      (hoje.getFullYear() - ultima.getFullYear()) * 12 +
      (hoje.getMonth() - ultima.getMonth());
    const tempoNecessario = getTempoNecessario(aluno);

    const progresso = Math.min(
      100,
      Math.floor((diffMeses / tempoNecessario) * 100),
    );
    const apto = progresso >= 100;
    return { progresso, apto };
  };

  // Nova função para calcular a data prevista
  const calcularDataPrevista = (aluno) => {
    const ultima = new Date(aluno.data_ultima_graduacao);
    const tempoNecessario = getTempoNecessario(aluno);

    // Adiciona os meses à data da última graduação
    ultima.setMonth(ultima.getMonth() + tempoNecessario);
    return ultima.toLocaleDateString("pt-BR");
  };

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

  const alunosFiltrados = alunos.filter((aluno) => {
    const matchBusca = aluno.nome.toLowerCase().includes(busca.toLowerCase());
    const matchFiltro =
      filtroAtivo === "Todos" ||
      (filtroAtivo === "Aptos" && calcularProgresso(aluno).apto) ||
      (filtroAtivo === "Não Aptos" && !calcularProgresso(aluno).apto) ||
      aluno.faixa === filtroAtivo;
    return matchBusca && matchFiltro;
  });

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
          {alunosFiltrados.length > 0 ? (
            alunosFiltrados.map((aluno) => {
              const { progresso, apto } = calcularProgresso(aluno);
              const dataPrevista = calcularDataPrevista(aluno);

              return (
                <div className="progress-card" key={aluno.id}>
                  <div className="student-info">
                    <h4>{aluno.nome}</h4>
                    <p>
                      Faixa {aluno.faixa} - {aluno.grau} Graus
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "#888" }}>
                      Previsão: <strong>{dataPrevista}</strong>
                    </p>
                    {apto && (
                      <div style={{ marginTop: "5px" }}>
                        <span className="badge-status">Apto</span>
                        <button
                          className="badge-action"
                          onClick={() => handleGraduar(aluno.id)}
                        >
                          Graduar
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="progress-bar-wrapper">
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${progresso}%`,
                          backgroundColor: apto ? "#27ae60" : "#ff0000",
                        }}
                      ></div>
                    </div>
                    <span className="progress-percentage">{progresso}%</span>
                  </div>
                </div>
              );
            })
          ) : (
            <p style={{ textAlign: "center", color: "#666" }}>
              Nenhum aluno encontrado.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
