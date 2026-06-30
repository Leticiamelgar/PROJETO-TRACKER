import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Dashboard.css";
import "./Agenda.css";
import logoGB from "../assets/logo.png";

export default function Agenda() {
  const navigate = useNavigate();

  // GUARDA DE ROTA: Verifica se o usuário está logado ao carregar a página
  useEffect(() => {
    const usuarioLogado = localStorage.getItem("@JJTrack:usuario");
    if (!usuarioLogado) {
      navigate("/");
    }
  }, [navigate]);

  const [diaSemana, setDiaSemana] = useState("");
  const [horario, setHorario] = useState("");
  const [tipoAula, setTipoAula] = useState("");

  const [editandoId, setEditandoId] = useState(null);
  const [listaAgenda, setListaAgenda] = useState([]);

  const fetchAgenda = async () => {
    try {
      const response = await api.get("/agenda/listar");
      setListaAgenda(response.data);
    } catch (error) {
      console.error("Erro ao buscar agenda:", error);
    }
  };

  useEffect(() => {
    fetchAgenda();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("@JJTrack:usuario");
    navigate("/");
  };

  const limparFormulario = () => {
    setDiaSemana("");
    setHorario("");
    setTipoAula("");
    setEditandoId(null);
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    const dadosAula = { dia_semana: diaSemana, horario, tipo_aula: tipoAula };

    try {
      if (editandoId) {
        await api.put(`/agenda/${editandoId}`, dadosAula);
        alert("Aula atualizada com sucesso!");
      } else {
        await api.post("/agenda/cadastrar", dadosAula);
        alert("Aula adicionada à grade!");
      }
      limparFormulario();
      fetchAgenda();
    } catch (err) {
      alert(err.response?.data?.error || "Erro ao salvar aula.");
    }
  };

  const handleExcluir = async (id) => {
    if (window.confirm("Remover este horário da grade?")) {
      try {
        await api.delete(`/agenda/${id}`);
        fetchAgenda();
      } catch (error) {
        alert("Erro ao excluir aula.");
      }
    }
  };

  const handleEditar = (aula) => {
    setEditandoId(aula.id);
    setDiaSemana(aula.dia_semana);
    setHorario(aula.horario);
    setTipoAula(aula.tipo_aula);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderColunaDia = (diaNome) => {
    const aulasDoDia = listaAgenda.filter((a) => a.dia_semana === diaNome);

    return (
      <div className="dia-coluna" key={diaNome}>
        <h3>{diaNome}</h3>
        {aulasDoDia.length > 0 ? (
          aulasDoDia.map((aula) => (
            <div
              className={`aula-card tipo-${aula.tipo_aula.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}`}
              key={aula.id}
            >
              <div className="aula-horario">{aula.horario}</div>
              <div className="aula-tipo">{aula.tipo_aula}</div>
              <div className="aula-acoes">
                <button onClick={() => handleEditar(aula)}>Editar</button>
                <button onClick={() => handleExcluir(aula.id)}>X</button>
              </div>
            </div>
          ))
        ) : (
          <p className="sem-aula">-</p>
        )}
      </div>
    );
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
          <button className="nav-item active">Agenda</button>
          <button className="nav-item">Graduações</button>
          <button
            className="nav-item"
            onClick={() => navigate("/professor/alunos")}
          >
            Alunos
          </button>
        </nav>
      </header>

      <div className="alunos-content">
        <div className="form-card">
          <h2>
            {editandoId ? "Editar Horário" : "Adicionar Horário na Grade"}
          </h2>
          <form onSubmit={handleSalvar} className="form-row">
            <div className="form-group">
              <label>Dia da Semana</label>
              <select
                value={diaSemana}
                onChange={(e) => setDiaSemana(e.target.value)}
                required
              >
                <option value="">Selecione...</option>
                {diasDaSemana.map((dia) => (
                  <option key={dia} value={dia}>
                    {dia}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Horário</label>
              <input
                type="time"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Tipo de Treino</label>
              <select
                value={tipoAula}
                onChange={(e) => setTipoAula(e.target.value)}
                required
              >
                <option value="">Selecione...</option>
                <option value="GB 1 e 2">GB 1 e 2</option>
                <option value="GB F">GB F (Feminino)</option>
                <option value="NO-GI">NO-GI (Sem Kimono)</option>
                <option value="GB 1">GB 1</option>
                <option value="GB 2">GB 2</option>
              </select>
            </div>

            <div className="form-group" style={{ justifyContent: "flex-end" }}>
              <button
                type="submit"
                className="btn-submit"
                style={{ marginTop: 0, padding: "0.75rem" }}
              >
                {editandoId ? "Salvar" : "Adicionar"}
              </button>
            </div>
          </form>
          {editandoId && (
            <button
              type="button"
              onClick={limparFormulario}
              style={{
                background: "none",
                border: "none",
                color: "#666",
                textDecoration: "underline",
                cursor: "pointer",
                marginTop: "10px",
              }}
            >
              Cancelar Edição
            </button>
          )}
        </div>

        <div className="agenda-grid">
          {diasDaSemana.map((dia) => renderColunaDia(dia))}
        </div>
      </div>
    </div>
  );
}
