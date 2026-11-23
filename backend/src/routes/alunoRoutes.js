const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { calcularProximaGraduacao } = require("../services/graduacaoService");
const { validarCadastroAluno } = require("../services/validacaoService");

// LISTAR ALUNOS COM CONTADOR DE PRESENÇAS
router.get("/listar", async (req, res) => {
  try {
    const query = `
      SELECT u.id, u.nome, u.email,
             a.data_nascimento, a.data_ultima_graduacao, a.faixa, a.grau, a.genero,
             (SELECT COUNT(*) FROM presenca_frequencias WHERE aluno_id = u.id) as total_presencas
      FROM usuarios u
      INNER JOIN alunos a ON u.id = a.usuario_id
      WHERE u.perfil = $1
      ORDER BY u.nome ASC
    `;
    const result = await db.query(query, ["Aluno"]);
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao listar alunos:", error);
    res.status(500).json({ error: "Erro ao buscar alunos" });
  }
});

// BUSCAR ESTATÍSTICAS (antes de /:id para evitar conflito de rotas)
router.get("/estatisticas/hoje", async (req, res) => {
  try {
    const query = `
      SELECT COUNT(DISTINCT aluno_id) as presencas_hoje
      FROM presenca_frequencias
      WHERE DATE(data_hora) = CURRENT_DATE
    `;
    const result = await db.query(query);
    res.json({ presencasHoje: parseInt(result.rows[0].presencas_hoje || 0, 10) });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    res.status(500).json({ error: "Erro ao buscar estatísticas." });
  }
});

// BUSCAR HISTÓRICO DE PRESENÇAS
router.get("/presencas/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT data_hora
      FROM presenca_frequencias
      WHERE aluno_id = $1
      ORDER BY data_hora DESC
      LIMIT 10
    `;
    const result = await db.query(query, [id]);
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar histórico de presenças:", error);
    res.status(500).json({ error: "Erro ao buscar histórico." });
  }
});

// CADASTRAR ALUNO
router.post("/cadastrar", async (req, res) => {
  const { nome, email, dataNascimento, ultimaGraduacao, faixa, grau, genero } =
    req.body;
  const senhaPadrao = "123456";

  const validacao = validarCadastroAluno({ nome, email, faixa, grau });
  if (!validacao.valido) {
    return res.status(400).json({ error: validacao.erro });
  }

  try {
    const checkEmail = await db.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );
    if (checkEmail.rows.length > 0) {
      return res.status(400).json({ error: "Este e-mail já está cadastrado." });
    }

    const userResult = await db.query(
      "INSERT INTO usuarios (nome, email, senha, perfil) VALUES ($1, $2, $3, $4) RETURNING id",
      [nome, email, senhaPadrao, "Aluno"]
    );

    const novoUsuarioId = userResult.rows[0].id;

    await db.query(
      `INSERT INTO alunos (usuario_id, data_nascimento, data_ultima_graduacao, faixa, grau, genero)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [novoUsuarioId, dataNascimento, ultimaGraduacao, faixa, grau, genero]
    );

    res.status(201).json({ mensagem: "Aluno matriculado com sucesso!" });
  } catch (error) {
    console.error("Erro ao cadastrar aluno:", error);
    res.status(500).json({ error: "Erro interno ao cadastrar." });
  }
});

// GRADUAR ALUNO (Promove faixa e reseta grau para 0)
router.put("/graduar/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const aluno = await db.query(
      "SELECT faixa, grau FROM alunos WHERE usuario_id = $1",
      [id]
    );

    if (aluno.rows.length === 0) {
      return res.status(404).json({ error: "Aluno não encontrado." });
    }

    const { faixa } = aluno.rows[0];
    const resultado = calcularProximaGraduacao(faixa);

    if (!resultado.sucesso) {
      return res.status(400).json({ error: resultado.erro });
    }

    await db.query(
      `UPDATE alunos
       SET data_ultima_graduacao = CURRENT_DATE,
           faixa = $1,
           grau = $2
       WHERE usuario_id = $3`,
      [resultado.novaFaixa, resultado.novoGrau, id]
    );

    res.json({
      mensagem: "Faixa atualizada e graus resetados com sucesso!",
      novaFaixa: resultado.novaFaixa,
    });
  } catch (error) {
    console.error("Erro ao graduar aluno:", error);
    res.status(500).json({ error: "Erro ao processar graduação." });
  }
});

// REGISTRAR PRESENÇA PELO PROFESSOR
router.post("/registrar-presenca/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(
      `INSERT INTO presenca_frequencias (aluno_id, data_hora, status)
       VALUES ($1, NOW(), 'Presente')`,
      [id]
    );
    res.status(201).json({ mensagem: "Presença registrada com sucesso!" });
  } catch (error) {
    console.error("Erro ao registrar presença:", error);
    res.status(500).json({ error: "Erro ao registrar presença no banco." });
  }
});

// BUSCAR UM ÚNICO ALUNO POR ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT u.id, u.nome, u.email,
             a.data_nascimento, a.data_ultima_graduacao, a.faixa, a.grau, a.genero,
             (SELECT COUNT(*) FROM presenca_frequencias WHERE aluno_id = u.id) as total_presencas
      FROM usuarios u
      INNER JOIN alunos a ON u.id = a.usuario_id
      WHERE u.id = $1
    `;
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Aluno não encontrado." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao buscar aluno específico:", error);
    res.status(500).json({ error: "Erro ao buscar dados do aluno." });
  }
});

// EDITAR ALUNO
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, email, dataNascimento, ultimaGraduacao, faixa, grau, genero } =
    req.body;

  try {
    await db.query("UPDATE usuarios SET nome = $1, email = $2 WHERE id = $3", [
      nome,
      email,
      id,
    ]);
    await db.query(
      `UPDATE alunos SET data_nascimento = $1, data_ultima_graduacao = $2, faixa = $3, grau = $4, genero = $5
       WHERE usuario_id = $6`,
      [dataNascimento, ultimaGraduacao, faixa, grau, genero, id]
    );
    res.json({ mensagem: "Dados do aluno atualizados com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar aluno:", error);
    res.status(500).json({ error: "Erro ao atualizar dados." });
  }
});

// EXCLUIR ALUNO
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM alunos WHERE usuario_id = $1", [id]);
    await db.query("DELETE FROM usuarios WHERE id = $1", [id]);
    res.json({ mensagem: "Aluno removido com sucesso!" });
  } catch (error) {
    console.error("Erro ao excluir aluno:", error);
    res.status(500).json({ error: "Erro ao excluir aluno." });
  }
});

module.exports = router;