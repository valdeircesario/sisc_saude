import React from "react";
import { Search } from "lucide-react";
import { ConsultaCard } from "./UBSCards";

interface UBSConsultasTabProps {
  filteredConsultas: any[];
  loadingConsultas: boolean;
  consultaSearchTerm: string;
  setConsultaSearchTerm: (term: string) => void;
  consultaStatusFilter: string;
  setConsultaStatusFilter: (filter: string) => void;
  openAgendamentoModal: (consulta: any) => void;
  openCancelamentoModal: (consulta: any) => void;
}

export const UBSConsultasTab: React.FC<UBSConsultasTabProps> = ({
  filteredConsultas,
  loadingConsultas,
  consultaSearchTerm,
  setConsultaSearchTerm,
  consultaStatusFilter,
  setConsultaStatusFilter,
  openAgendamentoModal,
  openCancelamentoModal,
}) => {
  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-2xl font-bold text-gray-900">Consultas</h2>
          <div className="text-sm text-gray-500">
            {filteredConsultas.length} consulta(s) encontrada(s)
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={consultaSearchTerm}
              onChange={(e) => setConsultaSearchTerm(e.target.value)}
              placeholder="Buscar por nome do paciente"
              className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              value={consultaStatusFilter}
              onChange={(e) => setConsultaStatusFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="todas">Todas</option>
              <option value="solicitada">Solicitada</option>
              <option value="agendada">Agendada</option>
              <option value="realizada">Realizada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </div>
      </div>

      {loadingConsultas ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando consultas...</p>
        </div>
      ) : filteredConsultas.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center text-gray-500">
          Nenhuma consulta encontrada para os filtros selecionados.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredConsultas.map((consulta: any) => (
            <ConsultaCard
              key={consulta.id}
              consulta={consulta}
              onAgendar={openAgendamentoModal}
              onCancelamento={openCancelamentoModal}
            />
          ))}
        </div>
      )}
    </div>
  );
};
