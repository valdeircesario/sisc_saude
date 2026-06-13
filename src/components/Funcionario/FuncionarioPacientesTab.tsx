import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search, FileText, Building2, Shield, Heart } from "lucide-react";

interface FuncionarioPacientesTabProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  loadingPacientes: boolean;
  pacientes: any[];
  isMedico: boolean;
  openExameModal: (paciente: any) => void;
  openInternacaoModal: (paciente: any) => void;
  setSelectedPaciente: (paciente: any) => void;
  setActiveTab: (tab: string) => void;
  isEnfermagemOuFarmacia: boolean;
  openVacinaModal: (paciente: any) => void;
  openAdministrarMedicamentoModal: (paciente: any) => void;
}

const FuncionarioPacientesTab: React.FC<FuncionarioPacientesTabProps> = ({
  searchTerm,
  setSearchTerm,
  loadingPacientes,
  pacientes,
  isMedico,
  openExameModal,
  openInternacaoModal,
  setSelectedPaciente,
  setActiveTab,
  isEnfermagemOuFarmacia,
  openVacinaModal,
  openAdministrarMedicamentoModal,
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
          Pacientes
        </h2>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#8FA8C4]" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 text-sm text-[#1A2E4A] placeholder-[#8FA8C4] rounded-lg outline-none transition-all"
            style={{
              border: "1px solid #C8D9ED",
              background: "#F4F8FC",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#1A3F72";
              e.target.style.background = "#fff";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#C8D9ED";
              e.target.style.background = "#F4F8FC";
            }}
            placeholder="Buscar por nome, CPF ou CNS..."
          />
        </div>
      </div>

      {loadingPacientes ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-7 w-7 border-2 border-[#C8D9ED] border-t-[#1A3F72] mx-auto"></div>
          <p className="mt-3 text-sm text-[#8FA8C4]">Carregando...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {pacientes?.map((paciente: any) => {
            const initials = paciente.nome
              .split(" ")
              .slice(0, 2)
              .map((n: string) => n[0])
              .join("")
              .toUpperCase();
            return (
              <div
                key={paciente.id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150"
                style={{
                  border: "1px solid #E4EDF7",
                  background: "#FAFCFF",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#A8C4E0";
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(26,63,114,0.07)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#E4EDF7";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Avatar */}
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs"
                  style={{ background: "#EBF2FB", color: "#1A3F72" }}
                >
                  {initials}
                </div>

                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  {/* Linha 1 — dados */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-sm font-semibold text-[#0F2242] whitespace-nowrap">
                      {paciente.nome}
                    </span>
                    <span className="w-px h-3 bg-[#D9E4F0] hidden sm:block" />
                    <span className="text-xs text-[#8FA8C4] whitespace-nowrap">
                      CPF{" "}
                      <span className="text-[#3A5B82] font-medium">
                        {paciente.cpf}
                      </span>
                    </span>
                    <span className="text-xs text-[#8FA8C4] whitespace-nowrap">
                      CNS{" "}
                      <span className="text-[#3A5B82] font-medium">
                        {paciente.cns}
                      </span>
                    </span>
                    <span className="text-xs text-[#8FA8C4] whitespace-nowrap">
                      Tel{" "}
                      <span className="text-[#3A5B82] font-medium">
                        {paciente.telefone}
                      </span>
                    </span>
                    <span className="text-xs text-[#8FA8C4] whitespace-nowrap">
                      Nasc.{" "}
                      <span className="text-[#3A5B82] font-medium">
                        {format(
                          new Date(paciente.nascimento),
                          "dd/MM/yyyy",
                          { locale: ptBR },
                        )}
                      </span>
                    </span>
                  </div>

                  {/* Linha 2 — botões */}
                  <div className="flex flex-wrap items-center gap-2">
                    {isMedico && (
                      <>
                        <button
                          onClick={() => openExameModal(paciente)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all"
                          style={{
                            background: "#F0EDFB",
                            color: "#4C3799",
                            border: "1px solid #C9C0F0",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#E2DBF7")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "#F0EDFB")
                          }
                        >
                          <FileText className="h-3 w-3" />
                          Solicitar Exame
                        </button>
                        <button
                          onClick={() => openInternacaoModal(paciente)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all"
                          style={{
                            background: "#FEF0F0",
                            color: "#8B1F1F",
                            border: "1px solid #F0C0C0",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#FADDDD")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "#FEF0F0")
                          }
                        >
                          <Building2 className="h-3 w-3" />
                          Solicitar Internação
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPaciente(paciente);
                            setActiveTab("historico");
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all"
                          style={{
                            background: "#F0F4F8",
                            color: "#4A6280",
                            border: "1px solid #C8D9ED",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#E0EAF4")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "#F0F4F8")
                          }
                        >
                          <FileText className="h-3 w-3" />
                          Ver histórico
                        </button>
                      </>
                    )}
                    {isEnfermagemOuFarmacia && (
                      <>
                        <button
                          onClick={() => openVacinaModal(paciente)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all"
                          style={{
                            background: "#EAF5EF",
                            color: "#145C35",
                            border: "1px solid #B0D9C0",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#D5EDE0")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "#EAF5EF")
                          }
                        >
                          <Shield className="h-3 w-3" />
                          Vacina
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            openAdministrarMedicamentoModal(paciente)
                          }
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all"
                          style={{
                            background: "#EBF2FB",
                            color: "#1A3F72",
                            border: "1px solid #C0D6EE",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#D5E7F7")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "#EBF2FB")
                          }
                        >
                          <Heart className="h-3 w-3" />
                          Ministrar Medicamento
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FuncionarioPacientesTab;
