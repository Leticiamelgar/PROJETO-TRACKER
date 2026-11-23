const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { validarCadastroAgenda } = require("../services/validacaoService");

// LISTAR
router.get("/listar", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM agenda ORDER BY horario ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao listar agenda:", error);
    res.status(500).json({ error: "Erro ao buscar agenda" });
  }
});

// CADASTRAR
router.post("/cadastrar", async (req, res) => {
  const { dia_semana, horario, tipo_aula, turma } = req.body;

  const validacao = validarCadastroAgenda({ dia_semana, horario, tipo_aula });
  if (!validacao.valido) {
    return res.status(400).json({ error: validacao.erro });
  }

  try {
    await db.query(
      "INSERT INTO agenda (dia_semana, horario, tipo_aula, turma) VALUES ($1, $2, $3, $4)",
      [dia_semana, horario, tipo_aula, turma]
    );
    res.status(201).json({ mensagem: "Aula adicionada com sucesso!" });
  } catch (error) {
    console.error("Erro ao cadastrar aula:", error);
    res.status(500).json({ error: "Erro interno ao cadastrar." });
  }
});

// EDITAR (COALESCE mantém a turma anterior caso não seja enviada)
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { dia_semana, horario, tipo_aula, turma } = req.body;
  try {
    const result = await db.query(
      "UPDATE agenda SET dia_semana = $1, horario = $2, tipo_aula = $3, turma = COALESCE($4, turma) WHERE id = $5",
      [dia_semana, horario, tipo_aula, turma ?? null, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Aula não encontrada." });
    }

    res.json({ mensagem: "Aula atualizada com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar aula:", error);
    res.status(500).json({ error: "Erro ao atualizar." });
  }
});

// EXCLUIR
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("DELETE FROM agenda WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Aula não encontrada." });
    }

    res.json({ mensagem: "Aula removida com sucesso!" });
  } catch (error) {
    console.error("Erro ao excluir aula:", error);
    res.status(500).json({ error: "Erro ao excluir." });
  }
});

module.exports = router;