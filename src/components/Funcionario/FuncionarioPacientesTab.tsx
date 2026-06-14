import React, { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search, FileText, Building2, Shield, Heart, Users } from "lucide-react";
import { Pagination } from "../UI/Pagination";

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Paginação local
  const totalPages = Math.ceil((pacientes?.length || 0) / itemsPerPage);
  const currentItems = pacientes?.slice(
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
              <Users className="h-5 w-5 text-[#1A3F72]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0F2242] tracking-tight">
                Gestão de Pacientes
              </h2>
              <p className="text-xs text-[#8FA8C4]">
                Consulte a base de dados e realize ações clínicas.
              </p>
            </div>
          </div>
          <div className="relative md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[#8FA8C4]" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 text-sm text-[#1A2E4A] placeholder-[#8FA8C4] rounded-lg outline-none transition-all shadow-sm"
              style={{
                border: "1px solid #C8D9ED",
                background: "#F4F8FC",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#1A3F72";
                e.target.style.background = "#fff";
                e.target.style.boxShadow = "0 0 0 4px rgba(26,63,114,0.05)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#C8D9ED";
                e.target.style.background = "#F4F8FC";
                e.target.style.boxShadow = "none";
              }}
              placeholder="Buscar por nome, CPF ou CNS..."
            />
          </div>
        </div>

        {loadingPacientes ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#C8D9ED] border-t-[#1A3F72] mx-auto"></div>
            <p className="mt-4 text-sm font-medium text-[#5C7A9B]">Sincronizando pacientes...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 min-h-[400px]">
            {currentItems && currentItems.length > 0 ? (
              currentItems.map((paciente: any) => {
                const initials = paciente.nome
                  .split(" ")
                  .slice(0, 2)
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase();
                return (
                  <div
                    key={paciente.id}
                    className="flex flex-col lg:flex-row lg:items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 group"
                    style={{
                      border: "1px solid #E4EDF7",
                      background: "#FAFCFF",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#A8C4E0";
                      e.currentTarget.style.background = "#fff";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(26,63,114,0.06)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#E4EDF7";
                      e.currentTarget.style.background = "#FAFCFF";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm transition-transform group-hover:scale-105"
                        style={{ background: "#EBF2FB", color: "#1A3F72", border: "1px solid #C8D9ED" }}
                      >
                        {initials}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <h3 className="text-[15px] font-bold text-[#0F2242] truncate">
                          {paciente.nome}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] font-medium text-[#8FA8C4]">
                          <span className="flex items-center gap-1.5">
                            <span className="uppercase text-[9px] font-black tracking-wider text-[#3A5B82]/60">CPF</span>
                            <span className="text-[#3A5B82]">{paciente.cpf}</span>
                          </span>
                          <span className="w-1 h-1 rounded-full bg-[#D9E4F0]" />
                          <span className="flex items-center gap-1.5">
                            <span className="uppercase text-[9px] font-black tracking-wider text-[#3A5B82]/60">CNS</span>
                            <span className="text-[#3A5B82]">{paciente.cns}</span>
                          </span>
                          <span className="w-1 h-1 rounded-full bg-[#D9E4F0]" />
                          <span className="flex items-center gap-1.5">
                            <span className="uppercase text-[9px] font-black tracking-wider text-[#3A5B82]/60">Nasc.</span>
                            <span className="text-[#3A5B82]">
                              {format(new Date(paciente.nascimento), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#E4EDF7]">
                      {isMedico && (
                        <>
                          <button
                            onClick={() => openExameModal(paciente)}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                            style={{
                              background: "#F0EDFB",
                              color: "#4C3799",
                              border: "1px solid #DED7F7",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#E2DBF7";
                              e.currentTarget.style.transform = "translateY(-1px)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "#F0EDFB";
                              e.currentTarget.style.transform = "none";
                            }}
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Exame
                          </button>
                          <button
                            onClick={() => openInternacaoModal(paciente)}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                            style={{
                              background: "#FEF0F0",
                              color: "#8B1F1F",
                              border: "1px solid #FAD7D7",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#FADDDD";
                              e.currentTarget.style.transform = "translateY(-1px)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "#FEF0F0";
                              e.currentTarget.style.transform = "none";
                            }}
                          >
                            <Building2 className="h-3.5 w-3.5" />
                            Hosp.
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPaciente(paciente);
                              setActiveTab("historico");
                            }}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                            style={{
                              background: "#EBF2FB",
                              color: "#1A3F72",
                              border: "#C8D9ED 1px solid",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#D5E7F7";
                              e.currentTarget.style.transform = "translateY(-1px)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "#EBF2FB";
                              e.currentTarget.style.transform = "none";
                            }}
                          >
                            <Heart className="h-3.5 w-3.5" />
                            Prontuário
                          </button>
                        </>
                      )}
                      {isEnfermagemOuFarmacia && (
                        <>
                          <button
                            onClick={() => openVacinaModal(paciente)}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                            style={{
                              background: "#EAF5EF",
                              color: "#145C35",
                              border: "1px solid #C8EBD9",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#D5EDE0";
                              e.currentTarget.style.transform = "translateY(-1px)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "#EAF5EF";
                              e.currentTarget.style.transform = "none";
                            }}
                          >
                            <Shield className="h-3.5 w-3.5" />
                            Vacina
                          </button>
                          <button
                            type="button"
                            onClick={() => openAdministrarMedicamentoModal(paciente)}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                            style={{
                              background: "#EBF2FB",
                              color: "#1A3F72",
                              border: "1px solid #C8D9ED",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#D5E7F7";
                              e.currentTarget.style.transform = "translateY(-1px)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "#EBF2FB";
                              e.currentTarget.style.transform = "none";
                            }}
                          >
                            <Heart className="h-3.5 w-3.5" />
                            Medicamento
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-[#F8FAFD] rounded-2xl border border-dashed border-[#C8D9ED]">
                <Users className="h-12 w-12 text-[#C8D9ED] mb-4" />
                <p className="text-sm font-bold text-[#8FA8C4] uppercase tracking-widest">Nenhum paciente encontrado</p>
                <p className="text-xs text-[#8FA8C4] mt-1 text-center px-6">Tente ajustar seus termos de busca para localizar o registro.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={pacientes?.length || 0}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
};

export default FuncionarioPacientesTab;
