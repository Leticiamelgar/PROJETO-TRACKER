const express = require("express");
const router = express.Router();
const db = require("../config/db"); 

// 🟢 LISTAR TODAS AS TURMAS
router.get("/listar", async (req, res) => {
  try {
    // Busca as turmas e ordena pelo ID para manter a consistência no Front-End
    const result = await db.query("SELECT * FROM turmas ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao listar turmas:", error);
    res.status(500).json({ error: "Erro ao buscar as turmas no banco de dados." });
  }
});

// 🔵 CADASTRAR NOVA TURMA
router.post("/cadastrar", async (req, res) => {
  const { nome_turma } = req.body;
  
  if (!nome_turma) {
    return res.status(400).json({ error: "O nome da turma é obrigatório." });
  }

  try {
    // O RETURNING * faz o banco devolver a linha recém-criada (com o ID gerado)
    const result = await db.query(
      "INSERT INTO turmas (nome_turma) VALUES ($1) RETURNING *",
      [nome_turma]
    );
    
    res.status(201).json({ 
        mensagem: "Turma criada com sucesso!",
        turma: result.rows[0] // Devolvemos a turma com o ID para o React atualizar a tela na hora
    });
  } catch (error) {
    console.error("Erro ao cadastrar turma:", error);
    res.status(500).json({ error: "Erro interno ao cadastrar a turma." });
  }
});

// EXCLUIR TURMA (Adicionar no final do arquivo turmasRoutes.js)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Tenta deletar a turma pelo ID
    const result = await db.query("DELETE FROM turmas WHERE id = $1 RETURNING *", [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Turma não encontrada." });
    }

    res.json({ mensagem: "Turma excluída com sucesso!" });
  } catch (error) {
    console.error("Erro ao excluir turma:", error);
    
    // Erro 23503 é o código do PostgreSQL para violação de Chave Estrangeira (Foreign Key)
    if (error.code === '23503') {
      return res.status(400).json({ 
        error: "Não é possível excluir esta turma, pois ela já está vinculada a um horário na agenda. Remova a aula da grade primeiro." 
      });
    }
    
    res.status(500).json({ error: "Erro interno ao excluir a turma." });
  }
});

module.exports = router;