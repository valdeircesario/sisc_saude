import React from "react";
import { Search } from "lucide-react";
import { inputClass } from "./FarmaciaUtils";
import {
  FarmaciaResultCard,
  ReceitaPayload,
  DispensacaoPayload,
} from "./FarmaciaResultCard";

interface FarmaciaConsultaTabProps {
  registroInput: string;
  onRegistroChange: (value: string) => void;
  onBuscar: () => void;
  onLimpar: () => void;
  receita: ReceitaPayload | null;
  contagem: { total: number; completas: number; parciais: number };
  ultimaDispensacao: DispensacaoPayload | null;
  validacaoDispensacao: { pode: boolean; motivo: string | null };
  onDispensarClick: () => void;
  formatarDataDispensacao?: (disp: DispensacaoPayload) => string;
}

export const FarmaciaConsultaTab: React.FC<FarmaciaConsultaTabProps> = ({
  registroInput,
  onRegistroChange,
  onBuscar,
  onLimpar,
  receita,
  contagem,
  ultimaDispensacao,
  validacaoDispensacao,
  onDispensarClick,
  formatarDataDispensacao,
}) => (
  <div>
    <label
      htmlFor="registro"
      className="block text-xs font-semibold text-gray-700 mb-2.5"
    >
      Número do registro de assinatura
    </label>

    {/* Search row */}
    <div className="flex gap-2.5">
      <input
        id="registro"
        type="text"
        className={`${inputClass} flex-1`}
        value={registroInput}
        onChange={(e) => onRegistroChange(e.target.value)}
        placeholder="Ex: REC-2024-00123"
        onKeyDown={(e) => e.key === "Enter" && onBuscar()}
      />
      <button
        type="button"
        onClick={onBuscar}
        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-red-400 to-red-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-red-200 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-200 whitespace-nowrap"
      >
        <Search size={15} />
        Buscar
      </button>
      <button
        type="button"
        onClick={onLimpar}
        className="px-4 py-2.5 bg-gray-100 text-gray-500 rounded-xl text-sm font-medium transition-all hover:bg-gray-200 hover:text-gray-700 whitespace-nowrap"
      >
        Limpar
      </button>
    </div>

    {/* Result card */}
    {receita && (
      <FarmaciaResultCard
        receita={receita}
        contagem={contagem}
        ultimaDispensacao={ultimaDispensacao}
        validacaoDispensacao={validacaoDispensacao}
        onDispensarClick={onDispensarClick}
        formatarDataDispensacao={formatarDataDispensacao}
      />
    )}
  </div>
);
