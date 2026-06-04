import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { testConnection } from "./config/database.js";

// Routes
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import ubsRoutes from "./routes/ubs.js";
import funcionarioRoutes from "./routes/funcionario.js";
import laboratorioRoutes from "./routes/laboratorio.js";
import pacienteRoutes from "./routes/paciente.js";
import campanhaRoutes from "./routes/campanha.js";
import exameRoutes from "./routes/exame.js";
import consultaRoutes from "./routes/consulta.js";
import hospitalRoutes from "./routes/hospital.js";
import upaRoutes from "./routes/upa.js";
import medicamentosRoutes from "./routes/medicamentos.js";
import farmaciaRoutes from "./routes/farmacia.js";

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config();

// ✅ SEGURANÇA: Validar variáveis de ambiente críticas
if (!process.env.JWT_SECRET) {
  console.error(
    "❌ ERRO CRÍTICO: JWT_SECRET não configurado nas variáveis de ambiente.",
  );
  console.error(
    "   Verifique o arquivo .env e certifique-se que JWT_SECRET está definido.",
  );
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Testar conexão com o banco
testConnection();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Muitas tentativas, tente novamente em 15 minutos",
});

// Middleware
app.use(helmet());
app.use(limiter);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Criar diretório de uploads se não existir
import fs from "fs";
const uploadsDir = path.join(__dirname, "uploads", "exames");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ✅ SEGURANÇA: REMOVIDO - Os uploads agora só podem ser acessados através de rotas autenticadas
// Evita exposição pública de dados médicos sensíveis (IDOR)
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ubs", ubsRoutes);
app.use("/api/funcionario", funcionarioRoutes);
app.use("/api/laboratorio", laboratorioRoutes);
app.use("/api/paciente", pacienteRoutes);
app.use("/api/campanhas", campanhaRoutes);
app.use("/api/exames", exameRoutes);
app.use("/api/consultas", consultaRoutes);
app.use("/api/hospital", hospitalRoutes);
app.use("/api/upa", upaRoutes);
app.use("/api/farmacia", farmaciaRoutes);
app.use("/api", medicamentosRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Sistema de Saúde Integrado funcionando!",
    timestamp: new Date().toISOString(),
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error("Erro no servidor:", err.stack);
  res.status(500).json({
    message: "Erro interno do servidor",
    error:
      process.env.NODE_ENV === "development" ? err.message : "Algo deu errado!",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Rota não encontrada" });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Health check disponível em http://localhost:${PORT}/health`);
  console.log(
    `🌐 CORS configurado para: ${process.env.CORS_ORIGIN || "http://localhost:5173"}`,
  );
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🔄 Encerrando servidor...");
  const { disconnect } = await import("./config/database.js");
  await disconnect();
  process.exit(0);
});
