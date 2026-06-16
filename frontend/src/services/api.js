import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Aponta diretamente para o seu servidor Express
});

export default api;