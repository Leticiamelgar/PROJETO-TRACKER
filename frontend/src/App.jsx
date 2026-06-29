import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardProfessor from './pages/DashboardProfessor';
import DashboardAluno from './pages/DashboardAluno';
import CadastroAluno from './pages/CadastroAluno';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota inicial: carrega o Login */}
        <Route path="/" element={<Login />} />

        {/* Rotas dos painéis */}
        <Route path="/professor" element={<DashboardProfessor />} />
        <Route path="/aluno" element={<DashboardAluno />} />
        <Route path="/cadastro-aluno" element={<CadastroAluno />} />

        {/* Redireciona qualquer rota inexistente de volta para o login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;