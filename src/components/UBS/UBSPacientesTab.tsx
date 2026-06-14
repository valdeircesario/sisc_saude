import React from "react";
import { Search, Heart, UserPlus, Filter } from "lucide-react";
import { PacienteCard } from "./UBSCards";

interface UBSPacientesTabProps {
  pacientes: any[];
  loadingPacientes: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  openPacienteModal: (paciente: any) => void;
  openHistoricoModal: (paciente: any) => void;
  openConsultaPacienteModal: (paciente: any) => void;
  openInternacaoModal: (paciente: any) => void;
}

export const UBSPacientesTab: React.FC<UBSPacientesTabProps> = ({
  pacientes,
  loadingPacientes,
  searchTerm,
  setSearchTerm,
  openPacienteModal,
  openHistoricoModal,
  openConsultaPacienteModal,
  openInternacaoModal,
}) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-100 shadow-sm">
              <Heart className="h-5 w-5 text-rose-600" />
            </div>
            Base de Pacientes
          </h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 ml-13">
            Consulta e gerenciamento clínico
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-medium placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm shadow-gray-100/50"
              placeholder="Nome, CPF ou CNS..."
            />
          </div>
          <button className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-teal-600 hover:bg-gray-50 transition-all shadow-sm shadow-gray-100/50">
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>

      {loadingPacientes ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-rose-600 border-t-transparent mb-4"></div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Localizando registros...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {pacientes?.length > 0 ? (
            pacientes.map((paciente: any) => (
              <PacienteCard
                key={paciente.id}
                paciente={paciente}
                onEdit={openPacienteModal}
                onHistorico={openHistoricoModal}
                onConsulta={openConsultaPacienteModal}
                onInternacao={openInternacaoModal}
              />
            ))
          ) : (
            <div className="py-20 bg-white rounded-3xl border border-dashed border-gray-200 flex flex-col items-center">
              <Heart className="h-12 w-12 text-gray-100 mb-3" />
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Nenhum paciente encontrado</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
