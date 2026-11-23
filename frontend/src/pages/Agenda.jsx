import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import logoGB from "../assets/logo.png";
import "./Dashboard.css";
import "./Agenda.css";

export default function Agenda() {
  const navigate = useNavigate();

  // --- ESTADOS ---
  const [listaAgenda, setListaAgenda] = useState([]);
  const [diaSemana, setDiaSemana] = useState("");
  const [horario, setHorario] = useState("");
  const [tipoAula, setTipoAula] = useState("");
  const [editandoId, setEditandoId] = useState(null);

  const diasDaSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  // --- CICLO DE VIDA ---
  useEffect(() => {
    if (!localStorage.getItem("@JJTrack:usuario")) {
      navigate("/");
      return;
    }

    const carregarAgenda = async () => {
      try {
        const { data } = await api.get("/agenda/listar");
        setListaAgenda(data);
      } catch (err) {
        console.error("Erro ao buscar agenda:", err);
      }
    };

    carregarAgenda();
  }, [navigate]);

  // --- LÓGICA DE DADOS ---
  const fetchAgenda = async () => {
    try {
      const { data } = await api.get("/agenda/listar");
      setListaAgenda(data);
    } catch (err) {
      console.error("Erro ao buscar agenda:", err);
    }
  };

  // --- HANDLERS ---
  const handleSalvar = async (e) => {
    e.preventDefault();
    const dados = { dia_semana: diaSemana, horario, tipo_aula: tipoAula };
    try {
      if (editandoId) await api.put(`/agenda/${editandoId}`, dados);
      else await api.post("/agenda/cadastrar", dados);
      limparFormulario();
      fetchAgenda();
    } catch (err) {
      alert(err.response?.data?.error || "Erro ao salvar.");
    }
  };

  const limparFormulario = () => {
    setDiaSemana("");
    setHorario("");
    setTipoAula("");
    setEditandoId(null);
  };

  const handleExcluir = async (id) => {
    if (window.confirm("Remover este horário?")) {
      try {
        await api.delete(`/agenda/${id}`);
        fetchAgenda();
      } catch {
        alert("Erro ao excluir.");
      }
    }
  };

  // --- RENDERIZAÇÃO ---
  return (
    <div className="dashboard-container">
      <header className="top-header">
        <button
          className="btn-sair"
          onClick={() => {
            localStorage.removeItem("@JJTrack:usuario");
            navigate("/");
          }}
        >
          Sair
        </button>
        <div className="logo-container">
          <img src={logoGB} alt="Logo" className="logo-img" />
          <h2>Gracie Barra - Centro</h2>
        </div>
        <nav className="nav-menu">
          <button className="nav-item" onClick={() => navigate("/professor")}>
            Início
          </button>
          <button className="nav-item active">Agenda</button>
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

      <div className="agenda-content">
        <div className="agenda-form-card">
          <h2>{editandoId ? "Editar Horário" : "Adicionar Horário"}</h2>
          <form onSubmit={handleSalvar} className="agenda-form-row">
            <div className="agenda-form-group">
              <label>Dia</label>
              <select
                value={diaSemana}
                onChange={(e) => setDiaSemana(e.target.value)}
                required
              >
                <option value="">Selecione...</option>
                {diasDaSemana.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="agenda-form-group">
              <label>Horário</label>
              <input
                type="time"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                required
              />
            </div>
            <div className="agenda-form-group">
              <label>Tipo</label>
              <select
                value={tipoAula}
                onChange={(e) => setTipoAula(e.target.value)}
                required
              >
                <option value="">Selecione...</option>
                {["GB 1 e 2", "GB F", "NO-GI", "GB 1", "GB 2"].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="agenda-form-group" style={{ flex: "0 0 auto" }}>
              <button type="submit" className="btn-submit btn-add">
                {editandoId ? "Salvar" : "Adicionar"}
              </button>
            </div>
          </form>
        </div>

        <div className="agenda-grid">
          {diasDaSemana.map((dia) => (
            <div className="dia-coluna" key={dia}>
              <h3>{dia}</h3>
              {listaAgenda
                .filter((a) => a.dia_semana === dia)
                .map((aula) => (
                  <div
                    key={aula.id}
                    className={`aula-card tipo-${aula.tipo_aula.replace(/\s/g, "").toLowerCase()}`}
                  >
                    <div className="aula-horario">{aula.horario}</div>
                    <div className="aula-tipo">{aula.tipo_aula}</div>
                    <div className="aula-acoes">
                      <button
                        onClick={() => {
                          setEditandoId(aula.id);
                          setDiaSemana(aula.dia_semana);
                          setHorario(aula.horario);
                          setTipoAula(aula.tipo_aula);
                        }}
                      >
                        Editar
                      </button>
                      <button onClick={() => handleExcluir(aula.id)}>X</button>
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}