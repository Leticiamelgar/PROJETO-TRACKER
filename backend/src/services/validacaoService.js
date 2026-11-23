const { validarFaixa, validarGrau } = require("./graduacaoService");

function validarEmail(email) {
  if (typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validarCadastroAluno({ nome, email, faixa, grau }) {
  if (!nome || typeof nome !== "string" || nome.trim().length < 2) {
    return { valido: false, erro: "Nome do aluno é obrigatório." };
  }

  if (!validarEmail(email)) {
    return { valido: false, erro: "E-mail inválido." };
  }

  if (faixa !== undefined && !validarFaixa(faixa)) {
    return { valido: false, erro: "Faixa inválida." };
  }

  if (grau !== undefined && !validarGrau(grau)) {
    return { valido: false, erro: "O grau deve ser um número inteiro entre 0 e 4." };
  }

  return { valido: true };
}

function validarLogin({ email, senha, perfil }) {
  if (!email || !senha || !perfil) {
    return { valido: false, erro: "E-mail, senha e perfil são obrigatórios." };
  }
  return { valido: true };
}

function validarCadastroAgenda({ dia_semana, horario, tipo_aula }) {
  if (!dia_semana || !horario || !tipo_aula) {
    return { valido: false, erro: "Dia da semana, horário e tipo de aula são obrigatórios." };
  }
  return { valido: true };
}

module.exports = {
  validarEmail,
  validarCadastroAluno,
  validarLogin,
  validarCadastroAgenda,
};