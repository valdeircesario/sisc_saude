import React, { useState } from "react";
import { FileText, Calendar, Clock, Stethoscope, User } from "lucide-react";
import { Pagination } from "../UI/Pagination";

interface ConsultasTabProps {
  loadingConsultas: boolean;
  consultas: any[];
  formatConsultaDate: (date: any) => string;
  getConsultaDisease: (consulta: any) => string;
  setSelectedConsulta: (consulta: any) => void;
  setShowConsultaDetailsModal: (show: boolean) => void;
  setModalHistorico: (modal: { aberto: boolean; consulta: any }) => void;
}

const FuncionarioConsultasTab: React.FC<ConsultasTabProps> = ({
  loadingConsultas,
  consultas,
  formatConsultaDate,
  getConsultaDisease,
  setSelectedConsulta,
  setShowConsultaDetailsModal,
  setModalHistorico,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Paginação local
  const totalPages = Math.ceil((consultas?.length || 0) / itemsPerPage);
  const currentItems = consultas?.slice(
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
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF5EF] flex items-center justify-center border border-[#C8EBD9]">
              <Stethoscope className="h-5 w-5 text-[#145C35]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0F2242] tracking-tight">
                Agenda de Atendimentos
              </h2>
              <p className="text-xs text-[#8FA8C4]">
                Gerencie suas consultas e registros médicos.
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#F8FAFD] text-[#3A5B82] border border-[#E4EDF7]">
              {loadingConsultas ? "Sincronizando..." : `${consultas?.length || 0} Registros`}
            </span>
          </div>
        </div>

        {consultas && consultas.length > 0 ? (
          <div className="flex flex-col gap-3 min-h-[400px]">
            <div className="hidden lg:grid grid-cols-[1.5fr_1fr_1fr_auto] gap-4 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-[#8FA8C4] border-b border-[#EEF2F7]">
              <span>Paciente</span>
              <span>Data e Local</span>
              <span>Especialidade / CID</span>
              <span className="text-right px-4">Ações</span>
            </div>
            <div className="divide-y divide-[#F4F8FC]">
              {currentItems.map((consulta: any) => {
                const temHistorico = Boolean(consulta.historicoMedico?.id);

                return (
                  <div
                    key={consulta.id}
                    className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_1fr_auto] gap-4 items-center px-5 py-4 transition-all duration-200 hover:bg-[#F8FAFD] rounded-xl group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#F1F5F9] flex items-center justify-center border border-[#E2E8F0] group-hover:bg-[#fff] transition-colors">
                        <User className="h-4.5 w-4.5 text-[#64748B]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0F2242]">
                          {consulta.paciente?.nome || "Paciente não informado"}
                        </p>
                        <p className="text-[10px] font-bold text-[#8FA8C4]">
                          CPF: {consulta.paciente?.cpf || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#3A5B82]">
                        <Calendar className="h-3.5 w-3.5 text-[#1A3F72]" />
                        {formatConsultaDate(consulta.dataAgendada)}
                      </div>
                      <p className="text-[10px] font-medium text-[#8FA8C4] ml-5">
                        {consulta.ubs?.nome || "UBS Local"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-[#3A5B82]">
                        {consulta.especialidade || "Geral"}
                      </p>
                      <p className="text-[10px] font-medium text-[#8FA8C4]">
                        {getConsultaDisease(consulta)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end lg:pl-4">
                      <button
                        onClick={() => {
                          setSelectedConsulta(consulta);
                          setShowConsultaDetailsModal(true);
                        }}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-sm"
                        style={{ background: "#EBF2FB", color: "#1A3F72", border: "1px solid #C8D9ED" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#D5E7F7")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#EBF2FB")}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        {temHistorico ? "Ver Laudo" : "Ver Detalhes"}
                      </button>
                      {!temHistorico && (
                        <button
                          onClick={() =>
                            setModalHistorico({
                              aberto: true,
                              consulta,
                            })
                          }
                          className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-sm"
                          style={{ background: "#145C35", color: "#fff" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#0E4226")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "#145C35")}
                        >
                          + Atender
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-[#F8FAFD] rounded-2xl border border-dashed border-[#C8D9ED]">
            <Calendar className="h-12 w-12 text-[#C8D9ED] mb-4" />
            <p className="text-sm font-bold text-[#8FA8C4] uppercase tracking-widest text-center">Nenhuma consulta agendada</p>
            <p className="text-xs text-[#8FA8C4] mt-1">Sua agenda está livre para novos atendimentos.</p>
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={consultas?.length || 0}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
};

export default FuncionarioConsultasTab;
