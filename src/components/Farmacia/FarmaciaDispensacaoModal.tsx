import React from "react";
import {
  Package,
  Box,
  AlertCircle,
  CheckCircle,
  CheckCheck,
  AlertTriangle,
} from "lucide-react";
import { Field, inputClass, RadioOption } from "./FarmaciaUtils";
import { ReceitaPayload, DispensacaoPayload } from "./FarmaciaResultCard";

export interface DispensacaoFormState {
  medicamentoFornecido: string;
  observacoesDispensacao: string;
  statusDispensacao: "completa" | "parcial";
  farmaciaResponsavel: string;
  quantidadeDispensada: string;
}

interface FarmaciaDispensacaoModalProps {
  receita: ReceitaPayload;
  isEditing: boolean;
  formData: DispensacaoFormState;
  onFormChange: (field: keyof DispensacaoFormState, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
  contagem: { total: number; completas: number; parciais: number };
  validacaoDispensacao: { pode: boolean; motivo: string | null };
  maxDispensacoes: number;
  userName: string;
}

export const FarmaciaDispensacaoModal: React.FC<
  FarmaciaDispensacaoModalProps
> = ({
  receita,
  isEditing,
  formData,
  onFormChange,
  onSubmit,
  onCancel,
  isLoading,
  contagem,
  validacaoDispensacao,
  maxDispensacoes,
  userName,
}) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
      <h2
        className="text-2xl text-red-950 mb-1"
        style={{ fontFamily: "'DM Serif Display', serif" }}
      >
        {isEditing ? "Atualizar dispensação" : "Registrar dispensação"}
      </h2>
      <p className="text-xs text-gray-400 mb-5">
        Paciente: {receita.paciente?.nome}
      </p>

      {contagem.total > 0 && (
        <div className="inline-flex items-center gap-1.5 text-[0.7rem] font-semibold text-red-600 bg-indigo-50 px-3 py-1 rounded-full mb-5">
          <Box size={12} />
          {contagem.total} / {maxDispensacoes} dispensações
        </div>
      )}

      {!validacaoDispensacao.pode && !isEditing && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 mb-4">
          <AlertCircle size={15} />
          {validacaoDispensacao.motivo}
        </div>
      )}

      <Field id="med-modal" label="Medicamento fornecido">
        <input
          id="med-modal"
          type="text"
          className={inputClass}
          value={formData.medicamentoFornecido}
          onChange={(e) => onFormChange("medicamentoFornecido", e.target.value)}
          placeholder="Nome do medicamento fornecido"
        />
      </Field>

      <Field id="qtd-modal" label="Quantidade Medicação">
        <input
          id="qtd-modal"
          type="number"
          min={1}
          max={receita.quantidade}
          className={inputClass}
          value={formData.quantidadeDispensada}
          onChange={(e) => {
            const valor = Number(e.target.value);
            const maximo = Number(receita.quantidade);

            if (e.target.value === "" || (valor >= 1 && valor <= maximo)) {
              onFormChange("quantidadeDispensada", e.target.value);
            }
          }}
          onBlur={(e) => {
            const valor = Number(e.target.value);
            const maximo = Number(receita.quantidade);

            if (valor > maximo) {
              onFormChange("quantidadeDispensada", String(maximo));
            }
          }}
          placeholder={`Máx: ${receita.quantidade}`}
        />
        {Number(formData.quantidadeDispensada) > Number(receita.quantidade) && (
          <p className="text-xs text-red-500 mt-1">
            Valor não pode ser maior que {receita.quantidade}
          </p>
        )}
      </Field>

      <Field id="obs-modal" label="Observações *">
        <textarea
          id="obs-modal"
          className={`${inputClass} resize-y min-h-[80px]`}
          value={formData.observacoesDispensacao}
          onChange={(e) =>
            onFormChange("observacoesDispensacao", e.target.value)
          }
          placeholder="Ex: Medicamento indisponível, paciente retorna amanhã"
          rows={3}
          required
        />
      </Field>

      <div className="mb-5">
        <label
          htmlFor="status-modal"
          className="block text-xs font-semibold text-gray-700 mb-2 tracking-wide"
        >
          Status da dispensação
        </label>
        <div className="flex gap-2.5">
          <RadioOption
            value="completa"
            current={formData.statusDispensacao}
            onChange={(v) => onFormChange("statusDispensacao", v)}
            icon={
              <CheckCheck
                size={15}
                className={
                  formData.statusDispensacao === "completa"
                    ? "text-indigo-500"
                    : "text-gray-300"
                }
              />
            }
            title="Completa"
            subtitle="Fornecido na íntegra"
          />
          <RadioOption
            value="parcial"
            current={formData.statusDispensacao}
            onChange={(v) => onFormChange("statusDispensacao", v)}
            icon={
              <AlertTriangle
                size={15}
                className={
                  formData.statusDispensacao === "parcial"
                    ? "text-amber-400"
                    : "text-gray-300"
                }
              />
            }
            title="Parcial"
            subtitle="Paciente volta depois"
          />
        </div>
      </div>

      <Field id="atend-modal" label="Atendente responsável *">
        <input
          id="atend-modal"
          type="text"
          className={inputClass}
          value={formData.farmaciaResponsavel}
          onChange={(e) => onFormChange("farmaciaResponsavel", e.target.value)}
          placeholder="Digite seu nome"
          required
        />
      </Field>

      <div className="mb-5 p-3 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="block text-xs font-semibold text-red-900 mb-1.5 tracking-wide">
          Farmácia responsável
        </p>
        <div className="text-sm font-medium text-red-700 flex items-center gap-2">
          <Package size={14} className="text-red-500" />
          {userName || "Farmácia"}
        </div>
        <p className="text-[0.7rem] text-red-600 mt-1 italic">
          Informação fixa do usuário logado
        </p>
      </div>

      <div className="flex gap-2.5 mt-6 pt-5 border-t border-slate-100">
        <button
          onClick={onCancel}
          className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-500 text-sm font-medium transition-all hover:bg-gray-50 hover:border-gray-300"
        >
          Cancelar
        </button>
        <button
          onClick={onSubmit}
          disabled={
            isLoading ||
            (!validacaoDispensacao.pode && !isEditing) ||
            !formData.observacoesDispensacao.trim() ||
            !formData.farmaciaResponsavel.trim()
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
              {isEditing ? "Atualizar" : "Confirmar dispensação"}
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);
