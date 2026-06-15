const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/status', (req, res) => {
    res.json({ status: "Servidor Express Online! 🚀" });
});

app.listen(3000, () => console.log("Back-end rodando na porta 3000"));