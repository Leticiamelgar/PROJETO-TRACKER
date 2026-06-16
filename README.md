
# 🥋 Jiu-Jitsu Track

Apoio informatizado ao controle de presença via QR Code, agendamento de aulas e gestão de graduações para academias de Jiu-Jitsu.

---

## 🚀 Como Executar o Projeto Localmente

Como o sistema é dividido em duas camadas independentes (Cliente/Servidor), você precisará de dois terminais abertos para rodar o projeto completo.

### 1. 💻 Pré-requisitos
* **Node.js** (Versão 18 ou superior)
* Gerenciador de pacotes **NPM** 

---

### 2. ⚙️ Como Rodar o Back-End (Servidor Node.js + Express)

1. Abra um terminal e navegue até a pasta do back-end:
   ```bash
   cd backend

```

2. Instale todas as dependências do servidor:
```bash
npm install

```


3. Certifique-se de que o arquivo `.env` está configurado na raiz da pasta `backend` com a string de conexão do Supabase/PostgreSQL.
4. Inicie o servidor Express:
```bash
node src/server.js

```


*(O servidor iniciará por padrão na porta `3000`)*

---

### 3. 📱 Como Rodar o Front-End (Interface React + Vite)

1. Abra um **segundo terminal** (sem fechar o do back-end) e navegue até a pasta do front-end:
```bash
cd frontend

```


2. Instale as dependências da interface:
```bash
npm install

```


3. Inicie o ambiente de desenvolvimento do Vite:
```bash
npm run dev

```


4. O terminal gerará um link local (geralmente `http://localhost:5173`). Segure `Ctrl` e clique no link para abrir o sistema no seu navegador.

```
-