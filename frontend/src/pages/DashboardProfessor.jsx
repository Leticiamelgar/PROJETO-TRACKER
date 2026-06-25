export default function DashboardProfessor() {
  const dados = JSON.parse(localStorage.getItem('@JJTrack:usuario'));

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Painel do Professor 🥋</h1>
      <p>Olá, Mestre {dados?.nome}! Aqui poderá gerir as suas aulas e alunos.</p>
    </div>
  );
}