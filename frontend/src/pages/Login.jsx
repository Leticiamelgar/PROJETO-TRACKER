import { useState } from 'react';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState('Aluno'); // Padrão inicial
  const [erro, setErro] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');

    try {
      // Dispara a requisição POST para o Express
      const resposta = await api.post('/auth/login', { email, senha, perfil });
      
      // Salva o token ou dados do usuário localmente no navegador
      localStorage.setItem('@JJTrack:usuario', JSON.stringify(resposta.data));
      
      alert(`Bem-vindo, ${resposta.data.nome}! Login realizado com sucesso.`);
      // Aqui depois faremos o redirecionamento para a Dashboard
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao tentar realizar o login.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f5f5f5' }}>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', padding: '2rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '300px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#1a1a1a' }}>Jiu-Jitsu Track</h2>
        
        {erro && <p style={{ color: 'red', fontSize: '0.85rem', marginBottom: '1rem' }}>{erro}</p>}

        <label style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>E-mail</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '0.5rem', marginBottom: '1rem', borderRadius: '4px', border: '1px solid #ccc' }} />

        <label style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Senha</label>
        <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required style={{ padding: '0.5rem', marginBottom: '1rem', borderRadius: '4px', border: '1px solid #ccc' }} />

        <label style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Perfil</label>
        <select value={perfil} onChange={(e) => setPerfil(e.target.value)} style={{ padding: '0.5rem', marginBottom: '1.5rem', borderRadius: '4px', border: '1px solid #ccc' }}>
          <option value="Aluno">Aluno</option>
          <option value="Professor">Professor / Administrador</option>
        </select>

        <button type="submit" style={{ padding: '0.75rem', backgroundColor: '#d32f2f', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
          ENTRAR
        </button>
      </form>
    </div>
  );
}