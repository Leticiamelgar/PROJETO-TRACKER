const express = require("express");
const router = express.Router();
const db = require("../config/db");

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
  const { dia_semana, horario, tipo_aula } = req.body;
  try {
    await db.query(
      "INSERT INTO agenda (dia_semana, horario, tipo_aula) VALUES ($1, $2, $3)",
      [dia_semana, horario, tipo_aula],
    );
    res.status(201).json({ mensagem: "Aula adicionada com sucesso!" });
  } catch (error) {
    console.error("Erro ao cadastrar aula:", error);
    res.status(500).json({ error: "Erro interno ao cadastrar." });
  }
});

// EDITAR
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { dia_semana, horario, tipo_aula } = req.body;
  try {
    await db.query(
      "UPDATE agenda SET dia_semana = $1, horario = $2, tipo_aula = $3 WHERE id = $4",
      [dia_semana, horario, tipo_aula, id],
    );
    res.json({ mensagem: "Aula atualizada com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar aula:", error);
    res.status(500).json({ error: "Erro ao atualizar dados." });
  }
});

// EXCLUIR
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM agenda WHERE id = $1", [id]);
    res.json({ mensagem: "Aula removida com sucesso!" });
  } catch (error) {
    console.error("Erro ao excluir aula:", error);
    res.status(500).json({ error: "Erro ao excluir aula." });
  }
});

module.exports = router;
