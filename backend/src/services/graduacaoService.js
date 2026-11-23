const FAIXAS_VALIDAS = ["Branca", "Azul", "Roxa", "Marrom", "Preta"];
const GRAU_MINIMO = 0;
const GRAU_MAXIMO = 4;

function validarFaixa(faixa) {
  return typeof faixa === "string" && FAIXAS_VALIDAS.includes(faixa);
}

function validarGrau(grau) {
  if (grau === null || grau === undefined || grau === "") {
    return false;
  }
  const numero = Number(grau);
  return Number.isInteger(numero) && numero >= GRAU_MINIMO && numero <= GRAU_MAXIMO;
}

function calcularProximaGraduacao(faixaAtual) {
  if (!validarFaixa(faixaAtual)) {
    return {
      sucesso: false,
      erro: "Faixa atual inválida.",
    };
  }

  const indexAtual = FAIXAS_VALIDAS.indexOf(faixaAtual);

  if (indexAtual === FAIXAS_VALIDAS.length - 1) {
    return {
      sucesso: false,
      erro: "Aluno já possui a faixa máxima (Preta).",
    };
  }

  return {
    sucesso: true,
    novaFaixa: FAIXAS_VALIDAS[indexAtual + 1],
    novoGrau: 0,
  };
}

module.exports = {
  FAIXAS_VALIDAS,
  GRAU_MINIMO,
  GRAU_MAXIMO,
  validarFaixa,
  validarGrau,
  calcularProximaGraduacao,
};