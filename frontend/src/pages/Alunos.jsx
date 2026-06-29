import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Dashboard.css';
import './Alunos.css';
import logoGB from '../assets/logo.png';

export default function Alunos() {
    const navigate = useNavigate();

    // Estados do formulário baseados no mockup
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');
    const [ultimaGraduacao, setUltimaGraduacao] = useState('');
    const [faixa, setFaixa] = useState('');
    const [grau, setGrau] = useState('');
    const [genero, setGenero] = useState('');

    const handleLogout = () => {
        localStorage.removeItem('@JJTrack:usuario');
        navigate('/');
    };

    const handleCadastrar = async (e) => {
        e.preventDefault();

        try {
            // Envia os dados para o Express (que fará os 2 inserts no Supabase)
            await api.post('/alunos/cadastrar', {
                nome,
                email,
                dataNascimento,
                ultimaGraduacao,
                faixa,
                grau,
                genero
            });

            alert("Aluno cadastrado com sucesso no tatame! A senha padrão é 123456.");

            // Limpa os campos após salvar
            setNome('');
            setEmail('');
            setDataNascimento('');
            setUltimaGraduacao('');
            setFaixa('');
            setGrau('');
            setGenero('');

        } catch (err) {
            alert(err.response?.data?.error || 'Erro ao cadastrar aluno.');
        }
    };

  return (
    <div className="dashboard-container">
      
      {/* HEADER E MENU (Igual ao da Dashboard) */}
      <header className="top-header">
        <button className="btn-sair" onClick={handleLogout}>Sair</button>
        <div className="logo-container">
          <img src={logoGB} alt="Logo Gracie Barra" className="logo-img" />
          <h2>Gracie Barra - Centro</h2>
        </div>
        <nav className="nav-menu">
          <button className="nav-item" onClick={() => navigate('/professor')}>Início</button>
          <button className="nav-item">Agenda</button>
          <button className="nav-item">Graduações</button>
          <button className="nav-item active">Alunos</button>
        </nav>
      </header>

      <div className="alunos-content">
        
        {/* FORMULÁRIO DE CADASTRO */}
        <div className="form-card">
          <h2>Cadastro de Aluno</h2>
          
          <form onSubmit={handleCadastrar}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Nome Completo</label>
              <input type="text" placeholder="Digite o nome do aluno" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>E-mail</label>
              <input type="email" placeholder="Digite o e-mail do aluno" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Data de Nascimento</label>
                <input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Última Graduação</label>
                <input type="date" value={ultimaGraduacao} onChange={(e) => setUltimaGraduacao(e.target.value)} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Faixa</label>
                <select value={faixa} onChange={(e) => setFaixa(e.target.value)} required>
                  <option value="">Selecione...</option>
                  <option value="Branca">Branca</option>
                  <option value="Azul">Azul</option>
                  <option value="Roxa">Roxa</option>
                  <option value="Marrom">Marrom</option>
                  <option value="Preta">Preta</option>
                </select>
              </div>
              <div className="form-group">
                <label>Grau</label>
                <select value={grau} onChange={(e) => setGrau(e.target.value)} required>
                  <option value="">Selecione...</option>
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Gênero:</label>
              <div className="radio-group">
                <label className="radio-item">
                  <input type="radio" name="genero" value="Masculino" onChange={(e) => setGenero(e.target.value)} required /> Masculino
                </label>
                <label className="radio-item">
                  <input type="radio" name="genero" value="Feminino" onChange={(e) => setGenero(e.target.value)} required /> Feminino
                </label>
              </div>
            </div>

            <button type="submit" className="btn-submit">Salvar Cadastro</button>
          </form>
        </div>

        {/* LISTAGEM DE ALUNOS (TRÊS COLUNAS) */}
        <div className="categorias-container">
          
          <div className="categoria-coluna">
            <h3>Homem</h3>
            {/* Exemplo de Card de Aluno fixo para visualização */}
            <div className="aluno-card">
              <div className="nome">Gustavo Jorge Estevam Peregrino</div>
              <p><strong>Nascimento:</strong> 10/03/2001</p>
              <p><strong>Últ. Graduação:</strong> 28/04/2026</p>
              <p><strong>Faixa:</strong> Branca</p>
              <p><strong>Grau:</strong> 4</p>
              <div className="aluno-acoes">
                <button className="btn-acao">Editar</button>
                <button className="btn-acao">Excluir</button>
              </div>
            </div>
          </div>

          <div className="categoria-coluna">
            <h3>Mulher</h3>
            {/* O map de alunas entrará aqui no futuro */}
          </div>

          <div className="categoria-coluna">
            <h3>Juvenil</h3>
            {/* O map de alunos juvenis entrará aqui no futuro */}
          </div>

        </div>

      </div>
    </div>
  );
}