import { receitasAtestadoService } from "../services/receitasAtestadoService.js";

export const receitasAtestadoController = {
  async getReceitas(req, res) {
    try {
      const funcionarioId = req.user.id;
      const receitas = await receitasAtestadoService.getReceitasByFuncionarioId(funcionarioId);
      res.json(receitas);
    } catch (error) {
      console.error("Erro ao buscar receitas:", error);
      const status = error.status || 500;
      res.status(status).json({ message: error.message || "Erro ao buscar receitas" });
    }
  },

  async getAtestados(req, res) {
    try {
      const funcionarioId = req.user.id;
      const atestados = await receitasAtestadoService.getAtestadosByFuncionarioId(funcionarioId);
      res.json(atestados);
    } catch (error) {
      console.error("Erro ao buscar atestados:", error);
      const status = error.status || 500;
      res.status(status).json({ message: error.message || "Erro ao buscar atestados" });
    }
  },

  async assinarReceita(req, res) {
    try {
      const { id } = req.params;
      const funcionarioId = req.user.id;
      const { assinaturaTexto, assinaturaPosX, assinaturaPosY, registroAssinatura } = req.body;

      if (!assinaturaTexto || assinaturaPosX === undefined || assinaturaPosY === undefined) {
        return res.status(400).json({
          message: "Campos obrigatórios: assinaturaTexto, assinaturaPosX, assinaturaPosY",
        });
      }

      const dataAssinatura = {
        assinaturaTexto,
        assinaturaPosX,
        assinaturaPosY,
        registroAssinatura,
      };

      const receitaAssinada = await receitasAtestadoService.assinarReceita(id, funcionarioId, dataAssinatura);
      res.json(receitaAssinada);
    } catch (error) {
      console.error("Erro ao assinar receita:", error);
      const status = error.status || 500;
      res.status(status).json({ message: error.message || "Erro ao assinar receita" });
    }
  },

  async assinarAtestado(req, res) {
    try {
      const { id } = req.params;
      const funcionarioId = req.user.id;
      const { assinaturaTexto, assinaturaPosX, assinaturaPosY, registroAssinatura } = req.body;

      if (!assinaturaTexto || assinaturaPosX === undefined || assinaturaPosY === undefined) {
        return res.status(400).json({
          message: "Campos obrigatórios: assinaturaTexto, assinaturaPosX, assinaturaPosY",
        });
      }

      const dataAssinatura = {
        assinaturaTexto,
        assinaturaPosX,
        assinaturaPosY,
        registroAssinatura,
      };

      const atestadoAssinado = await receitasAtestadoService.assinarAtestado(id, funcionarioId, dataAssinatura);
      res.json(atestadoAssinado);
    } catch (error) {
      console.error("Erro ao assinar atestado:", error);
      const status = error.status || 500;
      res.status(status).json({ message: error.message || "Erro ao assinar atestado" });
    }
  },

  async getReceitaById(req, res) {
    try {
      const { id } = req.params;
      const funcionarioId = req.user.id;
      
      const receita = await receitasAtestadoService.getReceitaById(id, funcionarioId);
      res.json(receita);
    } catch (error) {
      console.error("Erro ao buscar receita:", error);
      const status = error.status || 500;
      res.status(status).json({ message: error.message || "Erro ao buscar receita" });
    }
  },

  async getAtestadoById(req, res) {
    try {
      const { id } = req.params;
      const funcionarioId = req.user.id;
      
      const atestado = await receitasAtestadoService.getAtestadoById(id, funcionarioId);
      res.json(atestado);
    } catch (error) {
      console.error("Erro ao buscar atestado:", error);
      const status = error.status || 500;
      res.status(status).json({ message: error.message || "Erro ao buscar atestado" });
    }
  },
};
