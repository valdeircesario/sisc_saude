import React, { useState } from "react";
import {
  Package,
  Box,
  AlertCircle,
  CheckCircle,
  CheckCheck,
  AlertTriangle,
  X,
} from "lucide-react";
import { Field, inputClass, RadioOption } from "./FarmaciaUtils";
import { ReceitaPayload, ReceitaMedicamento } from "./FarmaciaResultCard";

export interface MedicamentoPendente {
  receitaMedicamentoId: string;
  medicamentoFornecido: string;
  quantidadeDispensada: number;
  observacoes: string;
  atendente: string;
}

interface FarmaciaDispensacaoModalNovoProps {
  receita: ReceitaPayload;
  onSubmit: (medicamentos: MedicamentoPendente[]) => void;
  onCancel: () => void;
  isLoading: boolean;
  userName: string;
}

export const FarmaciaDispensacaoModalNovo: React.FC<
  FarmaciaDispensacaoModalNovoProps
> = ({ receita, onSubmit, onCancel, isLoading, userName }) => {
  const medicamentosPendentes =
    receita.itens?.filter((item) => item.status === "pendente") || [];
  const [selecionados, setSelecionados] = useState<Set<string>>(
    new Set(medicamentosPendentes.map((m) => m.id))
  );
  const [formulariosAbertos, setFormulariosAbertos] = useState<Set<string>>(
    new Set()
  );
  const [dadosMedicamentos, setDadosMedicamentos] = useState<
    Record<string, MedicamentoPendente>
  >(
    medicamentosPendentes.reduce(
      (acc, med) => ({
        ...acc,
        [med.id]: {
          receitaMedicamentoId: med.id,
          medicamentoFornecido: med.medicamento,
          quantidadeDispensada: med.quantidade,
          observacoes: med.observacoes || "",
          atendente: "",
        },
      }),
      {}
    )
  );

  const handleToggleSelecionado = (id: string) => {
    const novo = new Set(selecionados);
    if (novo.has(id)) {
      novo.delete(id);
    } else {
      novo.add(id);
    }
    setSelecionados(novo);
  };

  const handleToggleFormulario = (id: string) => {
    const novo = new Set(formulariosAbertos);
    if (novo.has(id)) {
      novo.delete(id);
    } else {
      novo.add(id);
    }
    setFormulariosAbertos(novo);
  };

  const handleMudancaDados = (
    id: string,
    campo: keyof MedicamentoPendente,
    valor: any
  ) => {
    setDadosMedicamentos({
      ...dadosMedicamentos,
      [id]: {
        ...dadosMedicamentos[id],
        [campo]: valor,
      },
    });
  };

  const handleSubmit = async () => {
    const medicamentosSelecionados = Array.from(selecionados).map((id) => ({
      ...dadosMedicamentos[id],
      receitaMedicamentoId: id,
    }));

    if (medicamentosSelecionados.length === 0) {
      alert("Selecione ao menos um medicamento para dispensar");
      return;
    }

    const faltaAtendente = medicamentosSelecionados.some(med => !med.atendente || !med.atendente.trim());
    if (faltaAtendente) {
      alert("O nome do atendente é obrigatório para todos os medicamentos selecionados.");
      return;
    }

    onSubmit(medicamentosSelecionados);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2
              className="text-2xl text-red-950"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              Dispensar Medicamentos
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Paciente: {receita.paciente?.nome}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {medicamentosPendentes.length === 0 ? (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
            <CheckCheck size={18} className="text-green-600" />
            <p className="text-sm text-green-700">
              Todos os medicamentos desta receita já foram dispensados! ✓
            </p>
          </div>
        ) : (
          <>
            {/* Lista de medicamentos */}
            <div className="space-y-2 mb-6">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Medicamentos disponíveis para dispensação ({medicamentosPendentes.length})
              </label>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {medicamentosPendentes.map((medicamento) => (
                  <div
                    key={medicamento.id}
                    className="border border-slate-200 rounded-xl p-3 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selecionados.has(medicamento.id)}
                        onChange={() =>
                          handleToggleSelecionado(medicamento.id)
                        }
                        className="mt-1 w-4 h-4 text-red-600 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-700">
                          {medicamento.medicamento}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          <strong>Dosagem:</strong> {medicamento.dosagem} |{" "}
                          <strong>Qtd:</strong> {medicamento.quantidade}
                        </p>
                        {medicamento.posologia && (
                          <p className="text-xs text-slate-500">
                            <strong>Posologia:</strong> {medicamento.posologia}
                          </p>
                        )}
                      </div>
                      {selecionados.has(medicamento.id) && (
                        <button
                          onClick={() =>
                            handleToggleFormulario(medicamento.id)
                          }
                          className="text-xs font-semibold text-red-600 hover:text-red-700 whitespace-nowrap"
                        >
                          {formulariosAbertos.has(medicamento.id)
                            ? "Ocultar"
                            : "Editar"}
                        </button>
                      )}
                    </div>

                    {/* Formulário expandido */}
                    {selecionados.has(medicamento.id) &&
                      formulariosAbertos.has(medicamento.id) && (
                        <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                          <div>
                            <label className="text-xs font-semibold text-gray-700 block mb-2">
                              Medicamento fornecido
                            </label>
                            <input
                              type="text"
                              className={inputClass}
                              value={
                                dadosMedicamentos[medicamento.id]
                                  ?.medicamentoFornecido || ""
                              }
                              onChange={(e) =>
                                handleMudancaDados(
                                  medicamento.id,
                                  "medicamentoFornecido",
                                  e.target.value
                                )
                              }
                              placeholder="Nome do medicamento (genérico, etc.)"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-gray-700 block mb-2">
                              Quantidade dispensada
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={medicamento.quantidade}
                              className={inputClass}
                              value={
                                dadosMedicamentos[medicamento.id]
                                  ?.quantidadeDispensada || medicamento.quantidade
                              }
                              onChange={(e) =>
                                handleMudancaDados(
                                  medicamento.id,
                                  "quantidadeDispensada",
                                  Number(e.target.value)
                                )
                              }
                            />
                            <p className="text-xs text-slate-500 mt-1">
                              Máximo: {medicamento.quantidade}
                            </p>
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-gray-700 block mb-2">
                              Atendente (Obrigatório)
                            </label>
                            <input
                              type="text"
                              className={inputClass}
                              value={
                                dadosMedicamentos[medicamento.id]?.atendente || ""
                              }
                              onChange={(e) =>
                                handleMudancaDados(
                                  medicamento.id,
                                  "atendente",
                                  e.target.value
                                )
                              }
                              placeholder="Nome do atendente"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-gray-700 block mb-2">
                              Observações
                            </label>
                            <textarea
                              className={`${inputClass} resize-none min-h-[60px]`}
                              value={
                                dadosMedicamentos[medicamento.id]
                                  ?.observacoes || ""
                              }
                              onChange={(e) =>
                                handleMudancaDados(
                                  medicamento.id,
                                  "observacoes",
                                  e.target.value
                                )
                              }
                              placeholder="Ex: Medicamento genérico, paciente informado..."
                              rows={2}
                            />
                          </div>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>

            {/* Informações do farmacêutico */}
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="block text-xs font-semibold text-red-900 mb-1.5 tracking-wide">
                Farmácia responsável
              </p>
              <div className="text-sm font-medium text-red-700 flex items-center gap-2">
                <Package size={14} className="text-red-500" />
                {userName}
              </div>
              <p className="text-[0.7rem] text-red-600 mt-1 italic">
                Informação fixa do usuário logado
              </p>
            </div>

            {/* Resumo de seleção */}
            <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <p className="text-sm font-medium text-slate-700 mb-2">
                Resumo: {selecionados.size} medicamento(s) selecionado(s)
              </p>
              <div className="flex flex-wrap gap-2">
                {Array.from(selecionados).map((id) => {
                  const med = medicamentosPendentes.find((m) => m.id === id);
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 font-medium"
                    >
                      {med?.medicamento}
                      <CheckCheck size={12} />
                    </span>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Botões */}
        <div className="flex gap-2.5 pt-4 border-t border-slate-100">
          <button
            onClick={onCancel}
            className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-500 text-sm font-medium transition-all hover:bg-gray-50 hover:border-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              isLoading ||
              selecionados.size === 0 ||
              medicamentosPendentes.length === 0
            }
            className="flex-1 py-3 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-md shadow-red-200 transition-all hover:shadow-lg hover:shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <CheckCircle size={15} />
                Dispensar ({selecionados.size})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FarmaciaDispensacaoModalNovo;
