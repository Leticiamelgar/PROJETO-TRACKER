import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import DashboardProfessor from "./pages/DashboardProfessor";
import DashboardAluno from "./pages/DashboardAluno";
import Alunos from "./pages/Alunos";
import Agenda from "./pages/Agenda";
import Graduacoes from "./pages/Graduacoes";

// Importações das novas páginas do Aluno
import AgendaAluno from "./pages/AgendaAluno";
import GraduacaoAluno from "./pages/GraduacaoAluno";

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

        {/* <-- 1. NOVA ROTA PARA A TELA DE ALUNOS --> */}
        <Route path="/professor/alunos" element={<Alunos />} />

        {/* <-- 2. NOVA ROTA PARA A TELA DE AGENDA --> */}
        <Route path="/professor/agenda" element={<Agenda />} />

        {/* <-- 3. NOVA ROTA PARA A TELA DE GRADUAÇÕES --> */}
        <Route path="/professor/graduacoes" element={<Graduacoes />} />

        {/* <-- 4. NOVAS ROTAS DO ALUNO --> */}
        <Route path="/aluno/agenda" element={<AgendaAluno />} />
        <Route path="/aluno/graduacao" element={<GraduacaoAluno />} />

        {/* Redireciona qualquer rota inexistente (URL digitada errada) de volta para o login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
