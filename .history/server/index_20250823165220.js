import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { testConnection } from './config/database.js';

// Routes
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import ubsRoutes from './routes/ubs.js';
import funcionarioRoutes from './routes/funcionario.js';
import laboratorioRoutes from './routes/laboratorio.js';
import pacienteRoutes from './routes/paciente.js';
import campanhaRoutes from './routes/campanha.js';
import exameRoutes from './routes/exame.js';
import consultaRoutes from './routes/consulta.js';
import hospitalRoutes from './routes/';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Testar conexão com o banco
testConnection();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Muitas tentativas, tente novamente em 15 minutos'
});

// Middleware
app.use(helmet());
app.use(limiter);
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Criar diretório de uploads se não existir
import fs from 'fs';
const uploadsDir = path.join(__dirname, 'uploads', 'exames');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ubs', ubsRoutes);
app.use('/api/funcionario', funcionarioRoutes);
app.use('/api/laboratorio', laboratorioRoutes);
app.use('/api/paciente', pacienteRoutes);
app.use('/api/campanhas', campanhaRoutes);
app.use('/api/exames', exameRoutes);
app.use('/api/consultas', consultaRoutes);
app.use('/api/hospitais', hospitalRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Sistema de Saúde Integrado funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Erro no servidor:', err.stack);
  res.status(500).json({ 
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Health check disponível em http://localhost:${PORT}/health`);
  console.log(`🌐 CORS configurado para: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Encerrando servidor...');
  const { disconnect } = await import('./config/database.js');
  await disconnect();
  process.exit(0);
});