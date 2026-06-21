import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { prisma } from "../config/database.js";

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token de acesso requerido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token inválido" });
  }
};

export const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.tipo)) {
      return res
        .status(403)
        .json({ message: "Acesso negado para este tipo de usuário" });
    }
    next();
  };
};

export const authorizePaciente = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token de acesso requerido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.tipo !== "paciente") {
      return res
        .status(403)
        .json({ message: "Acesso exclusivo para pacientes" });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token inválido" });
  }
};

// ✅ SEGURANÇA: Rate limiter específico para rotas de autenticação
// Limite muito mais rígido para prevenir ataques de força bruta
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Máximo 5 tentativas
  message: "Muitas tentativas de login. Tente novamente em 15 minutos.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => {
    // Não aplicar rate limit se a requisição foi bem-sucedida (status 200)
    return false;
  },
});
