import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardProfessor from './pages/DashboardProfessor';
import DashboardAluno from './pages/DashboardAluno';
import Alunos from './pages/Alunos';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota inicial: carrega o Login */}
        <Route path="/" element={<Login />} />

        {/* Rotas principais dos painéis */}
        <Route path="/professor" element={<DashboardProfessor />} />
        <Route path="/aluno" element={<DashboardAluno />} />

        {/* <-- 2. NOVA ROTA PARA A TELA DE ALUNOS --> */}
        <Route path="/professor/alunos" element={<Alunos />} />

        {/* Redireciona qualquer rota inexistente (URL digitada errada) de volta para o login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;