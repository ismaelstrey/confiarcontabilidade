const express = require('express');
const app = express();
const PORT = 3001;

console.log('Iniciando servidor de teste...');

app.get('/health', (req, res) => {
  console.log('Health check acessado');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor de teste rodando na porta ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

process.on('SIGINT', () => {
  console.log('Encerrando servidor de teste...');
  process.exit(0);
});