import React from "react";
import { FileText } from "lucide-react";

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
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "#fff",
        border: "1px solid #D9E4F0",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold text-[#0F2242] tracking-tight">
          Minhas Consultas
        </h2>
        <p className="text-xs text-[#8FA8C4]">
          {loadingConsultas
            ? "Atualizando..."
            : `${consultas?.length || 0} consulta(s) encontrada(s)`}
        </p>
      </div>

      {consultas && consultas.length > 0 ? (
        <div
          className="overflow-hidden rounded-xl border"
          style={{ borderColor: "#E4EDF7" }}
        >
          <div className="grid grid-cols-[1.8fr_1.2fr_1fr_auto] gap-3 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] bg-[#F8FAFD]">
            <span>Paciente</span>
            <span>Data da realização</span>
            <span>Doença</span>
            <span className="text-right">Ações</span>
          </div>
          <div className="divide-y" style={{ borderColor: "#E4EDF7" }}>
            {consultas.map((consulta: any) => {
              const temHistorico = Boolean(consulta.historicoMedico?.id);

              return (
                <div
                  key={consulta.id}
                  className="grid grid-cols-[1.8fr_1.2fr_1fr_auto] gap-3 items-center px-4 py-3 bg-white"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#0F2242]">
                      {consulta.paciente?.nome || "Paciente não informado"}
                    </p>
                    <p className="text-xs text-[#8FA8C4]">
                      CPF: {consulta.paciente?.cpf || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#3A5B82]">
                      {formatConsultaDate(consulta.dataAgendada)}
                    </p>
                    <p className="text-xs text-[#8FA8C4]">
                      {consulta.ubs?.nome || "Local não informado"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#3A5B82]">
                      {getConsultaDisease(consulta)}
                    </p>
                    <p className="text-xs text-[#8FA8C4]">
                      {consulta.especialidade || "Especialidade não informada"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {temHistorico ? (
                      <button
                        onClick={() => {
                          setSelectedConsulta(consulta);
                          setShowConsultaDetailsModal(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
                        style={{ background: "#1A3F72" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#0F2A52")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "#1A3F72")
                        }
                      >
                        <FileText className="h-3 w-3" />
                        Ver detalhes da consulta
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setSelectedConsulta(consulta);
                            setShowConsultaDetailsModal(true);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
                          style={{ background: "#1A3F72" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#0F2A52")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "#1A3F72")
                          }
                        >
                          <FileText className="h-3 w-3" />
                          Visualizar consulta
                        </button>
                        <button
                          onClick={() =>
                            setModalHistorico({
                              aberto: true,
                              consulta,
                            })
                          }
                          className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
                          style={{ background: "#145C35" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#0E4226")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "#145C35")
                          }
                        >
                          + Registrar histórico
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="h-10 w-10 mx-auto mb-3 text-[#C8D9ED]" />
          <p className="text-sm text-[#8FA8C4]">Nenhuma consulta encontrada.</p>
        </div>
      )}
    </div>
  );
};

export default FuncionarioConsultasTab;
