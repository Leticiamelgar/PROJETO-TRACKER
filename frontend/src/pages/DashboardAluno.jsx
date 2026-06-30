import { useNavigate } from "react-router-dom";

export default function DashboardAluno() {
  const navigate = useNavigate();
  const dados = JSON.parse(localStorage.getItem("@JJTrack:usuario"));

  const handleLogout = () => {
    localStorage.removeItem("@JJTrack:usuario");
    navigate("/");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Área do Aluno 🥋</h1>
      <p>
        Olá, {dados?.nome}! Aqui pode consultar o seu histórico de presenças e
        graduação.
      </p>
      <button
        onClick={handleLogout}
        style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}
      >
        Sair
      </button>
    </div>
  );
}
