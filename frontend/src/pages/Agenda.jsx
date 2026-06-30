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

  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState("");
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [modoAdicionarTurma, setModoAdicionarTurma] = useState(false);
  const [nomeNovaTurma, setNomeNovaTurma] = useState("");

  const diasDaSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  // --- CICLO DE VIDA ---
  useEffect(() => {
    if (!localStorage.getItem("@JJTrack:usuario")) navigate("/");
    fetchAgenda();
    carregarTurmas();
  }, [navigate]);

  // --- LÓGICA DE DADOS ---
  const getCorDaTurma = (nomeDaTurma) => {
    if (!nomeDaTurma) return "#999";
    const cores = ["#2196F3", "#E91E63", "#9C27B0", "#FF9800", "#4CAF50", "#795548", "#009688"];
    let hash = 0;
    for (let i = 0; i < nomeDaTurma.length; i++) hash = nomeDaTurma.charCodeAt(i) + ((hash << 5) - hash);
    return cores[Math.abs(hash) % cores.length];
  };

  const fetchAgenda = async () => {
    try {
      const { data } = await api.get("/agenda/listar");
      setListaAgenda(data);
    } catch (err) { console.error("Erro ao buscar agenda:", err); }
  };

  const carregarTurmas = async () => {
    try {
      const { data } = await api.get("/turmas/listar");
      setTurmas(data.map((t) => ({ id: t.id, nome: t.nome_turma })));
    } catch (err) { console.error("Erro ao buscar turmas:", err); }
  };

  // --- HANDLERS ---
  const handleCriarTurma = async (e) => {
    e.preventDefault();
    if (!nomeNovaTurma.trim()) return;
    try {
      const { data } = await api.post("/turmas/cadastrar", { nome_turma: nomeNovaTurma });
      setTurmas([...turmas, { id: data.turma.id, nome: data.turma.nome_turma }]);
      setTurmaSelecionada(data.turma.nome_turma);
      setNomeNovaTurma("");
      setModoAdicionarTurma(false);
      setDropdownAberto(false);
    } catch (err) { alert("Erro ao salvar turma."); }
  };

  const handleDeletarTurma = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Excluir esta turma?")) return;
    try {
      await api.delete(`/turmas/${id}`);
      setTurmas(turmas.filter((t) => t.id !== id));
      if (turmaSelecionada === turmas.find((t) => t.id === id)?.nome) setTurmaSelecionada("");
    } catch (err) { alert(err.response?.data?.error || "Erro ao excluir."); }
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    const dados = { dia_semana: diaSemana, horario, tipo_aula: tipoAula, turma: turmaSelecionada };
    try {
      if (editandoId) await api.put(`/agenda/${editandoId}`, dados);
      else await api.post("/agenda/cadastrar", dados);
      limparFormulario();
      fetchAgenda();
    } catch (err) { alert(err.response?.data?.error || "Erro ao salvar."); }
  };

  const limparFormulario = () => {
    setDiaSemana(""); setHorario(""); setTipoAula(""); setTurmaSelecionada(""); setEditandoId(null);
  };

  const handleExcluir = async (id) => {
    if (window.confirm("Remover este horário?")) {
      try { await api.delete(`/agenda/${id}`); fetchAgenda(); }
      catch (err) { alert("Erro ao excluir."); }
    }
  };

  // --- RENDERIZAÇÃO ---
  return (
    <div className="dashboard-container">
      <header className="top-header">
        <button className="btn-sair" onClick={() => { localStorage.removeItem("@JJTrack:usuario"); navigate("/"); }}>Sair</button>
        <div className="logo-container">
          <img src={logoGB} alt="Logo" className="logo-img" />
          <h2>Gracie Barra - Centro</h2>
        </div>
        <nav className="nav-menu">
          <button className="nav-item" onClick={() => navigate("/professor")}>Início</button>
          <button className="nav-item active">Agenda</button>
          <button className="nav-item" onClick={() => navigate("/professor/graduacoes")}>Graduações</button>
          <button className="nav-item" onClick={() => navigate("/professor/alunos")}>Alunos</button>
        </nav>
      </header>

      <div className="agenda-content">
        <div className="agenda-form-card">
          <h2>{editandoId ? "Editar Horário" : "Adicionar Horário"}</h2>
          <form onSubmit={handleSalvar} className="agenda-form-row">
            <div className="agenda-form-group">
              <label>Dia</label>
              <select value={diaSemana} onChange={(e) => setDiaSemana(e.target.value)} required>
                <option value="">Selecione...</option>
                {diasDaSemana.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="agenda-form-group">
              <label>Horário</label>
              <input type="time" value={horario} onChange={(e) => setHorario(e.target.value)} required />
            </div>
            <div className="agenda-form-group">
              <label>Tipo</label>
              <select value={tipoAula} onChange={(e) => setTipoAula(e.target.value)} required>
                <option value="">Selecione...</option>
                {["GB 1 e 2", "GB F", "NO-GI", "GB 1", "GB 2"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="agenda-form-group custom-dropdown-container">
              <label>Turma</label>
              <div className="custom-select-box" onClick={() => !modoAdicionarTurma && setDropdownAberto(!dropdownAberto)}>
                <span>{turmaSelecionada || "Selecione..."}</span>
                <span className="dropdown-arrow">▼</span>
              </div>
              {dropdownAberto && (
                <div className="custom-dropdown-list">
                  {turmas.map(t => (
                    <div key={t.id} className="dropdown-item" onClick={() => { setTurmaSelecionada(t.nome); setDropdownAberto(false); }}>
                      {t.nome}
                      <button type="button" className="btn-remover-turma" onClick={(e) => handleDeletarTurma(t.id, e)}>X</button>
                    </div>
                  ))}
                  <div className="dropdown-item add-new-action" onClick={(e) => e.stopPropagation()}>
                    {!modoAdicionarTurma ? (
                      <span className="btn-add-inline" onClick={() => setModoAdicionarTurma(true)}>+ Acrescentar</span>
                    ) : (
                      <div className="inline-add-form">
                        <input value={nomeNovaTurma} onChange={(e) => setNomeNovaTurma(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCriarTurma(e)} autoFocus />
                        <button type="button" className="btn-salvar-inline" onClick={handleCriarTurma}>✔</button>
                        <button type="button" className="btn-cancelar-inline" onClick={() => setModoAdicionarTurma(false)}>✖</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="agenda-form-group" style={{ flex: '0 0 auto' }}>
              <button type="submit" className="btn-submit btn-add">{editandoId ? "Salvar" : "Adicionar"}</button>
            </div>
          </form>
        </div>

        <div className="agenda-grid">
          {diasDaSemana.map((dia) => (
            <div className="dia-coluna" key={dia}>
              <h3>{dia}</h3>
              {listaAgenda.filter(a => a.dia_semana === dia).map(aula => (
                <div key={aula.id} className={`aula-card tipo-${aula.tipo_aula.replace(/\s/g, '').toLowerCase()}`}>
                  <div className="aula-horario">{aula.horario}</div>
                  <div className="aula-tipo">{aula.tipo_aula}</div>
                  {aula.turma && <div className="aula-turma-badge" style={{ backgroundColor: getCorDaTurma(aula.turma) }}>{aula.turma}</div>}
                  <div className="aula-acoes">
                    <button onClick={() => { setEditandoId(aula.id); setDiaSemana(aula.dia_semana); setHorario(aula.horario); setTipoAula(aula.tipo_aula); setTurmaSelecionada(aula.turma); }}>Editar</button>
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