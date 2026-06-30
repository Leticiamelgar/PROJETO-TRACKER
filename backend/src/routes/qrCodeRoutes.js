const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Rota para iniciar uma sessão e salvar o token gerado
router.post("/gerar", async (req, res) => {
    // Recebe o token e a turma enviada pelo React
    const { token_validacao, turma_id } = req.body;

    try {
        // Insere na tabela qrcode_sessoes.
        // O campo 'expirado' começa como false, pois a aula acabou de começar!
        const result = await db.query(
            `INSERT INTO qrcode_sessoes (turma_id, token_validacao, expirado, data_criacao) 
             VALUES ($1, $2, $3, NOW()) RETURNING id`,
            [turma_id, token_validacao, false]
        );

        res.status(201).json({ 
            mensagem: "Sessão de treino iniciada no tatame!",
            sessaoId: result.rows[0].id
        });

    } catch (error) {
        console.error("Erro ao salvar token do QR Code:", error);
        res.status(500).json({ error: "Erro interno ao gerar sessão." });
    }
});

module.exports = router;