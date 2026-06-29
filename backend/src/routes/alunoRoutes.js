const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ROTA PARA LISTAR
router.get("/listar", async (req, res) => {
  try {
    const query = `
            SELECT u.id, u.nome, u.email, 
                   a.data_nascimento, a.data_ultima_graduacao, a.faixa, a.grau, a.genero
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

// ROTA PARA CADASTRAR NOVO ALUNO
router.post("/cadastrar", async (req, res) => {
  const { nome, email, dataNascimento, ultimaGraduacao, faixa, grau, genero } =
    req.body;
  const senhaPadrao = "123456";

  try {
    const checkEmail = await db.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email],
    );
    if (checkEmail.rows.length > 0) {
      return res.status(400).json({ error: "Este e-mail já está cadastrado." });
    }

    const userResult = await db.query(
      "INSERT INTO usuarios (nome, email, senha, perfil) VALUES ($1, $2, $3, $4) RETURNING id",
      [nome, email, senhaPadrao, "Aluno"],
    );

    const novoUsuarioId = userResult.rows[0].id;

    await db.query(
      `INSERT INTO alunos (usuario_id, data_nascimento, data_ultima_graduacao, faixa, grau, genero) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
      [novoUsuarioId, dataNascimento, ultimaGraduacao, faixa, grau, genero],
    );

    res.status(201).json({ mensagem: "Aluno matriculado com sucesso!" });
  } catch (error) {
    console.error("Erro ao cadastrar aluno:", error);
    res.status(500).json({ error: "Erro interno ao cadastrar." });
  }
});

// ROTA PARA EXCLUIR
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // 1º Deletamos da tabela dependente (alunos)
    await db.query("DELETE FROM alunos WHERE usuario_id = $1", [id]);

    // 2º Deletamos da tabela principal (usuarios)
    await db.query("DELETE FROM usuarios WHERE id = $1", [id]);

    res.json({ mensagem: "Aluno removido com sucesso!" });
  } catch (error) {
    console.error("Erro ao excluir aluno:", error);
    res.status(500).json({ error: "Erro ao excluir aluno no banco de dados." });
  }
});

// ROTA PARA EDITAR (ATUALIZAR)
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, email, dataNascimento, ultimaGraduacao, faixa, grau, genero } =
    req.body;

  try {
    // Atualiza os dados básicos do usuário
    await db.query("UPDATE usuarios SET nome = $1, email = $2 WHERE id = $3", [
      nome,
      email,
      id,
    ]);

    // Atualiza os dados específicos de jiu-jitsu
    await db.query(
      `UPDATE alunos 
             SET data_nascimento = $1, data_ultima_graduacao = $2, faixa = $3, grau = $4, genero = $5 
             WHERE usuario_id = $6`,
      [dataNascimento, ultimaGraduacao, faixa, grau, genero, id],
    );

    res.json({ mensagem: "Dados do aluno atualizados com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar aluno:", error);
    res.status(500).json({ error: "Erro ao atualizar dados." });
  }
});

module.exports = router;
