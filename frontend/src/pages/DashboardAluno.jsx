export default function DashboardAluno() {
  const dados = JSON.parse(localStorage.getItem('@JJTrack:usuario'));

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Área do Aluno 🥋</h1>
      <p>Olá, {dados?.nome}! Aqui pode consultar o seu histórico de presenças e graduação.</p>
    </div>
  );
}