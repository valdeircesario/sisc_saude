/**
 * Utilitários para gerenciar dispensações de receitas
 */

const MAX_DISPENSACOES_POR_RECEITA = 6;

/**
 * Verifica se uma receita pode ser dispensada
 * @param {Array} dispensacoes - Array de dispensações da receita
 * @returns {Object} { pode: boolean, motivo: string }
 *
 * Regras:
 * - Se há dispensação "completa", não pode dispensar (receita já completa)
 * - Se atingiu máximo de 6 dispensações, não pode dispensar
 * - Senão, pode dispensar (há parciais ou menos de 6)
 */
export function podeDispensar(dispensacoes = []) {
  // Se não há dispensações, pode dispensar
  if (
    !dispensacoes ||
    !Array.isArray(dispensacoes) ||
    dispensacoes.length === 0
  ) {
    return { pode: true, motivo: null };
  }

  // Verifica se há uma dispensação completa
  const temCompleta = dispensacoes.some(
    (disp) => disp && disp.statusDispensacao === "completa",
  );
  if (temCompleta) {
    return {
      pode: false,
      motivo:
        "Esta receita já foi dispensada completamente e não pode ser dispensada novamente",
    };
  }

  // Verifica se atingiu o máximo de dispensações
  if (dispensacoes.length >= MAX_DISPENSACOES_POR_RECEITA) {
    return {
      pode: false,
      motivo: `Número máximo de dispensações (${MAX_DISPENSACOES_POR_RECEITA}) atingido para esta receita`,
    };
  }

  // Pode dispensar (há parciais ou menos de 6)
  return { pode: true, motivo: null };
}

/**
 * Obtém a última dispensação de uma receita
 * @param {Array} dispensacoes - Array de dispensações
 * @returns {Object|null} Última dispensação ou null
 */
export function obterUltimaDispensacao(dispensacoes = []) {
  if (
    !dispensacoes ||
    !Array.isArray(dispensacoes) ||
    dispensacoes.length === 0
  )
    return null;
  return dispensacoes[dispensacoes.length - 1];
}

/**
 * Conta dispensações por status
 * @param {Array} dispensacoes - Array de dispensações
 * @returns {Object} { total, completas, parciais }
 */
export function contarDispensacoes(dispensacoes = []) {
  if (!dispensacoes || !Array.isArray(dispensacoes)) {
    return { total: 0, completas: 0, parciais: 0 };
  }

  return {
    total: dispensacoes.length,
    completas: dispensacoes.filter(
      (d) => d && d.statusDispensacao === "completa",
    ).length,
    parciais: dispensacoes.filter((d) => d && d.statusDispensacao === "parcial")
      .length,
  };
}

/**
 * Verifica se há dispensação completa
 * @param {Array} dispensacoes - Array de dispensações
 * @returns {boolean}
 */
export function temDispensacaoCompleta(dispensacoes = []) {
  if (!dispensacoes || !Array.isArray(dispensacoes)) return false;
  return dispensacoes.some((d) => d && d.statusDispensacao === "completa");
}

/**
 * Verifica se há dispensação parcial
 * @param {Array} dispensacoes - Array de dispensações
 * @returns {boolean}
 */
export function temDispensacaoParcial(dispensacoes = []) {
  if (!dispensacoes || !Array.isArray(dispensacoes)) return false;
  return dispensacoes.some((d) => d && d.statusDispensacao === "parcial");
}

/**
 * Formata informações de dispensação para resposta
 * @param {Array} dispensacoes - Array de dispensações
 * @returns {Object} Informações formatadas
 */
export function formatarInfoDispensacao(dispensacoes = []) {
  const contagem = contarDispensacoes(dispensacoes);
  const validacao = podeDispensar(dispensacoes);

  return {
    total: contagem.total,
    completas: contagem.completas,
    parciais: contagem.parciais,
    temCompleta: contagem.completas > 0,
    temParcial: contagem.parciais > 0,
    podeDispensar: validacao.pode,
    motivoNaoPode: validacao.motivo,
    maxDispensacoes: MAX_DISPENSACOES_POR_RECEITA,
  };
}

export default {
  podeDispensar,
  obterUltimaDispensacao,
  temDispensacaoCompleta,
  temDispensacaoParcial,
  contarDispensacoes,
  formatarInfoDispensacao,
  MAX_DISPENSACOES_POR_RECEITA,
};
