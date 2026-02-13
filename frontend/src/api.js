import axios from 'axios';

// Cria uma conexão padrão com o seu Backend
const api = axios.create({
    // Se estiver rodando no mesmo PC, use localhost.
    // Se for subir pro GitHub pro seu colega, troque pelo seu IP de rede (ex: 192.168.X.X)
    baseURL: 'http://192.168.3.98:8000', 
});

export default api;