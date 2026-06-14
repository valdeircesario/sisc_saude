import React from "react";
import { Calendar, Search, Filter, Clock } from "lucide-react";
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center border border-sky-100 shadow-sm">
              <Calendar className="h-5 w-5 text-sky-600" />
            </div>
            Agenda de Consultas
          </h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 ml-13">
            Triagem e agendamento especializado
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={consultaSearchTerm}
              onChange={(e) => setConsultaSearchTerm(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-medium placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm shadow-gray-100/50"
              placeholder="Buscar por paciente..."
            />
          </div>

          <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm shadow-gray-100/50 w-full sm:w-auto overflow-x-auto no-scrollbar">
             {["todas", "solicitada", "agendada", "cancelada"].map((status) => (
               <button
                 key={status}
                 onClick={() => setConsultaStatusFilter(status)}
                 className={`
                   px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                   ${consultaStatusFilter === status 
                     ? "bg-teal-600 text-white shadow-md shadow-teal-100" 
                     : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                   }
                 `}
               >
                 {status}
               </button>
             ))}
          </div>
        </div>
      </div>

      {loadingConsultas ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-sky-600 border-t-transparent mb-4"></div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Atualizando agenda...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConsultas?.length > 0 ? (
            filteredConsultas.map((consulta: any) => (
              <ConsultaCard
                key={consulta.id}
                consulta={consulta}
                onAgendar={openAgendamentoModal}
                onCancelamento={openCancelamentoModal}
              />
            ))
          ) : (
            <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-gray-200 flex flex-col items-center">
              <Clock className="h-12 w-12 text-gray-100 mb-3" />
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Nenhuma consulta nesta categoria</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
