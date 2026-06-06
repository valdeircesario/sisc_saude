import { useCallback } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";

/**
 * Hook para gerenciar dispensações de receitas
 */
export const useDispensacao = () => {
  const MAX_DISPENSACOES = 6;

  /**
   * Verifica se pode dispensar uma receita
   */
  const podeDispensar = useCallback((dispensacoes: any[] = [], itens?: any[]) => {
    // Nova validação baseada nos itens da receita (para múltiplos medicamentos)
    if (itens && itens.length > 0) {
      const todosDispensados = itens.every(i => i.status === "dispensado" || i.dispensado);
      if (todosDispensados) {
        return { pode: false, motivo: "Esta receita já foi completamente dispensada" };
      }
      return { pode: true, motivo: null };
    }

    // Validação legada
    if (!dispensacoes || dispensacoes.length === 0) {
      return { pode: true, motivo: null };
    }

    const temCompleta = dispensacoes.some(
      (d) => d.statusDispensacao === "completa",
    );
    if (temCompleta) {
      return {
        pode: false,
        motivo: "Esta receita já foi dispensada completamente",
      };
    }

    if (dispensacoes.length >= MAX_DISPENSACOES) {
      return {
        pode: false,
        motivo: `Máximo de ${MAX_DISPENSACOES} dispensações atingido`,
      };
    }

    return { pode: true, motivo: null };
  }, []);

  /**
   * Verifica se há dispensação parcial
   */
  const temDispensacaoParcial = useCallback((dispensacoes: any[] = []) => {
    return dispensacoes.some((d) => d.statusDispensacao === "parcial");
  }, []);

  /**
   * Verifica se há dispensação completa
   */
  const temDispensacaoCompleta = useCallback((dispensacoes: any[] = []) => {
    return dispensacoes.some((d) => d.statusDispensacao === "completa");
  }, []);

  /**
   * Obtém última dispensação
   */
  const obterUltimaDispensacao = useCallback((dispensacoes: any[] = []) => {
    if (!dispensacoes || dispensacoes.length === 0) return null;
    return dispensacoes[dispensacoes.length - 1];
  }, []);

  /**
   * Registra nova dispensação
   */
  const registrarDispensacao = useCallback(
    async (receitaId, dadosDispensacao) => {
      try {
        const payload = {
          receitaId,
          ...dadosDispensacao,
        };

        const response = await api.post("/farmacia/dispensar", payload);
        toast.success("Dispensação registrada com sucesso");
        return response.data;
      } catch (error) {
        const mensagemErro =
          error?.response?.data?.message || "Erro ao registrar dispensação";
        toast.error(mensagemErro);
        throw error;
      }
    },
    [],
  );

  /**
   * Atualiza dispensação existente
   */
  const atualizarDispensacao = useCallback(
    async (dispensacaoId, dadosAtualizacao) => {
      try {
        const response = await api.put(
          `/farmacia/dispensacoes/${dispensacaoId}`,
          dadosAtualizacao,
        );
        toast.success("Dispensação atualizada com sucesso");
        return response.data;
      } catch (error) {
        const mensagemErro =
          error?.response?.data?.message || "Erro ao atualizar dispensação";
        toast.error(mensagemErro);
        throw error;
      }
    },
    [],
  );

  /**
   * Deleta dispensação
   */
  const deletarDispensacao = useCallback(async (dispensacaoId) => {
    try {
      const response = await api.delete(
        `/farmacia/dispensacoes/${dispensacaoId}`,
      );
      toast.success("Dispensação deletada com sucesso");
      return response.data;
    } catch (error) {
      const mensagemErro =
        error?.response?.data?.message || "Erro ao deletar dispensação";
      toast.error(mensagemErro);
      throw error;
    }
  }, []);

  /**
   * Conta dispensações por status
   */
  const contarDispensacoes = useCallback((dispensacoes: any[] = []) => {
    return {
      total: dispensacoes.length,
      completas: dispensacoes.filter((d) => d.statusDispensacao === "completa")
        .length,
      parciais: dispensacoes.filter((d) => d.statusDispensacao === "parcial")
        .length,
    };
  }, []);

  /**
   * Formata data de dispensação
   */
  const formatarDataDispensacao = useCallback((dispensacao) => {
    const data = new Date(
      dispensacao.dataDispensacao || dispensacao.createdAt || Date.now(),
    );
    return data.toLocaleString("pt-BR");
  }, []);

  return {
    MAX_DISPENSACOES,
    podeDispensar,
    temDispensacaoParcial,
    temDispensacaoCompleta,
    obterUltimaDispensacao,
    registrarDispensacao,
    atualizarDispensacao,
    deletarDispensacao,
    contarDispensacoes,
    formatarDataDispensacao,
  };
};

export default useDispensacao;
