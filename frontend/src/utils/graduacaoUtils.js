export function getTempoNecessario(faixa, grau = 0) {
  if (faixa === "Branca") return 12;
  if (faixa === "Azul") return 24;
  if (faixa === "Roxa") return 18;
  if (faixa === "Marrom") return 18;
  if (faixa === "Preta") return parseInt(grau, 10) >= 4 ? 60 : 36;
  return 12;
}

export function calcularProgresso(aluno, dataReferencia = new Date()) {
  const ultima = new Date(aluno.data_ultima_graduacao);
  const diffMeses =
    (dataReferencia.getFullYear() - ultima.getFullYear()) * 12 +
    (dataReferencia.getMonth() - ultima.getMonth());
  const tempoNecessario = getTempoNecessario(aluno.faixa, aluno.grau);

  const progresso = Math.min(
    100,
    Math.max(0, Math.floor((diffMeses / tempoNecessario) * 100)),
  );

  return { progresso, apto: progresso >= 100 };
}

export function calcularDataPrevista(aluno) {
  const ultima = new Date(aluno.data_ultima_graduacao);
  const tempoNecessario = getTempoNecessario(aluno.faixa, aluno.grau);

  const dataPrevista = new Date(ultima);
  dataPrevista.setMonth(ultima.getMonth() + tempoNecessario);
  return dataPrevista;
}

export function calcularDiasRestantes(dataPrevista, dataReferencia = new Date()) {
  const diffTime = dataPrevista - dataReferencia;
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}