import React, { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ClipboardList, Filter, MapPin, Clock, ArrowRight } from "lucide-react";
import { Pagination } from "../UI/Pagination";

interface SolicitacoesTabProps {
  solicitacoesFiltroPaciente: string;
  setSolicitacoesFiltroPaciente: (val: string) => void;
  solicitacoesFiltroTipo: string;
  setSolicitacoesFiltroTipo: (val: string) => void;
  pacientesSolicitacoes: any[];
  filteredSolicitacoes: any[];
  getStatusColor: (status: string) => string;
  getPrioridadeColor: (prioridade: string) => string;
}

const FuncionarioSolicitacoesTab: React.FC<SolicitacoesTabProps> = ({
  solicitacoesFiltroPaciente,
  setSolicitacoesFiltroPaciente,
  solicitacoesFiltroTipo,
  setSolicitacoesFiltroTipo,
  pacientesSolicitacoes,
  filteredSolicitacoes,
  getStatusColor,
  getPrioridadeColor,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Paginação local
  const totalPages = Math.ceil((filteredSolicitacoes?.length || 0) / itemsPerPage);
  const currentItems = filteredSolicitacoes?.slice(
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
            <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] flex items-center justify-center border border-[#FED7AA]">
              <ClipboardList className="h-5 w-5 text-[#9A3412]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0F2242] tracking-tight">
                Solicitações Médicas
              </h2>
              <p className="text-xs text-[#8FA8C4]">
                Acompanhe exames e internações solicitados.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F8FAFD] border border-[#E4EDF7]">
            <Filter className="h-3.5 w-3.5 text-[#3A5B82]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#3A5B82]">Filtros Ativos</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-[#F8FAFD] rounded-2xl border border-[#E4EDF7]">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-widest text-[#8FA8C4] ml-1">
              Buscar Paciente
            </label>
            <input
              value={solicitacoesFiltroPaciente}
              onChange={(e) => setSolicitacoesFiltroPaciente(e.target.value)}
              list="pacientes-solicitacoes"
              placeholder="Digite o nome..."
              className="w-full px-3 py-2 text-sm text-[#1A2E4A] rounded-lg outline-none border border-[#C8D9ED] bg-white focus:border-[#1A3F72] transition-all"
            />
            <datalist id="pacientes-solicitacoes">
              {pacientesSolicitacoes.map((paciente: any) => (
                <option key={paciente.id} value={paciente.nome} />
              ))}
            </datalist>
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-widest text-[#8FA8C4] ml-1">
              Tipo de Solicitação
            </label>
            <select
              value={solicitacoesFiltroTipo}
              onChange={(e) => setSolicitacoesFiltroTipo(e.target.value)}
              className="w-full px-3 py-2 text-sm text-[#1A2E4A] rounded-lg outline-none border border-[#C8D9ED] bg-white focus:border-[#1A3F72] transition-all"
            >
              <option value="todos">Todos os tipos</option>
              <option value="internacao">Internação</option>
              <option value="exame">Exame</option>
            </select>
          </div>
        </div>

        {filteredSolicitacoes && filteredSolicitacoes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[400px]">
            {currentItems.map((solicitacao: any) => (
              <div
                key={`${solicitacao.solicitacaoTipo}-${solicitacao.id}`}
                className="rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all duration-200 group relative overflow-hidden"
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
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className="px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase border"
                      style={
                        solicitacao.solicitacaoTipo === "internacao"
                          ? { background: "#FEF0F0", color: "#8B1F1F", borderColor: "#FAD7D7" }
                          : { background: "#EBF2FB", color: "#1A3F72", borderColor: "#C8D9ED" }
                      }
                    >
                      {solicitacao.solicitacaoTipo === "internacao" ? "Internação" : "Exame"}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(solicitacao.status)}`}>
                      {solicitacao.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#0F2242] group-hover:text-[#1A3F72] transition-colors truncate">
                      {solicitacao.paciente?.nome || "Paciente não informado"}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-[#3A5B82]">
                      <ArrowRight className="h-3 w-3" />
                      {solicitacao.solicitacaoTipo === "internacao" ? solicitacao.tipo : solicitacao.tipoExame}
                    </div>
                  </div>

                  <div className="space-y-2 p-3 bg-white rounded-xl border border-[#EEF2F7]">
                    <div className="flex items-center gap-2 text-[11px] text-[#5C7A9B]">
                      <MapPin className="h-3.5 w-3.5 text-[#8FA8C4]" />
                      <span className="font-bold">{solicitacao.solicitacaoTipo === "internacao" ? solicitacao.hospital?.nome : solicitacao.laboratorio?.nome}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#5C7A9B]">
                      <Clock className="h-3.5 w-3.5 text-[#8FA8C4]" />
                      <span>{format(new Date(solicitacao.createdAt), "dd/MM/yyyy HH:mm")}</span>
                    </div>
                  </div>

                  {solicitacao.solicitacaoTipo === "internacao" && (
                    <div className="px-3 py-2 rounded-xl bg-[#F8FAFD] border border-[#E4EDF7]">
                      <p className="text-[9px] font-black text-[#8FA8C4] uppercase tracking-widest mb-1">Prioridade</p>
                      <span className={`text-[11px] font-black ${getPrioridadeColor(solicitacao.prioridade)}`}>
                        {solicitacao.prioridade}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-[#F8FAFD] rounded-2xl border border-dashed border-[#C8D9ED]">
            <ClipboardList className="h-12 w-12 text-[#C8D9ED] mb-4" />
            <p className="text-sm font-bold text-[#8FA8C4] uppercase tracking-widest text-center">Nenhuma solicitação encontrada</p>
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredSolicitacoes?.length || 0}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
};

export default FuncionarioSolicitacoesTab;
