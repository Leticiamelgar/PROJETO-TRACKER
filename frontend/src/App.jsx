import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardProfessor from './pages/DashboardProfessor';
import DashboardAluno from './pages/DashboardAluno';
import Alunos from './pages/Alunos';
import Graduacoes from './pages/Graduacoes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota inicial: carrega o Login */}
        <Route path="/" element={<Login />} />

        {/* Rotas principal do painel do professor */}
        <Route path="/professor" element={<DashboardProfessor />} />

        {/* Rota principal do painel do aluno */}
        <Route path="/aluno" element={<DashboardAluno />} />

        {/* <-- 2. ROTA PARA A TELA DE ALUNOS --> */}
        <Route path="/professor/alunos" element={<Alunos />} />

        {/* <-- 3. ROTA PARA A TELA DE GRADUAÇÕES --> */}
        <Route path="/professor/graduacoes" element={<Graduacoes />} />

        {/* Redireciona qualquer rota inexistente (URL digitada errada) de volta para o login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;