const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/listar', async (req, res) => {
    try {
        const result = await db.query('SELECT id, nome, email, perfil FROM usuarios WHERE perfil = $1 ORDER BY nome ASC',
            ['Aluno']);
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao listar alunos:", error);
        res.status(500).json({ error: 'Erro ao buscar alunos' });
    }
});

router.post('/cadastrar', async (req, res) => {
    // 1. Recebe tudo do Front-End (inclusive os campos novos do Figma)
    const { nome, email, dataNascimento, ultimaGraduacao, faixa, grau, genero } = req.body;
    const senhaPadrao = '123456'; 

    try {
        // Verifica se o e-mail já existe
        const checkEmail = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (checkEmail.rows.length > 0) {
            return res.status(400).json({ error: "Este e-mail já está cadastrado." });
        }

        // 2. INSERE NA TABELA USUARIOS (e pega o ID de volta)
        const userResult = await db.query(
            'INSERT INTO usuarios (nome, email, senha, perfil) VALUES ($1, $2, $3, $4) RETURNING id',
            [nome, email, senhaPadrao, 'Aluno']
        );
        
        const novoUsuarioId = userResult.rows[0].id;

        // 3. INSERE NA TABELA ALUNOS (usando o ID gerado acima)
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

module.exports = router;