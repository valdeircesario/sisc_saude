import React from "react";
import { Search } from "lucide-react";
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Pacientes</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Buscar pacientes..."
            />
          </div>
        </div>
      </div>
      {loadingPacientes ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando pacientes...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {pacientes?.map((paciente: any) => (
            <PacienteCard
              key={paciente.id}
              paciente={paciente}
              onEdit={openPacienteModal}
              onHistorico={openHistoricoModal}
              onConsulta={openConsultaPacienteModal}
              onInternacao={openInternacaoModal}
            />
          ))}
        </div>
      )}
    </div>
  );
};
