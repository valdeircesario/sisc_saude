import React, { useState } from "react";
import { FileText, Search, User, Calendar, Activity, ChevronRight, History, ArrowLeft, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pagination } from "../UI/Pagination";

interface HistoricoTabProps {
  historicoBuscaResultado: any;
  setShowBuscaHistoricoModal: (show: boolean) => void;
  abrirDetalheHistorico: (registro: any) => void;
  selectedPaciente: any;
  setActiveTab: (tab: string) => void;
  historicoPaciente: any[];
}

const FuncionarioHistoricoTab: React.FC<HistoricoTabProps> = ({
  historicoBuscaResultado,
  setShowBuscaHistoricoModal,
  abrirDetalheHistorico,
  selectedPaciente,
  setActiveTab,
  historicoPaciente,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Determina quais dados paginar
  const isSpecificPatient = Boolean(selectedPaciente);
  const dataToPaginate = isSpecificPatient 
    ? (historicoPaciente || []) 
    : (historicoBuscaResultado?.registros || []);

  const totalPages = Math.ceil(dataToPaginate.length / itemsPerPage);
  const currentItems = dataToPaginate.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div
      className="rounded-2xl flex flex-col h-full"
      style={{
        background: "#fff",
        border: "1px solid #D9E4F0",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBF2FB] flex items-center justify-center border border-[#C8D9ED]">
              <History className="h-5 w-5 text-[#1A3F72]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0F2242] tracking-tight">
                {isSpecificPatient ? "Prontuário Digital" : "Histórico por CPF"}
              </h2>
              <p className="text-xs text-[#8FA8C4]">
                {isSpecificPatient 
                  ? "Histórico completo e evoluções clínicas." 
                  : "Busque registros cronológicos de qualquer paciente."}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {isSpecificPatient ? (
              <button
                onClick={() => setActiveTab("pacientes")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#5C7A9B] border border-[#D9E4F0] hover:bg-[#F8FAFD] transition-all"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Voltar
              </button>
            ) : (
              <button
                onClick={() => setShowBuscaHistoricoModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1A3F72] text-white rounded-xl text-xs font-bold shadow-lg shadow-[#1A3F72]/20 hover:scale-105 transition-all"
              >
                <Search className="h-3.5 w-3.5" /> Buscar por CPF
              </button>
            )}
          </div>
        </div>

        {/* Informações do Paciente */}
        {(selectedPaciente || historicoBuscaResultado?.paciente) && (
          <div className="mb-6 p-4 bg-[#F8FAFD] rounded-2xl border border-[#E4EDF7] flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white border border-[#C8D9ED] flex items-center justify-center shadow-sm">
              <User className="h-6 w-6 text-[#1A3F72]" />
            </div>
            <div>
              <h3 className="text-[15px] font-black text-[#0F2242]">
                {selectedPaciente?.nome || historicoBuscaResultado?.paciente?.nome}
              </h3>
              <p className="text-[10px] font-bold text-[#3A5B82] uppercase tracking-widest mt-0.5">
                CPF: {selectedPaciente?.cpf || historicoBuscaResultado?.paciente?.cpf}
              </p>
            </div>
          </div>
        )}

        {dataToPaginate.length > 0 ? (
          <div className="space-y-3 min-h-[400px]">
            {currentItems.map((item: any, idx: number) => (
              <div
                key={idx}
                onClick={() => isSpecificPatient ? null : abrirDetalheHistorico(item)}
                className={`group p-4 rounded-xl border border-[#E4EDF7] bg-[#FAFCFF] transition-all duration-200 ${
                  !isSpecificPatient ? 'hover:bg-white hover:border-[#A8C4E0] hover:shadow-md cursor-pointer' : ''
                }`}
                style={{ borderLeft: "4px solid #1A3F72" }}
              >
                {isSpecificPatient ? (
                  // Layout para evolução clínica específica (Prontuário)
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-black uppercase tracking-wider border border-teal-100">
                            Evolução Clínica
                          </span>
                          <span className="text-[10px] font-bold text-[#8FA8C4] flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {format(new Date(item.dataConsulta), "dd/MM/yyyy HH:mm")}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-[#0F2242]">{item.diagnostico}</h4>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-[#3A5B82]">{item.funcionario?.nome}</p>
                        <p className="text-[10px] font-medium text-[#8FA8C4]">{item.funcionario?.funcao}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-white rounded-xl border border-[#EEF2F7]">
                        <p className="text-[9px] font-black text-[#8FA8C4] uppercase tracking-widest mb-1">Laudo / Evolução</p>
                        <p className="text-xs text-[#1A2E4A] leading-relaxed italic font-medium">"{item.laudo}"</p>
                      </div>
                      <div className="space-y-2">
                        {item.medicacao && (
                          <div className="px-3 py-2 bg-violet-50 rounded-lg border border-violet-100">
                            <p className="text-[9px] font-black text-violet-400 uppercase tracking-widest mb-0.5">Conduta / Medicação</p>
                            <p className="text-xs font-bold text-violet-700">{item.medicacao}</p>
                          </div>
                        )}
                        {item.doenca && (
                          <div className="px-3 py-2 bg-rose-50 rounded-lg border border-rose-100">
                            <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-0.5">CID / Doença</p>
                            <p className="text-xs font-bold text-rose-700">{item.doenca}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Layout para busca geral (Timeline)
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white border border-[#E4EDF7] flex flex-col items-center justify-center group-hover:border-[#1A3F72] transition-colors">
                      <span className="text-[10px] font-black text-[#1A3F72] leading-none">
                        {format(new Date(item.dataRegistro), "dd")}
                      </span>
                      <span className="text-[9px] font-bold text-[#8FA8C4] uppercase">
                        {format(new Date(item.dataRegistro), "MMM", { locale: ptBR })}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          item.tipo === 'historico' ? 'bg-teal-50 text-teal-700 border-teal-100' :
                          item.tipo === 'exame' ? 'bg-sky-50 text-sky-700 border-sky-100' :
                          'bg-violet-50 text-violet-700 border-violet-100'
                        }`}>
                          {item.categoria}
                        </span>
                        <span className="text-[10px] font-bold text-[#8FA8C4]">
                          {format(new Date(item.dataRegistro), "HH:mm")}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#0F2242] mt-1 truncate">
                        {item.titulo}
                      </h4>
                      <p className="text-[11px] text-[#5C7A9B] mt-0.5 line-clamp-1">{item.resumo}</p>
                    </div>

                    <ChevronRight className="h-4 w-4 text-[#C8D9ED] group-hover:text-[#1A3F72] transition-colors" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-[#F8FAFD] rounded-2xl border border-dashed border-[#C8D9ED]">
            <Activity className="h-12 w-12 text-[#C8D9ED] mb-4" />
            <h3 className="text-sm font-bold text-[#8FA8C4] uppercase tracking-widest text-center">
              {isSpecificPatient ? "Nenhum prontuário encontrado" : "Nenhum registro carregado"}
            </h3>
            <p className="text-xs text-[#8FA8C4] mt-2 text-center max-w-xs">
              {isSpecificPatient 
                ? "Este paciente ainda não possui evoluções clínicas registradas." 
                : "Busque o paciente por CPF para visualizar seu histórico médico completo."}
            </p>
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={dataToPaginate.length}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
};

export default FuncionarioHistoricoTab;
