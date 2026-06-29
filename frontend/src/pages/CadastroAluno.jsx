import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function CadastroAluno() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleCadastrar = async (e) => {
    e.preventDefault();
    setErro('');

    try {
      await api.post('/alunos/cadastrar', { nome, email, senha });
      alert('Aluno cadastrado com sucesso no tatame! 🥋');
      navigate('/professor'); // Volta para a dashboard atualizada
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao cadastrar aluno.');
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '500px', margin: '0 auto' }}>
      <h1>Novo Aluno</h1>
      <p>Preencha os dados para matricular um novo aluno.</p>
      
      {erro && <p style={{ color: 'red' }}>{erro}</p>}

      <form onSubmit={handleCadastrar} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
        <div>
          <label style={{ fontWeight: 'bold' }}>Nome Completo:</label>
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
        </div>

        <div>
          <label style={{ fontWeight: 'bold' }}>E-mail:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
        </div>

        <div>
          <label style={{ fontWeight: 'bold' }}>Senha Inicial:</label>
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button type="submit" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#2e7d32', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Salvar Aluno
          </button>
          <button type="button" onClick={() => navigate('/professor')} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#9e9e9e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}